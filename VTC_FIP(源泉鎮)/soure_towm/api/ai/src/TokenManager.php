<?php
// 《源泉鎮 Source Town》V3.0 Phase 1 Stabilization - Token 用量、併發限流與冪等結算管理
// 設計：
//   1. 以 ai_usage_daily + ai_reservations 採「交易鎖定預留 + 冪等結算/釋放」。
//   2. 每分鐘限流於交易內統計 ai_reservations（含進行中 RESERVED 請求），杜絕併發繞過。
//   3. settle() 與 release() 均依 reservation_id 冪等執行，防止重複扣款或重複退款。
declare(strict_types=1);

namespace SourceTown\AI;

use PDO;
use SourceTown\AI\Support\TokenEstimator;
use Throwable;

final class TokenManager
{
    private PDO $pdo;
    private AiConfig $config;

    public function __construct(PDO $pdo, AiConfig $config)
    {
        $this->pdo = $pdo;
        $this->config = $config;
    }

    public function tableReady(): bool
    {
        try {
            $stmt1 = $this->pdo->query("SHOW TABLES LIKE 'ai_usage_daily'");
            $stmt2 = $this->pdo->query("SHOW TABLES LIKE 'ai_reservations'");
            return $stmt1 !== false && $stmt1->fetchColumn() !== false
                && $stmt2 !== false && $stmt2->fetchColumn() !== false;
        } catch (Throwable) {
            return false;
        }
    }

