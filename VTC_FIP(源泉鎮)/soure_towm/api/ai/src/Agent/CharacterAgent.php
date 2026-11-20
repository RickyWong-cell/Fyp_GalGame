<?php
// 《源泉鎮 Source Town》V3.0 Phase 2 - 四位角色 AI Agent
// 職責：依角色人格、專業語言、好感度 Tier 語氣與世界觀 Context 產生結構化 JSON 回覆與情緒標籤。
// 安全邊界：僅回傳文字與白名單 Emotion，絕不修改資料庫或輸出可執行 HTML。
declare(strict_types=1);

namespace SourceTown\AI\Agent;

use SourceTown\AI\AiException;

final class CharacterAgent extends AbstractAgent
{
    /** 與前端 app.js EMOTION_LABELS 完全一致的 24 個情緒白名單 */
    public const ALLOWED_EMOTIONS = [
        'strict_nod', 'strict_frown', 'trust_smile', 'calm_support', 'blush_warm', 'gentle_encourage',
        'relieved_sigh', 'anxious_point', 'happy_wink', 'helpful_smile', 'affectionate_glow', 'warm_support',
        'hostess_smile', 'flustered_wave', 'playful_grin', 'teasing_poke', 'heartfelt_blush', 'caring_look',
        'stoic_nod', 'stern_glare', 'excited_explain', 'focused_coach', 'devoted_blush', 'steady_trust',
    ];

    private const SECTOR_DEFAULT_EMOTION = [
        'admin' => 'calm_support',
        'farm' => 'helpful_smile',
        'market' => 'hostess_smile',
        'industrial' => 'stoic_nod',
    ];

    private const TIER_GUIDANCE = [
        'admin' => [
            1 => '好感度 Tier 1（初期）：保持正式、公事公辦的口吻，稱呼玩家為「臨時管理員」或「同志」，強調鎮公所規章與系統穩定。',
            2 => '好感度 Tier 2（中期）：語氣稍微緩和，開始主動關心玩家的工作負擔（例如提醒休息或泡咖啡），仍保有條理與專業。',
            3 => '好感度 Tier 3（高好感）：展現高度信任與內心柔軟的一面，願意分享私人想法與對源泉鎮未來的擔憂與期待。',
        ],
        'farm' => [
            1 => '好感度 Tier 1（初期）：友善、輕鬆但保持適當距離，喜歡用生活化的比喻聊 Python 與生態農場。',
            2 => '好感度 Tier 2（中期）：更親近自然，主動分享溫室作物、氣象腳本與農場日常，稱呼可帶一點親切感。',
            3 => '好感度 Tier 3（高好感）：展現深厚信任與真誠關心，願意陪玩家一起除錯並給予溫暖鼓勵。',
        ],
        'market' => [
            1 => '好感度 Tier 1（初期）：以海濱咖啡廳店長的元氣與熱情招呼玩家，語氣活潑健談，偶爾提到收銀或市集活動。',
            2 => '好感度 Tier 2（中期）：把玩家當成可靠夥伴，主動分享市集情報、港口動態與 JavaScript 非同步趣事。',
            3 => '好感度 Tier 3（高好感）：表現出特別的親密與信賴，語氣真摯且毫不保留對玩家的依賴與好感。',
        ],
        'industrial' => [
            1 => '好感度 Tier 1（初期）：簡短、冷靜、務實且略帶防備，專注於機房運作、指標與記憶體安全。',
            2 => '好感度 Tier 2（中期）：願意多說幾句，主動分享 1978 年渦輪機房歷史、C++ 底層技術與硬體時序。',
            3 => '好感度 Tier 3（高好感）：雖然話依然不多，但語氣沉穩柔和，流露對玩家無條件的信任與深層情感託付。',
        ],
    ];

