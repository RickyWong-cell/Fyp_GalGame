<?php
// 《源泉鎮 Source Town》V3.0 Phase 1 - OpenAI 相容 Provider
// 支援 OpenAI / DeepSeek / OpenRouter / Ollama 等相容 /chat/completions 的服務。
declare(strict_types=1);

namespace SourceTown\AI\Provider;

use SourceTown\AI\AiConfig;
use SourceTown\AI\AiException;
use SourceTown\AI\Support\HttpClient;
use SourceTown\AI\Support\TokenEstimator;

final class OpenAiCompatibleProvider implements ProviderInterface
{
    private AiConfig $config;
    private HttpClient $http;

    public function __construct(AiConfig $config, HttpClient $http)
    {
        $this->config = $config;
        $this->http = $http;
    }

    public function name(): string
    {
        return $this->config->provider();
    }

    public function chat(array $messages, array $options = []): array
    {
        $url = $this->config->baseUrl() . '/chat/completions';
        $headers = [];
        $apiKey = $this->config->apiKey();
        if ($apiKey !== '') {
            $headers['Authorization'] = 'Bearer ' . $apiKey;
        }

        $payload = [
            'model' => $this->config->model(),
            'messages' => $messages,
            'temperature' => self::clampFloat($options['temperature'] ?? 0.7, 0.0, 2.0),
            'max_tokens' => max(1, (int)($options['max_output_tokens'] ?? 500)),
            'stream' => false,
        ];

        $usedJsonFormat = false;
        if (!empty($options['response_format_json'])) {
            $payload['response_format'] = ['type' => 'json_object'];
            $usedJsonFormat = true;
        }

        $response = $this->http->postJsonWithRetry($url, $headers, $payload);
        $status = (int)$response['status'];
        $rawBody = (string)$response['body'];
        $jsonFallback = false;

        if ($usedJsonFormat && in_array($status, [400, 422], true)) {
            $lowerBody = strtolower($rawBody);
            if (
                str_contains($lowerBody, 'response_format')
                || str_contains($lowerBody, 'json_object')
                || str_contains($lowerBody, 'unsupported')
            ) {
                unset($payload['response_format']);
                $response = $this->http->postJsonWithRetry($url, $headers, $payload);
                $status = (int)$response['status'];
                $rawBody = (string)$response['body'];
                $jsonFallback = true;
            }
        }

        if ($status < 200 || $status >= 300) {
            throw $this->mapHttpError($status, $rawBody, $response['headers']);
        }

        try {
            $data = json_decode($rawBody, true, 64, JSON_THROW_ON_ERROR);
        } catch (\Throwable $e) {
            throw new AiException('AI_PROVIDER_BAD_RESPONSE', 'AI 服務回應格式錯誤', 502, $e->getMessage());
        }

        if (!is_array($data)) {
            throw new AiException('AI_PROVIDER_BAD_RESPONSE', 'AI 服務回應格式錯誤', 502);
        }

        $choice = $data['choices'][0] ?? null;
        if (!is_array($choice)) {
            throw new AiException(
                'AI_PROVIDER_BAD_RESPONSE',
                'AI 服務未回傳有效內容',
                502,
                self::providerErrorDetail($data)
            );
        }

        $finishReason = isset($choice['finish_reason']) ? (string)$choice['finish_reason'] : null;
        if ($finishReason === 'content_filter') {
            throw new AiException('AI_CONTENT_FILTERED', 'AI 服務基於內容政策拒絕回應', 422);
        }

        $content = self::extractContent($choice['message']['content'] ?? null);
        if ($content === '') {
            throw new AiException(
                'AI_PROVIDER_BAD_RESPONSE',
                'AI 服務回傳空白內容',
                502,
                self::providerErrorDetail($data)
            );
        }

        if (mb_strlen($content, 'UTF-8') > 20000) {
            throw new AiException('AI_PROVIDER_BAD_RESPONSE', 'AI 服務回應長度異常', 502);
        }

        $usage = is_array($data['usage'] ?? null) ? $data['usage'] : [];
        $promptTokens = (int)($usage['prompt_tokens'] ?? 0);
        $completionTokens = (int)($usage['completion_tokens'] ?? 0);
        $estimated = false;

        if ($promptTokens <= 0 || $completionTokens <= 0) {
            $estimated = true;
            if ($promptTokens <= 0) {
                $promptTokens = TokenEstimator::estimateMessages($messages);
            }
            if ($completionTokens <= 0) {
                $completionTokens = TokenEstimator::estimateText($content);
            }
        }

        return [
            'content' => $content,
            'finish_reason' => $finishReason,
            'model' => (string)($data['model'] ?? $this->config->model()),
            'usage' => [
                'prompt_tokens' => max(0, $promptTokens),
                'completion_tokens' => max(0, $completionTokens),
                'total_tokens' => max(0, $promptTokens + $completionTokens),
                'estimated' => $estimated,
            ],
            'provider_request_id' => isset($response['headers']['x-request-id'])
                ? (string)$response['headers']['x-request-id']
                : null,
            'json_fallback' => $jsonFallback,
            'latency_ms' => (int)$response['latency_ms'],
        ];
    }

