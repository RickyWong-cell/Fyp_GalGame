<?php
// 《源泉鎮 Source Town》V3.0 Phase 2 - Agent 註冊與執行管理
declare(strict_types=1);

namespace SourceTown\AI;

use SourceTown\AI\Agent\AgentInterface;
use SourceTown\AI\Agent\CharacterAgent;
use SourceTown\AI\Agent\SystemAgent;

final class AgentManager
{
    public const CHARACTER_AGENT_IDS = [
        'character_admin',
        'character_farm',
        'character_market',
        'character_industrial',
    ];

    private AIService $ai;
    private AiConfig $config;

    /** @var array<string,AgentInterface> */
    private array $agents = [];

    public function __construct(AIService $ai, AiConfig $config)
    {
        $this->ai = $ai;
        $this->config = $config;

        foreach ($config->agents() as $agentId => $agentConfig) {
            if (!is_string($agentId) || !is_array($agentConfig) || $this->has($agentId)) {
                continue;
            }
            if ($agentId === 'system') {
                $this->register(new SystemAgent($agentId, $agentConfig, $ai));
            } elseif (in_array($agentId, self::CHARACTER_AGENT_IDS, true)) {
                $this->register(new CharacterAgent($agentId, $agentConfig, $ai));
            }
        }
    }

    public function register(AgentInterface $agent): void
    {
        $id = $agent->id();
        if (isset($this->agents[$id])) {
            return;
        }
        $this->agents[$id] = $agent;
    }

    public function has(string $agentId): bool
    {
        return isset($this->agents[$agentId]);
    }

    public function get(string $agentId): AgentInterface
    {
        if (!isset($this->agents[$agentId])) {
            throw new AiException('AI_AGENT_UNKNOWN', '找不到指定的 AI Agent', 404);
        }
        return $this->agents[$agentId];
    }

    /**
     * @return list<array<string,mixed>>
     */
    public function listPublic(): array
    {
        $list = [];
        foreach ($this->agents as $agent) {
            $list[] = $agent->describe();
        }
        return $list;
    }

    /**
     * @param list<array{role:string,content:string}> $messages
     * @param array<string,mixed> $options
     * @return array<string,mixed>
     */
    public function run(string $agentId, array $messages, array $options = []): array
    {
        $agent = $this->get($agentId);
        if (!$agent->isEnabled()) {
            throw new AiException('AI_AGENT_DISABLED', '此 AI Agent 尚未啟用', 503);
        }
        return $agent->respond($messages, $options);
    }

    public function config(): AiConfig
    {
        return $this->config;
    }
}
