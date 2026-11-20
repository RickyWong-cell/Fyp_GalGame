<?php
// 《源泉鎮 Source Town》V3.0 Phase 2 - Agent 路由
// 由 intent 與伺服器端白名單（sector_id -> agent_id）決定 Agent，絕不接受前端直接指定 agent_id。
declare(strict_types=1);

namespace SourceTown\AI;

final class AgentRouter
{
    public const SECTOR_AGENT_WHITELIST = [
        'admin' => 'character_admin',
        'farm' => 'character_farm',
        'market' => 'character_market',
        'industrial' => 'character_industrial',
    ];

    private AiConfig $config;

    public function __construct(AiConfig $config)
    {
        $this->config = $config;
    }

    /**
     * @param array<string,mixed> $params
     * @return array{intent:string,agent_id:string,role:string,sector_id:?string}
     */
    public function route(string $intent, string $role, array $params = []): array
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

        if ($intent === 'character_chat') {
            $sectorId = trim((string)($params['sector_id'] ?? ''));
            if ($sectorId === '' || !isset(self::SECTOR_AGENT_WHITELIST[$sectorId])) {
                throw new AiException('AI_SECTOR_INVALID', '未知的源泉鎮角色區域', 400);
            }
            $sectorMap = is_array($route['sector_agents'] ?? null)
                ? $route['sector_agents']
                : self::SECTOR_AGENT_WHITELIST;
            $agentId = trim((string)($sectorMap[$sectorId] ?? self::SECTOR_AGENT_WHITELIST[$sectorId]));
            if (!in_array($agentId, self::SECTOR_AGENT_WHITELIST, true)) {
                throw new AiException('AI_ROUTING_INVALID', '角色路由設定無效', 503);
            }

            return [
                'intent' => $intent,
                'agent_id' => $agentId,
                'role' => $role,
                'sector_id' => $sectorId,
            ];
        }

        $agentId = trim((string)($route['agent'] ?? ''));
        if ($agentId === '') {
            throw new AiException('AI_ROUTING_INVALID', 'AI 路由設定不完整', 503);
        }

        return [
            'intent' => $intent,
            'agent_id' => $agentId,
            'role' => $role,
            'sector_id' => null,
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
