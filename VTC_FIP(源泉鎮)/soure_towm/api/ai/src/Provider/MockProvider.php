<?php
// 《源泉鎮 Source Town》V3.0 Phase 1 - Mock Provider（供離線開發與自動測試）
declare(strict_types=1);

namespace SourceTown\AI\Provider;

use SourceTown\AI\AiConfig;
use SourceTown\AI\AiException;
use SourceTown\AI\Support\TokenEstimator;

final class MockProvider implements ProviderInterface
{
    private AiConfig $config;

    public function __construct(AiConfig $config)
    {
        $this->config = $config;
    }

    public function name(): string
    {
        return 'mock';
    }

    public function chat(array $messages, array $options = []): array
    {
        $latency = max(0, (int)$this->config->get('mock.latency_ms', 0));
        if ($latency > 0) {
            usleep($latency * 1000);
        }

        $failStatus = (int)$this->config->get('mock.fail_status', 0);
        if ($failStatus >= 400) {
            throw new AiException(
                'AI_PROVIDER_MOCK_FAILURE',
                'AI 模擬服務發生錯誤',
                $failStatus,
                'mock.fail_status=' . $failStatus
            );
        }

        $lastUser = '';
        foreach (array_reverse($messages) as $message) {
            if (($message['role'] ?? '') === 'user') {
                $lastUser = (string)($message['content'] ?? '');
                break;
            }
        }

        $prefix = (string)$this->config->get('mock.reply_prefix', '（AI 模擬）');
        $snippet = mb_substr($lastUser, 0, 160, 'UTF-8');
        if (!empty($options['response_format_json'])) {
            $content = json_encode([
                'reply' => $prefix . '我收到你說的「' . $snippet . '」囉！',
                'emotion' => 'happy_wink',
            ], JSON_UNESCAPED_UNICODE);
        } else {
            $content = $prefix . '我已收到你的訊息：「' . $snippet . '」。'
                . '目前使用模擬 Provider 回應。';
        }

        $promptTokens = TokenEstimator::estimateMessages($messages);
        $completionTokens = TokenEstimator::estimateText($content);

        return [
            'content' => $content,
            'finish_reason' => 'stop',
            'model' => $this->config->model() ?: 'mock-1',
            'usage' => [
                'prompt_tokens' => $promptTokens,
                'completion_tokens' => $completionTokens,
                'total_tokens' => $promptTokens + $completionTokens,
                'estimated' => true,
            ],
            'provider_request_id' => 'mock-' . bin2hex(random_bytes(6)),
            'latency_ms' => $latency,
        ];
    }
}
