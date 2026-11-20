# Source Town V3.0 — Phase 2 Implementation Report

## 1. 新增與修改檔案清單
### 新增檔案
- `api/ai/src/CharacterContextBuilder.php`：從 MySQL 唯讀建立角色與好感度 Context。
- `api/ai/src/Agent/CharacterAgent.php`：實作角色人格、Tier 語氣指引、JSON 解析與情緒白名單過濾。
- `tests/run_phase2_tests.php`：Phase 2 角色路由、人格、情緒 JSON、XSS 與 CSRF 測試套件。
- `migration_v30_phase1_ai_infrastructure.sql`：安全冪等資料庫升級腳本。
- `docs/PHASE1_STABILIZATION_REPORT.md`、`docs/PHASE2_CHARACTER_AGENT_DESIGN.md`、`docs/PHASE2_IMPLEMENTATION_REPORT.md`、`docs/AI_CONFIGURATION_GUIDE.md`、`docs/DATABASE_MIGRATION_GUIDE.md`。

### 修改檔案
- `api/db.php`、`api/session.php`、`api/bootstrap.php`、`api/admin_login.php`：新增並回傳 Session 綁定 `csrf_token`。
- `api/ai/src/AiConfig.php`：修正 `resolveConfigFile()` 路徑並註冊四位角色與 `character_chat` 路由。
- `api/ai/src/TokenManager.php`：透過 `ai_reservations` 實作交易併發限流與冪等結算/釋放。
- `api/ai/src/AgentManager.php`、`api/ai/src/AgentRouter.php`、`api/ai/src/Provider/MockProvider.php`、`api/ai.php`：支援 `character_chat` 路由與結構化 JSON 回應。
- `index.html`、`app.js`：串接 `POST api/ai.php`、加入 `X-CSRF-Token`、Loading 提示、防止重複送出、分角色 10 則短期歷史與 `AI Reply` / `Offline Reply` 標籤。
- `source_town_complete.sql`：補齊 `student_save_slots`、`student_script_unlocks`、`schema_migrations`、`ai_reservations`。

## 2. API 請求與回應範例
**請求 (`POST api/ai.php`)**：
```json
{
  "action": "chat",
  "intent": "character_chat",
  "sector_id": "farm",
  "message": "今天農場有什麼新鮮事？",
  "history": []
}
```
**成功回應 (`200 OK`)**：
```json
{
  "ok": true,
  "phase": 2,
  "agent_id": "character_farm",
  "sector_id": "farm",
  "reply": "今天溫室的濕度感測器很乖，剛摘下來的哈密瓜也快熟囉！",
  "emotion": "happy_wink",
  "provider": "openai_compatible",
  "usage": { "input_tokens": 180, "output_tokens": 42, "total_tokens": 222 }
}
```

## 3. 已知限制
- 短期對話歷史目前保存於前端記憶體（每角色最多 10 則），重新整理頁面後清空；永久記憶留待 Phase 3 實作。
- PHP 與 MySQL 整合測試需於本地 XAMPP 執行 `D:\xampp\php\php.exe tests\run_phase1_tests.php` 與 `tests\run_phase2_tests.php`。