    /**
     * 預留本次請求的 Token 與次數。失敗時丟出 AiException（429/503）。
     *
     * @return array{reservation_id:string,date:string,estimated_tokens:int,reserved_tokens:int}
     */
    public function reserve(string $subjectId, int $estimatedInputTokens, int $maxOutputTokens, ?string $reservationId = null): array
    {
        if (!$this->tableReady()) {
            throw new AiException(
                'AI_STORAGE_NOT_READY',
                'AI 用量資料表尚未建立，請先執行 Phase 1 SQL Migration',
                503
            );
        }

        if ($this->pdo->inTransaction()) {
            throw new AiException('AI_INTERNAL_ERROR', 'AI 用量管理不可在外部交易中執行', 500);
        }

        $estimatedInputTokens = max(0, $estimatedInputTokens);
        $maxOutputTokens = max(0, $maxOutputTokens);
        $reserved = $estimatedInputTokens + $maxOutputTokens;
        $today = date('Y-m-d');
        $resId = ($reservationId !== null && $reservationId !== '') ? substr($reservationId, 0, 32) : bin2hex(random_bytes(16));

        try {
            $this->pdo->beginTransaction();

            $init = $this->pdo->prepare(
                'INSERT INTO ai_usage_daily (subject_id, usage_date, request_count, reserved_tokens, total_tokens)
                 VALUES (?, ?, 0, 0, 0)
                 ON DUPLICATE KEY UPDATE usage_date = usage_date'
            );
            $init->execute([$subjectId, $today]);

            $stmt = $this->pdo->prepare(
                'SELECT request_count, reserved_tokens, total_tokens
                 FROM ai_usage_daily
                 WHERE subject_id = ? AND usage_date = ?
                 FOR UPDATE'
            );
            $stmt->execute([$subjectId, $today]);
            $row = $stmt->fetch();
            if (!$row) {
                throw new AiException('AI_STORAGE_NOT_READY', '無法建立 AI 用量紀錄', 503);
            }

            $requestCount = (int)$row['request_count'];
            $reservedSum = (int)$row['reserved_tokens'];
            $totalTokens = (int)$row['total_tokens'];

            $dailyRequestQuota = $this->config->getInt('daily_request_quota');
            if ($requestCount + 1 > $dailyRequestQuota) {
                throw new AiException(
                    'AI_DAILY_REQUEST_QUOTA_EXCEEDED',
                    '今日 AI 對話次數已達上限，請明日再試',
                    429,
                    null,
                    self::secondsUntilTomorrow()
                );
            }

            $dailyTokenQuota = $this->config->getInt('daily_token_quota');
            if ($totalTokens + $reservedSum + $reserved > $dailyTokenQuota) {
                throw new AiException(
                    'AI_DAILY_TOKEN_QUOTA_EXCEEDED',
                    '今日 AI Token 額度已用盡，請明日再試',
                    429,
                    null,
                    self::secondsUntilTomorrow()
                );
            }

            // 於交易鎖定內統計過去 60 秒之預留紀錄（含進行中請求），防止併發繞過限流
            $perMinute = $this->config->getInt('max_requests_per_minute');
            if ($perMinute > 0 && $this->requestCountLastMinute($subjectId) >= $perMinute) {
                throw new AiException(
                    'AI_RATE_LIMITED',
                    'AI 請求過於頻繁，請稍後再試',
                    429,
                    null,
                    60
                );
            }

            $insRes = $this->pdo->prepare(
                'INSERT INTO ai_reservations
                 (reservation_id, subject_id, usage_date, estimated_input_tokens, max_output_tokens, reserved_tokens, status)
                 VALUES (?, ?, ?, ?, ?, ?, \'RESERVED\')'
            );
            $insRes->execute([$resId, $subjectId, $today, $estimatedInputTokens, $maxOutputTokens, $reserved]);

            $update = $this->pdo->prepare(
                'UPDATE ai_usage_daily
                 SET request_count = request_count + 1,
                     reserved_tokens = reserved_tokens + ?,
                     updated_at = NOW()
                 WHERE subject_id = ? AND usage_date = ?'
            );
            $update->execute([$reserved, $subjectId, $today]);

            $this->pdo->commit();

            return [
                'reservation_id' => $resId,
                'date' => $today,
                'estimated_tokens' => $estimatedInputTokens,
                'reserved_tokens' => $reserved,
            ];
        } catch (AiException $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw new AiException('AI_STORAGE_ERROR', 'AI 用量管理暫時無法使用', 503, $e->getMessage());
        }
    }

    /**
     * 依 Provider 回傳的實際 usage 冪等結算，並釋放預留額。
     */
    public function settle(
        string $subjectId,
        string $usageDate,
        int $reservedTokens,
        int $promptTokens,
        int $completionTokens,
        ?string $reservationId = null
    ): bool {
        $promptTokens = max(0, $promptTokens);
        $completionTokens = max(0, $completionTokens);
        $total = $promptTokens + $completionTokens;
        $reservedTokens = max(0, $reservedTokens);

        try {
            $this->pdo->beginTransaction();

            if ($reservationId !== null && $reservationId !== '') {
                $resStmt = $this->pdo->prepare(
                    'SELECT status, reserved_tokens FROM ai_reservations WHERE reservation_id = ? FOR UPDATE'
                );
                $resStmt->execute([$reservationId]);
                $resRow = $resStmt->fetch();
                if (!$resRow || $resRow['status'] !== 'RESERVED') {
                    // 冪等保護：已結算或已釋放則不重複處理
                    $this->pdo->commit();
                    return false;
                }
                $reservedTokens = max(0, (int)$resRow['reserved_tokens']);

                $markStmt = $this->pdo->prepare(
                    'UPDATE ai_reservations
                     SET status = \'SETTLED\',
                         actual_prompt_tokens = ?,
                         actual_completion_tokens = ?,
                         settled_at = NOW()
                     WHERE reservation_id = ? AND status = \'RESERVED\''
                );
                $markStmt->execute([$promptTokens, $completionTokens, $reservationId]);
            }

            $stmt = $this->pdo->prepare(
                'UPDATE ai_usage_daily
                 SET reserved_tokens = GREATEST(0, CAST(reserved_tokens AS SIGNED) - ?),
                     prompt_tokens = prompt_tokens + ?,
                     completion_tokens = completion_tokens + ?,
                     total_tokens = total_tokens + ?,
                     updated_at = NOW()
                 WHERE subject_id = ? AND usage_date = ?'
            );
            $stmt->execute([$reservedTokens, $promptTokens, $completionTokens, $total, $subjectId, $usageDate]);

            $this->pdo->commit();
            return true;
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw new AiException('AI_STORAGE_ERROR', 'AI 用量結算失敗', 503, $e->getMessage());
        }
    }

    /**
     * 請求失敗時冪等釋放預留 Token；請求次數仍保留作為防濫用紀錄。
     */
    public function release(string $subjectId, string $usageDate, int $reservedTokens, ?string $reservationId = null): bool
    {
        $reservedTokens = max(0, $reservedTokens);

        try {
            $this->pdo->beginTransaction();

            if ($reservationId !== null && $reservationId !== '') {
                $resStmt = $this->pdo->prepare(
                    'SELECT status, reserved_tokens FROM ai_reservations WHERE reservation_id = ? FOR UPDATE'
                );
                $resStmt->execute([$reservationId]);
                $resRow = $resStmt->fetch();
                if (!$resRow || $resRow['status'] !== 'RESERVED') {
                    $this->pdo->commit();
                    return false;
                }
                $reservedTokens = max(0, (int)$resRow['reserved_tokens']);

                $markStmt = $this->pdo->prepare(
                    'UPDATE ai_reservations
                     SET status = \'RELEASED\',
                         settled_at = NOW()
                     WHERE reservation_id = ? AND status = \'RESERVED\''
                );
                $markStmt->execute([$reservationId]);
            }

            if ($reservedTokens > 0) {
                $stmt = $this->pdo->prepare(
                    'UPDATE ai_usage_daily
                     SET reserved_tokens = GREATEST(0, CAST(reserved_tokens AS SIGNED) - ?),
                         updated_at = NOW()
                     WHERE subject_id = ? AND usage_date = ?'
                );
                $stmt->execute([$reservedTokens, $subjectId, $usageDate]);
            }

            $this->pdo->commit();
            return true;
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            error_log('[SourceTown AI] release reservation failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * @return array<string,int|string>|null
     */
    public function usage(string $subjectId, ?string $date = null): ?array
    {
        $date = $date ?? date('Y-m-d');
        try {
            $stmt = $this->pdo->prepare(
                'SELECT request_count, reserved_tokens, prompt_tokens, completion_tokens, total_tokens
                 FROM ai_usage_daily WHERE subject_id = ? AND usage_date = ? LIMIT 1'
            );
            $stmt->execute([$subjectId, $date]);
            $row = $stmt->fetch();
            if (!$row) {
                return [
                    'date' => $date,
                    'request_count' => 0,
                    'reserved_tokens' => 0,
                    'prompt_tokens' => 0,
                    'completion_tokens' => 0,
                    'total_tokens' => 0,
                ];
            }
            return [
                'date' => $date,
                'request_count' => (int)$row['request_count'],
                'reserved_tokens' => (int)$row['reserved_tokens'],
                'prompt_tokens' => (int)$row['prompt_tokens'],
                'completion_tokens' => (int)$row['completion_tokens'],
                'total_tokens' => (int)$row['total_tokens'],
            ];
        } catch (Throwable) {
            return null;
        }
    }

    public static function estimateInput(string $text): int
    {
        return TokenEstimator::estimateText($text);
    }

    private function requestCountLastMinute(string $subjectId): int
    {
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(*) FROM ai_reservations
             WHERE subject_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 60 SECOND)'
        );
        $stmt->execute([$subjectId]);
        return (int)$stmt->fetchColumn();
    }

    private static function secondsUntilTomorrow(): int
    {
        $now = new \DateTimeImmutable('now');
        $tomorrow = $now->setTime(0, 0)->modify('+1 day');
        return max(1, $tomorrow->getTimestamp() - $now->getTimestamp());
    }
}
