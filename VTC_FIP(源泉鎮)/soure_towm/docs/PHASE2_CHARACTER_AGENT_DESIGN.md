# Source Town V3.0 — Phase 2 Character Agent Design

## 1. 系統架構圖
```text
Browser (app.js: sendCharacterChatMessage)
  │  POST api/ai.php (X-CSRF-Token + st_session Cookie)
  ▼
api/ai.php (Session + CSRF + Same-Origin + Input Validation)
  │
  ├── AgentRouter::route('character_chat', $role, ['sector_id' => $sectorId])
  │     └─ 白名單映射：admin→character_admin, farm→character_farm,
  │                    market→character_market, industrial→character_industrial
  ├── CharacterContextBuilder::build($session, $sectorId)
  │     └─ 唯讀查詢 MySQL (sectors, student_affection, student_progress)
  ├── TokenManager::reserve()  ──► ai_usage_daily + ai_reservations (FOR UPDATE)
  └── AgentManager::run()
        └─ CharacterAgent (extends AbstractAgent)
              └─ AIService ──► OpenAiCompatibleProvider / MockProvider
```

## 2. 四位角色 Agent 規格
| 區域 (`sector_id`) | Agent ID | 角色 | 專業語言 | 好感度 Tier 語氣 |
|---|---|---|---|---|
| `admin` | `character_admin` | 林靜 (23歲，鎮公所秘書) | Java / OOP / 封裝 | Tier 1 公事公辦 → Tier 2 關心工作 → Tier 3 私人信任 |
| `farm` | `character_farm` | 蘇曉 (21歲，生態農場數據員) | Python / 演算法 / 自動化 | Tier 1 友善距離 → Tier 2 分享日常 → Tier 3 溫暖陪伴 |
| `market` | `character_market` | 夏海 (22歲，海濱咖啡廳店長) | JavaScript / Async / DOM | Tier 1 熱情招呼 → Tier 2 市集情報 → Tier 3 親密信賴 |
| `industrial` | `character_industrial` | 鐵嵐 (23歲，水電廠技師) | C++ / Pointer / 記憶體 | Tier 1 簡短冷靜 → Tier 2 分享技術 → Tier 3 深層託付 |

## 3. 安全邊界與情緒白名單
- **絕不信任前端好感度與 Agent ID**：前端僅傳送 `sector_id`、`message` 與最近 10 條 `user`/`assistant` 歷史；好感度與 Tier 由 `CharacterContextBuilder` 從 MySQL 讀取。
- **情緒白名單**：嚴格對應 `app.js` `EMOTION_LABELS` 的 24 個標籤，非法或缺失值自動回退至各角色安全預設值（`calm_support`、`helpful_smile`、`hostess_smile`、`stoic_nod`）。
- **XSS 防護**：後端 `strip_tags()` + 前端 `textContent` 雙重防護。
