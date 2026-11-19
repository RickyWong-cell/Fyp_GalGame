<?php
// 《源泉鎮 Source Town》V3.0 Phase 1 - 伺服器端 HTTP Client
// 安全原則：不跟隨 redirect、限制回應大小、強制 TLS、金鑰只放在 header。
declare(strict_types=1);

namespace SourceTown\AI\Support;

use SourceTown\AI\AiException;

class HttpClient
{
    private int $timeoutSeconds;
    private int $connectTimeoutSeconds;
    private int $maxResponseBytes;
    private int $maxRetries;
    private int $retryBackoffMs;
    private bool $verifyTls;

    public function __construct(
        int $timeoutSeconds = 20,
        int $connectTimeoutSeconds = 5,
        int $maxResponseBytes = 1048576,
        int $maxRetries = 2,
        int $retryBackoffMs = 400,
        bool $verifyTls = true
    ) {
        $this->timeoutSeconds = $timeoutSeconds;
        $this->connectTimeoutSeconds = $connectTimeoutSeconds;
        $this->maxResponseBytes = $maxResponseBytes;
        $this->maxRetries = $maxRetries;
        $this->retryBackoffMs = $retryBackoffMs;
        $this->verifyTls = $verifyTls;
    }

    /**
     * @param array<string,string> $headers
     * @param array<string,mixed> $payload
     * @return array{status:int,headers:array<string,string>,body:string,latency_ms:int}
     */
    public function postJsonWithRetry(string $url, array $headers, array $payload): array
    {
        $attempts = max(1, $this->maxRetries + 1);
        $last = null;

        for ($attempt = 0; $attempt < $attempts; $attempt++) {
            try {
                $response = $this->postJson($url, $headers, $payload);
            } catch (AiException $e) {
                $last = $e;
                if (!$e->isRetryable() || $attempt >= $attempts - 1) {
                    throw $e;
                }
                $this->sleepBackoff($attempt);
                continue;
            }

            $status = (int)$response['status'];
            if (in_array($status, [429, 500, 502, 503, 504], true) && $attempt < $attempts - 1) {
                $retryAfter = isset($response['headers']['retry-after'])
                    ? (int)$response['headers']['retry-after']
                    : 0;
                if ($retryAfter > 0 && $retryAfter <= 10) {
                    usleep($retryAfter * 1000000);
                } else {
                    $this->sleepBackoff($attempt);
                }
                continue;
            }

            return $response;
        }

        if ($last instanceof AiException) {
            throw $last;
        }

        throw new AiException('AI_PROVIDER_UNAVAILABLE', 'AI 服務暫時無法連線', 503);
    }

    /**
     * @param array<string,string> $headers
     * @param array<string,mixed> $payload
     * @return array{status:int,headers:array<string,string>,body:string,latency_ms:int}
     */
    public function postJson(string $url, array $headers, array $payload): array
    {
        if (!function_exists('curl_init')) {
            throw new AiException('AI_RUNTIME_UNAVAILABLE', '伺服器未啟用 cURL 擴充套件', 500);
        }

        $scheme = strtolower((string)parse_url($url, PHP_URL_SCHEME));
        if (!in_array($scheme, ['https', 'http'], true)) {
            throw new AiException('AI_PROVIDER_URL_INVALID', 'AI 服務 URL 格式無效', 500);
        }

        try {
            $body = json_encode(
                $payload,
                JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
            );
        } catch (\Throwable $e) {
            throw new AiException('AI_INTERNAL_ERROR', 'AI 請求序列化失敗', 500, $e->getMessage());
        }

        $ch = curl_init($url);
        if ($ch === false) {
            throw new AiException('AI_PROVIDER_UNAVAILABLE', 'AI 服務初始化失敗', 503);
        }

        $responseBody = '';
        $tooLarge = false;
        $responseHeaders = [];

        $headerLines = ['Content-Type: application/json', 'Accept: application/json'];
        foreach ($headers as $name => $value) {
            $headerLines[] = $name . ': ' . $value;
        }

        $options = [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => $headerLines,
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_MAXREDIRS => 0,
            CURLOPT_CONNECTTIMEOUT => $this->connectTimeoutSeconds,
            CURLOPT_TIMEOUT => $this->timeoutSeconds,
            CURLOPT_SSL_VERIFYPEER => $this->verifyTls,
            CURLOPT_SSL_VERIFYHOST => $this->verifyTls ? 2 : 0,
            CURLOPT_USERAGENT => 'SourceTown-AI/1.0 (+PHP)',
            CURLOPT_HEADERFUNCTION => static function ($curl, string $line) use (&$responseHeaders): int {
                $length = strlen($line);
                $trimmed = trim($line);
                if ($trimmed === '' || str_starts_with($trimmed, 'HTTP/')) {
                    return $length;
                }
                $pos = strpos($trimmed, ':');
                if ($pos !== false) {
                    $name = strtolower(trim(substr($trimmed, 0, $pos)));
                    $value = trim(substr($trimmed, $pos + 1));
                    if ($name !== '') {
                        $responseHeaders[$name] = $value;
                    }
                }
                return $length;
            },
        ];

        // 以實際位元組上限覆寫 write callback 的限制（避免依賴類別屬性於 static closure）。
        $limit = $this->maxResponseBytes;
        $options[CURLOPT_WRITEFUNCTION] = static function ($curl, string $chunk) use (&$responseBody, &$tooLarge, $limit): int {
            if ($tooLarge) {
                return 0;
            }
            if (strlen($responseBody) + strlen($chunk) > $limit) {
                $tooLarge = true;
                return 0;
            }
            $responseBody .= $chunk;
            return strlen($chunk);
        };

        if (defined('CURLOPT_PROTOCOLS')) {
            $options[CURLOPT_PROTOCOLS] = CURLPROTO_HTTP | CURLPROTO_HTTPS;
        }

        curl_setopt_array($ch, $options);

        $started = microtime(true);
        $ok = curl_exec($ch);
        $latencyMs = (int)round((microtime(true) - $started) * 1000);
        $errno = curl_errno($ch);
        $error = curl_error($ch);
        $status = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);

        if ($tooLarge) {
            throw new AiException('AI_PROVIDER_RESPONSE_TOO_LARGE', 'AI 服務回應超過大小限制', 502);
        }

        if ($ok === false || $errno !== 0) {
            if ($errno === 28) {
                throw new AiException(
                    'AI_PROVIDER_TIMEOUT',
                    'AI 服務回應逾時，請稍後再試',
                    504,
                    $error,
                    null,
                    true
                );
            }
            throw new AiException(
                'AI_PROVIDER_UNAVAILABLE',
                'AI 服務暫時無法連線',
                503,
                $error,
                null,
                true
            );
        }

        return [
            'status' => $status,
            'headers' => $responseHeaders,
            'body' => $responseBody,
            'latency_ms' => $latencyMs,
        ];
    }

    private function sleepBackoff(int $attempt): void
    {
        $ms = $this->retryBackoffMs * (2 ** max(0, $attempt));
        if ($ms > 0) {
            usleep($ms * 1000);
        }
    }
}