    private function mapHttpError(int $status, string $body, array $headers): AiException
    {
        $detail = self::extractProviderError($body);
        $retryAfter = isset($headers['retry-after']) ? (int)$headers['retry-after'] : null;

        return match (true) {
            $status === 400 => new AiException('AI_PROVIDER_BAD_REQUEST', 'AI 服務拒絕了本次請求', 502, $detail),
            $status === 401 || $status === 403 => new AiException('AI_PROVIDER_AUTH_ERROR', 'AI 服務驗證失敗，請聯絡管理員', 502, $detail),
            $status === 404 => new AiException('AI_PROVIDER_MODEL_NOT_FOUND', 'AI 模型或端點不存在，請聯絡管理員', 502, $detail),
            $status === 408 => new AiException('AI_PROVIDER_TIMEOUT', 'AI 服務回應逾時，請稍後再試', 504, $detail, null, true),
            $status === 429 => new AiException('AI_PROVIDER_RATE_LIMITED', 'AI 服務流量擁塞，請稍後再試', 503, $detail, $retryAfter, true),
            $status >= 500 => new AiException('AI_PROVIDER_UNAVAILABLE', 'AI 服務暫時無法使用，請稍後再試', 503, $detail, $retryAfter, true),
            default => new AiException('AI_PROVIDER_ERROR', 'AI 服務發生錯誤', 502, $detail),
        };
    }

    private static function extractContent(mixed $content): string
    {
        if (is_string($content)) {
            return trim($content);
        }

        // 部分相容 API 會回傳 content parts 陣列。
        if (is_array($content)) {
            $parts = [];
            foreach ($content as $part) {
                if (is_string($part)) {
                    $parts[] = $part;
                } elseif (is_array($part) && isset($part['text']) && is_string($part['text'])) {
                    $parts[] = $part['text'];
                }
            }
            return trim(implode('', $parts));
        }

        return '';
    }

    private static function extractProviderError(string $body): ?string
    {
        try {
            $data = json_decode($body, true, 16, JSON_THROW_ON_ERROR);
        } catch (\Throwable) {
            return null;
        }

        if (!is_array($data)) {
            return null;
        }

        $message = $data['error']['message'] ?? $data['message'] ?? null;
        if (!is_string($message)) {
            return null;
        }

        $message = trim(preg_replace('/\s+/', ' ', $message) ?? '');
        return mb_substr($message, 0, 500, 'UTF-8');
    }

    private static function providerErrorDetail(array $data): ?string
    {
        $message = $data['error']['message'] ?? null;
        return is_string($message) ? mb_substr($message, 0, 500, 'UTF-8') : null;
    }

    private static function clampFloat(mixed $value, float $min, float $max): float
    {
        $number = is_numeric($value) ? (float)$value : 0.7;
        return max($min, min($max, $number));
    }
}
