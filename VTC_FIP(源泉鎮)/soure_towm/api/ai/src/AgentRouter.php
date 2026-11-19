<?php
// 《源泉鎮 Source Town》V3.0 Phase 1 - Agent 路由
// 由 intent 決定 Agent 與允許角色，避免前端直接指定任意 Agent。
declare(strict_types=1);

namespace SourceTown\AI;

final class AgentRouter
{
    private AiConfig $config;

    public function __construct(AiConfig $config)
    {
        $this->config = $config;
    }

    /**
     * @return array{intent:string,agent_id:string,role:string}
     */
    public function route(string $intent, string $role): array
    {
        $intent = trim($intent);
        $routing = $this->config->routing();

        if ($intent === '' || !isset($routing[$intent]) || !is_array($routing[$intent])) {
            throw new AiException('AI_INTENT_UNKNOWN', '不支援的 AI 請求類型', 400);
        }

        $route = $routing[$intent];
        $roles = $route['roles'] ?? [];
        if (!is_array($roles) || !in_array($role, $roles, true)) {
            throw new AiException('AI_FORBIDDEN', '目前身分無權使用此 AI 功能', 403);
        }

        $agentId = trim((string)($route['agent'] ?? ''));
        if ($agentId === '') {
            throw new AiException('AI_ROUTING_INVALID', 'AI 路由設定不完整', 503);
        }

        return [
            'intent' => $intent,
            'agent_id' => $agentId,
            'role' => $role,
        ];
    }

    /**
     * @return list<string>
     */
    public function intentsForRole(string $role): array
    {
        $intents = [];
        foreach ($this->config->routing() as $intent => $route) {
            if (!is_string($intent) || !is_array($route)) {
                continue;
            }
            $roles = $route['roles'] ?? [];
            if (is_array($roles) && in_array($role, $roles, true)) {
                $intents[] = $intent;
            }
        }
        return $intents;
    }
}
