<?php
// 《源泉鎮 Source Town》V3.0 Phase 1 - AI 服務核心
declare(strict_types=1);

namespace SourceTown\AI;

use SourceTown\AI\Provider\ProviderInterface;
use SourceTown\AI\Support\TokenEstimator;

final class AIService
{
    private AiConfig $config;
    private ProviderInterface $provider;

    public function __construct(AiConfig $config, ProviderInterface $provider)
    {
        $this->config = $config;
        $this->provider = $provider;
    }

    public function providerName(): string
    {
        return $this->provider->name();
    }

    /**
     * @param list<array{role:string,content:string}> $messages
     * @param array<string,mixed> $options
     * @return array<string,mixed>
     */
    public function chat(array $messages, array $options = []): array
    {
        $validated = $this->validateMessages($messages);
        if (count($validated) === 0) {
            throw new AiException('AI_INPUT_INVALID', '訊息不可為空', 400);
        }

        $estimatedInput = TokenEstimator::estimateMessages($validated);
        $maxInput = $this->config->getInt('max_input_tokens');
        if ($estimatedInput > $maxInput) {
            throw new AiException(
                'AI_INPUT_TOO_LARGE',
                '訊息長度超過 AI 可處理範圍，請縮短後再試',
                413
            );
        }

        $maxOutput = max(
            1,
            min(
                $this->config->getInt('max_output_tokens'),
                (int)($options['max_output_tokens'] ?? $this->config->getInt('max_output_tokens'))
            )
        );

        $temperature = $options['temperature'] ?? 0.7;
        $requestId = (string)($options['request_id'] ?? bin2hex(random_bytes(16)));

        $started = microtime(true);
        $result = $this->provider->chat($validated, [
            'temperature' => $temperature,
            'max_output_tokens' => $maxOutput,
            'response_format_json' => !empty($options['response_format_json']),
            'request_id' => $requestId,
        ]);
        $latency = (int)round((microtime(true) - $started) * 1000);

        $content = trim((string)($result['content'] ?? ''));
        if ($content === '') {
            throw new AiException('AI_PROVIDER_BAD_RESPONSE', 'AI 服務回傳空白內容', 502);
        }

        $usage = is_array($result['usage'] ?? null) ? $result['usage'] : [];
        $promptTokens = max(0, (int)($usage['prompt_tokens'] ?? 0));
        $completionTokens = max(0, (int)($usage['completion_tokens'] ?? 0));
        $estimated = (bool)($usage['estimated'] ?? false);

        if ($promptTokens <= 0) {
            $promptTokens = $estimatedInput;
            $estimated = true;
        }
        if ($completionTokens <= 0) {
            $completionTokens = TokenEstimator::estimateText($content);
            $estimated = true;
        }

        return [
            'reply' => $content,
            'finish_reason' => $result['finish_reason'] ?? null,
            'provider' => $this->provider->name(),
            'model' => (string)($result['model'] ?? $this->config->model()),
            'usage' => [
                'prompt_tokens' => $promptTokens,
                'completion_tokens' => $completionTokens,
                'total_tokens' => $promptTokens + $completionTokens,
                'estimated' => $estimated,
            ],
            'estimated_input_tokens' => $estimatedInput,
            'provider_request_id' => $result['provider_request_id'] ?? null,
            'latency_ms' => max($latency, (int)($result['latency_ms'] ?? 0)),
        ];
    }

    /**
     * @param list<array<string,mixed>> $messages
     * @return list<array{role:string,content:string}>
     */
    private function validateMessages(array $messages): array
    {
        $maxMessages = 40;
        if (count($messages) > $maxMessages) {
            throw new AiException('AI_INPUT_INVALID', '訊息回合數過多', 400);
        }

        $maxChars = $this->config->getInt('max_message_chars');
        $maxTotalChars = $this->config->getInt('max_total_input_chars');
        $totalChars = 0;
        $clean = [];

        foreach ($messages as $message) {
            if (!is_array($message)) {
                throw new AiException('AI_INPUT_INVALID', '訊息格式無效', 400);
            }

            $role = (string)($message['role'] ?? '');
            if (!in_array($role, ['system', 'user', 'assistant'], true)) {
                throw new AiException('AI_INPUT_INVALID', '訊息角色無效', 400);
            }

            $content = $message['content'] ?? '';
            if (!is_string($content)) {
                throw new AiException('AI_INPUT_INVALID', '訊息內容格式無效', 400);
            }

            if (!mb_check_encoding($content, 'UTF-8')) {
                throw new AiException('AI_INPUT_INVALID', '訊息編碼無效，請使用 UTF-8', 400);
            }

            $content = (string)preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $content);
            $content = trim($content);
            if ($content === '') {
                continue;
            }

            $length = mb_strlen($content, 'UTF-8');
            if ($length > $maxChars) {
                throw new AiException(
                    'AI_INPUT_TOO_LARGE',
                    '單一訊息長度超過限制（最多 ' . $maxChars . ' 字）',
                    413
                );
            }

            $totalChars += $length;
            if ($totalChars > $maxTotalChars) {
                throw new AiException('AI_INPUT_TOO_LARGE', '對話內容總長度超過限制', 413);
            }

            $clean[] = ['role' => $role, 'content' => $content];
        }

        return $clean;
    }
}
