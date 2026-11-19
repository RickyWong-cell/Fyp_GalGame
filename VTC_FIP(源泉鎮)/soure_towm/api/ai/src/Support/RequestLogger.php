<?php
// 《源泉鎮 Source Town》V3.0 Phase 1 - AI 請求審計 Logger
// 預設只記錄雜湊與用量，不儲存完整對話內容，降低隱私風險。
declare(strict_types=1);

namespace SourceTown\AI\Support;

use PDO;
use SourceTown\AI\AiConfig;
use Throwable;

final class RequestLogger
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
            $stmt = $this->pdo->query("SHOW TABLES LIKE 'ai_request_logs'");
            return $stmt !== false && $stmt->fetchColumn() !== false;
        } catch (Throwable) {
            return false;
        }
    }

    /**
     * @param array<string,mixed> $entry
     */
    public function log(array $entry): bool
    {
        try {
            $promptHash = null;
            $responseHash = null;
            if ($this->config->getBool('log_prompt_hashes')) {
                $prompt = (string)($entry['prompt'] ?? '');
                $reply = (string)($entry['reply'] ?? '');
                $promptHash = $prompt !== '' ? hash('sha256', $prompt) : null;
                $responseHash = $reply !== '' ? hash('sha256', $reply) : null;
            }

            $stmt = $this->pdo->prepare(
                'INSERT INTO ai_request_logs
                 (request_id, subject_id, role, intent, agent_id, provider, model, status, error_code,
                  prompt_tokens, completion_tokens, total_tokens, estimated_tokens, latency_ms,
                  ip_hash, prompt_hash, response_hash)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                self::clip((string)($entry['request_id'] ?? ''), 32),
                self::clip((string)($entry['subject_id'] ?? ''), 64),
                self::clip((string)($entry['role'] ?? 'guest'), 16),
                self::clip((string)($entry['intent'] ?? ''), 32),
                self::clip((string)($entry['agent_id'] ?? ''), 64),
                self::clip((string)($entry['provider'] ?? ''), 32),
                self::clip((string)($entry['model'] ?? ''), 100),
                ((string)($entry['status'] ?? 'ERROR')) === 'SUCCESS' ? 'SUCCESS' : 'ERROR',
                isset($entry['error_code']) ? self::clip((string)$entry['error_code'], 64) : null,
                max(0, (int)($entry['prompt_tokens'] ?? 0)),
                max(0, (int)($entry['completion_tokens'] ?? 0)),
                max(0, (int)($entry['total_tokens'] ?? 0)),
                max(0, (int)($entry['estimated_tokens'] ?? 0)),
                max(0, (int)($entry['latency_ms'] ?? 0)),
                self::ipHash(),
                $promptHash,
                $responseHash,
            ]);
            return true;
        } catch (Throwable $e) {
            // 審計寫入失敗不可外洩細節，但需留下伺服器端痕跡。
            error_log('[SourceTown AI] request log failed: ' . $e->getMessage());
            return false;
        }
    }

    private static function clip(string $value, int $maxLength): string
    {
        if (mb_strlen($value, 'UTF-8') <= $maxLength) {
            return $value;
        }
        return mb_substr($value, 0, $maxLength, 'UTF-8');
    }

    private static function ipHash(): ?string
    {
        $ip = (string)($_SERVER['REMOTE_ADDR'] ?? '');
        if ($ip === '') {
            return null;
        }
        return hash('sha256', 'source-town-ai|' . $ip);
    }
}