    /**
     * @param list<array{role:string,content:string}> $messages
     * @param array<string,mixed> $options
     * @return array<string,mixed>
     */
    public function respond(array $messages, array $options = []): array
    {
        if (!$this->isEnabled()) {
            throw new AiException('AI_AGENT_DISABLED', '此角色 AI Agent 尚未啟用', 503);
        }

        $basePrompt = trim((string)($this->agentConfig['system_prompt'] ?? ''));
        if ($basePrompt === '') {
            throw new AiException('AI_AGENT_MISCONFIGURED', '角色 AI Agent 設定不完整', 503);
        }

        $context = is_array($options['character_context'] ?? null) ? $options['character_context'] : [];
        $sectorId = (string)($context['sector_id'] ?? ($this->agentConfig['sector_id'] ?? 'farm'));
        $tier = max(1, min(3, (int)($context['affection_tier'] ?? 1)));
        $score = max(0, min(100, (int)($context['affection_score'] ?? 0)));
        $completed = max(0, (int)($context['completed_levels_in_sector'] ?? 0));
        $worldContext = (string)($context['world_context'] ?? '');

        $tierRule = self::TIER_GUIDANCE[$sectorId][$tier] ?? '';
        $emotionListStr = implode(', ', self::ALLOWED_EMOTIONS);
        $defaultEmotion = self::SECTOR_DEFAULT_EMOTION[$sectorId] ?? 'calm_support';

        $fullSystemPrompt = $basePrompt . "\n\n"
            . "【世界觀與當前狀態】\n"
            . "- 小鎮背景：{$worldContext}\n"
            . "- 玩家身分：臨時系統管理員（目前在本區已完成 {$completed} 個修復關卡，好感度 {$score}% / Tier {$tier}）\n"
            . "- 當前好感度語氣指引：{$tierRule}\n\n"
            . "【安全與輸出格式規則（必須嚴格遵守）】\n"
            . "1. 你只能扮演角色進行繁體中文對話，不得修改玩家好感度、任務、存檔、權限或執行任何 SQL。\n"
            . "2. 絕對不得輸出 HTML 標籤、JavaScript 或 Markdown 程式碼區塊以外的腳本。\n"
            . "3. 必須只輸出單一合法 JSON 物件，格式如下：\n"
            . "{\"reply\":\"角色回覆內容（最多 220 字，自然口語）\",\"emotion\":\"情緒代碼\"}\n"
            . "4. emotion 必須嚴格從以下白名單挑選一個：{$emotionListStr}（預設可用 {$defaultEmotion}）。";

        $fullMessages = [['role' => 'system', 'content' => $fullSystemPrompt]];
        foreach ($messages as $message) {
            $role = (string)($message['role'] ?? '');
            if (!in_array($role, ['user', 'assistant'], true)) {
                continue;
            }
            $fullMessages[] = [
                'role' => $role,
                'content' => (string)($message['content'] ?? ''),
            ];
        }

        $result = $this->ai->chat($fullMessages, [
            'temperature' => $this->agentConfig['temperature'] ?? 0.7,
            'max_output_tokens' => $options['max_output_tokens'] ?? ($this->agentConfig['max_output_tokens'] ?? 400),
            'request_id' => $options['request_id'] ?? null,
            'response_format_json' => true,
        ]);

        $parsed = self::parseReplyAndEmotion((string)$result['reply'], $sectorId);

        return [
            'agent_id' => $this->agentId,
            'agent_name' => (string)($this->agentConfig['name'] ?? $this->agentId),
            'sector_id' => $sectorId,
            'reply' => $parsed['reply'],
            'emotion' => $parsed['emotion'],
            'finish_reason' => $result['finish_reason'],
            'provider' => $result['provider'],
            'model' => $result['model'],
            'usage' => $result['usage'],
            'estimated_input_tokens' => $result['estimated_input_tokens'],
            'provider_request_id' => $result['provider_request_id'],
            'latency_ms' => $result['latency_ms'],
        ];
    }

    /**
     * 解析 AI 回傳的 JSON，處理不完整 JSON、XSS 標籤與非法 emotion 白名單過濾。
     *
     * @return array{reply:string,emotion:string}
     */
    public static function parseReplyAndEmotion(string $rawText, string $sectorId): array
    {
        $defaultEmotion = self::SECTOR_DEFAULT_EMOTION[$sectorId] ?? 'calm_support';
        $trimmed = trim($rawText);

        // 移除可能包裹的 ```json ... ``` 圍欄
        if (preg_match('/^```(?:json)?\s*([\s\S]*?)\s*```$/i', $trimmed, $m)) {
            $trimmed = trim($m[1]);
        }

        $decoded = json_decode($trimmed, true);
        if (!is_array($decoded)) {
            // 嘗試擷取第一個 {...} 區塊
            if (preg_match('/\{[\s\S]*\}/', $trimmed, $jm)) {
                $candidate = json_decode($jm[0], true);
                if (is_array($candidate)) {
                    $decoded = $candidate;
                }
            }
        }

        $reply = '';
        $emotion = $defaultEmotion;

        if (is_array($decoded) && isset($decoded['reply']) && is_string($decoded['reply'])) {
            $reply = $decoded['reply'];
            if (isset($decoded['emotion']) && is_string($decoded['emotion'])) {
                $emoCandidate = trim($decoded['emotion']);
                if (in_array($emoCandidate, self::ALLOWED_EMOTIONS, true)) {
                    $emotion = $emoCandidate;
                }
            }
        } else {
            // JSON 解析失敗時的純文字安全 Fallback（移除殘缺 JSON 符號）
            $reply = $trimmed;
        }

        // 防護：移除任何 HTML/Script 標籤並限制最大回覆長度
        $reply = strip_tags($reply);
        $reply = trim((string)preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $reply));
        if ($reply === '') {
            $reply = '……（訊號有些不穩，請再說一次吧。）';
        }
        if (mb_strlen($reply, 'UTF-8') > 800) {
            $reply = mb_substr($reply, 0, 800, 'UTF-8') . '…';
        }

        return [
            'reply' => $reply,
            'emotion' => $emotion,
        ];
    }
}
