<?php
// 《源泉鎮 Source Town》V3.0 Phase 1 - Token 用量與配額管理
// 設計：採「先預留、後結算」避免併發超額；所有限制由後端強制執行。
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
            $stmt = $this->pdo->query("SHOW TABLES LIKE 'ai_usage_daily'");
            return $stmt !== false && $stmt->fetchColumn() !== false;
        } catch (Throwable) {
            return false;
        }
    }

    /**
     * 預留本次請求的 Token 與次數。失敗時丟出 AiException（429/503）。
     *
     * @return array{date:string,estimated_tokens:int,reserved_tokens:int}
     */
    public function reserve(string $subjectId, int $estimatedInputTokens, int $maxOutputTokens): array
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
        $reserved = $estimatedInputTokens + max(0, $maxOutputTokens);
        $today = date('Y-m-d');

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
     * 依 Provider 回傳的實際 usage 結算，並釋放預留額。
     */
    public function settle(
        string $subjectId,
        string $usageDate,
        int $reservedTokens,
        int $promptTokens,
        int $completionTokens
    ): void {
        $promptTokens = max(0, $promptTokens);
        $completionTokens = max(0, $completionTokens);
        $total = $promptTokens + $completionTokens;
        $reservedTokens = max(0, $reservedTokens);

        try {
            $stmt = $this->pdo->prepare(
                'UPDATE ai_usage_daily
                 SET reserved_tokens = GREATEST(0, reserved_tokens - ?),
                     prompt_tokens = prompt_tokens + ?,
                     completion_tokens = completion_tokens + ?,
                     total_tokens = total_tokens + ?,
                     updated_at = NOW()
                 WHERE subject_id = ? AND usage_date = ?'
            );
            $stmt->execute([$reservedTokens, $promptTokens, $completionTokens, $total, $subjectId, $usageDate]);
        } catch (Throwable $e) {
            throw new AiException('AI_STORAGE_ERROR', 'AI 用量結算失敗', 503, $e->getMessage());
        }
    }

    /**
     * 請求失敗時只釋放預留 Token；請求次數仍保留作為防濫用紀錄。
     */
    public function release(string $subjectId, string $usageDate, int $reservedTokens): void
    {
        $reservedTokens = max(0, $reservedTokens);
        if ($reservedTokens === 0) {
            return;
        }

        try {
            $stmt = $this->pdo->prepare(
                'UPDATE ai_usage_daily
                 SET reserved_tokens = GREATEST(0, reserved_tokens - ?),
                     updated_at = NOW()
                 WHERE subject_id = ? AND usage_date = ?'
            );
            $stmt->execute([$reservedTokens, $subjectId, $usageDate]);
        } catch (Throwable $e) {
            error_log('[SourceTown AI] release reservation failed: ' . $e->getMessage());
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
            'SELECT COUNT(*) FROM ai_request_logs
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
