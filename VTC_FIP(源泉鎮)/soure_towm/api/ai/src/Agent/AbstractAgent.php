<?php
// 《源泉鎮 Source Town》V3.0 Phase 1 - Agent 共用基礎類別
declare(strict_types=1);

namespace SourceTown\AI\Agent;

use SourceTown\AI\AIService;
use SourceTown\AI\AiException;

abstract class AbstractAgent implements AgentInterface
{
    protected string $agentId;

    /** @var array<string,mixed> */
    protected array $agentConfig;

    protected AIService $ai;

    /**
     * @param array<string,mixed> $agentConfig
     */
    public function __construct(string $agentId, array $agentConfig, AIService $ai)
    {
        $this->agentId = $agentId;
        $this->agentConfig = $agentConfig;
        $this->ai = $ai;
    }

    public function id(): string
    {
        return $this->agentId;
    }

    public function isEnabled(): bool
    {
        return !empty($this->agentConfig['enabled']);
    }

    public function describe(): array
    {
        return [
            'id' => $this->agentId,
            'name' => (string)($this->agentConfig['name'] ?? $this->agentId),
            'description' => (string)($this->agentConfig['description'] ?? ''),
            'enabled' => $this->isEnabled(),
            'phase' => (int)($this->agentConfig['phase'] ?? 1),
            'max_output_tokens' => (int)($this->agentConfig['max_output_tokens'] ?? 400),
        ];
    }

    public function respond(array $messages, array $options = []): array
    {
        if (!$this->isEnabled()) {
            throw new AiException('AI_AGENT_DISABLED', '此 AI Agent 尚未啟用', 503);
        }

        $systemPrompt = trim((string)($this->agentConfig['system_prompt'] ?? ''));
        if ($systemPrompt === '') {
            throw new AiException('AI_AGENT_MISCONFIGURED', 'AI Agent 設定不完整', 503);
        }

        $fullMessages = [['role' => 'system', 'content' => $systemPrompt]];
        foreach ($messages as $message) {
            $role = (string)($message['role'] ?? '');
            if ($role === 'system') {
                // 客戶端不得覆寫 system prompt。
                continue;
            }
            $fullMessages[] = [
                'role' => $role,
                'content' => (string)($message['content'] ?? ''),
            ];
        }

        $result = $this->ai->chat($fullMessages, [
            'temperature' => $this->agentConfig['temperature'] ?? 0.6,
            'max_output_tokens' => $this->agentConfig['max_output_tokens'] ?? 400,
            'request_id' => $options['request_id'] ?? null,
            'response_format_json' => $options['response_format_json'] ?? false,
        ]);

        return [
            'agent_id' => $this->agentId,
            'agent_name' => (string)($this->agentConfig['name'] ?? $this->agentId),
            'reply' => $result['reply'],
            'finish_reason' => $result['finish_reason'],
            'provider' => $result['provider'],
            'model' => $result['model'],
            'usage' => $result['usage'],
            'estimated_input_tokens' => $result['estimated_input_tokens'],
            'provider_request_id' => $result['provider_request_id'],
            'latency_ms' => $result['latency_ms'],
        ];
    }
}
