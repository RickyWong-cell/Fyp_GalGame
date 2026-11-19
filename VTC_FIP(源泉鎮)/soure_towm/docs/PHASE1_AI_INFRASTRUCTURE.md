# Source Town V3.0 — Phase 1：AI Infrastructure

> 本階段只新增 AI 基礎設施，**未修改任何既有檔案、既有 API 或既有資料表**。
> 原有 V2.6 遊戲流程、MySQL 資料、存檔格式與離線 Fallback 劇本全部保留。

---

## 1. 本階段目標與完成項目

| 需求 | 實作 |
|---|---|
| AIService | `api/ai/src/AIService.php`：訊息驗證、Token 上限、Provider 呼叫、用量正規化 |
| AgentManager | `api/ai/src/AgentManager.php`：Agent 註冊、查詢、執行、公開資訊 |
| AgentRouter | `api/ai/src/AgentRouter.php`：intent → Agent → 角色權限 |
| AI Configuration | `api/ai/src/AiConfig.php`、`config.example.php`：伺服器端設定、環境變數覆寫、啟動驗證 |
| API Error Handling | `api/ai/src/AiException.php`、`api/ai.php`：統一錯誤碼、HTTP 狀態、Retry-After、管理員除錯細節 |
| Token Management | `api/ai/src/TokenManager.php`、`Support/TokenEstimator.php`：每日配額、每分鐘限流、先預留後結算 |

Phase 1 僅註冊 **System Agent**；Phase 2 可直接透過 `AgentManager::register()` 加入四位角色 Agent，不需要改動 AIService / Router / TokenManager。

---

## 2. 新增檔案清單

### 後端 AI 模組

```
api/ai.php                                      # AI API 入口（health / chat）
api/ai/.htaccess                                # 禁止瀏覽器直接存取 AI 原始碼與設定
api/ai/bootstrap.php                            # Autoloader / Runtime 建立
api/ai/config.example.php                       # 設定範例（不含真實金鑰）
api/ai/src/AiConfig.php
api/ai/src/AiException.php
api/ai/src/AiRuntime.php
api/ai/src/AIService.php
api/ai/src/AgentManager.php
api/ai/src/AgentRouter.php
api/ai/src/TokenManager.php
api/ai/src/Agent/AgentInterface.php
api/ai/src/Agent/AbstractAgent.php
api/ai/src/Agent/SystemAgent.php
api/ai/src/Provider/ProviderInterface.php
api/ai/src/Provider/ProviderFactory.php
api/ai/src/Provider/OpenAiCompatibleProvider.php
api/ai/src/Provider/MockProvider.php
api/ai/src/Support/HttpClient.php
api/ai/src/Support/RequestLogger.php
api/ai/src/Support/TokenEstimator.php
```

### SQL Migration

```
migration_v30_phase1_ai_infrastructure.sql
```

只新增：

- `ai_usage_daily`：每人每日請求數、預留 Token、實際 Token
- `ai_request_logs`：Append-only 審計（只存 prompt/response 雜湊，不存原文）
- `prevent_ai_log_update` / `prevent_ai_log_delete` triggers

**沒有 ALTER 任何既有資料表。**

### 測試與文件

```
tests/run_phase1_tests.php
docs/PHASE1_AI_INFRASTRUCTURE.md
```

### 修改的既有檔案

**無。** `index.html`、`app.js`、`styles.css`、`api/db.php`、`api/session.php`、`api/bootstrap.php`、`api/sync.php`、`api/save_slots.php`、`api/status.php`、所有 admin API 均未改動。

---

## 3. 新舊系統整合方式

```
Browser (V2.6 現有 UI，暫未改動)
        │
        ├── api/session.php      既有匿名 Session（未改）
        ├── api/bootstrap.php    既有遊戲初始化（未改）
        ├── api/sync.php         既有進度/好感度寫入（未改）
        ├── api/save_slots.php   既有存檔（未改）
        │
        └── api/ai.php           V3.0 新增，獨立模組
                 │
                 ├── AiConfig          ← 伺服器端設定 / API Key
                 ├── AgentRouter       ← intent 與角色權限
                 ├── AgentManager      ← Agent 註冊與執行
                 ├── AIService         ← Provider 抽象層
                 ├── TokenManager      ← 配額與限流（MySQL）
                 ├── RequestLogger     ← 審計（MySQL，append-only）
                 └── Provider          ← OpenAI 相容 / Mock
```

整合原則：

1. **AI 與遊戲狀態完全解耦**：AI 只回傳文字，不具備資料庫連線寫入能力。
2. **沿用既有 Session**：以 `user_sessions.subject_id` 作為 AI 配額主體；不建立第二套登入。
3. **不影響既有流程**：`api/ai.php` 是獨立入口；即使 AI 停用或設定錯誤，原有遊戲 API 完全不受影響。
4. **前端尚未接入**：目前 `modalCharChat` 仍是 V2.6 Offline Mock。前端接入安排在後續 Phase（建議 Phase 2 角色 Agent 或 Phase 8 整合），本階段以 API 測試驗證。

---

## 4. AI 設定方式（API Key 只放伺服器端）

### 建議：放在 htdocs 之外

建立 `D:\xampp\.source_town_ai.php`：

```php
<?php
return [
    'enabled' => true,
    'provider' => 'openai',              // openai / openai_compatible / mock
    'api_key' => 'sk-你的伺服器端金鑰',
    'base_url' => 'https://api.openai.com/v1',
    'model' => 'gpt-4o-mini',
    'daily_request_quota' => 200,
    'daily_token_quota' => 200000,
    'max_requests_per_minute' => 12,
];
```

載入順序：

1. 環境變數 `SOURCE_TOWN_AI_CONFIG` 指向的檔案
2. `D:\xampp\.source_town_ai.php`（`htdocs` 之外）
3. `api/ai/config.local.php`（備援，已被 `.htaccess` 禁止直接存取）

### 或使用環境變數

```text
ST_AI_ENABLED=1
ST_AI_PROVIDER=openai
ST_AI_API_KEY=sk-...
ST_AI_BASE_URL=https://api.openai.com/v1
ST_AI_MODEL=gpt-4o-mini
ST_AI_DAILY_REQUEST_QUOTA=200
ST_AI_DAILY_TOKEN_QUOTA=200000
ST_AI_MAX_REQUESTS_PER_MINUTE=12
```

### 支援的 Provider

- `openai`
- `openai_compatible`（DeepSeek、OpenRouter、Ollama、vLLM 等 `/chat/completions` 相容服務）
- `mock`（離線開發與自動測試，不呼叫外部網路）

> 未設定 `enabled=true` 與 API Key 時，AI 維持 **fail-closed**：`/api/ai.php` 回傳 `AI_DISABLED` 或 `AI_NOT_CONFIGURED`，但既有遊戲完全正常。

---

## 5. API 契約

### `GET /api/ai.php?action=health`

- 不需要 Session 也能取得最小健康資訊。
- 管理員 Session 可取得完整摘要（Provider、Model、配額、設定問題）。
- **永不回傳 API Key、完整 Base URL 或 System Prompt。**

範例（未登入）：

```json
{
  "ok": true,
  "project": "Source Town V3.0",
  "phase": 1,
  "ai": { "phase": 1, "enabled": false, "configured": false },
  "storage": { "connected": true, "usage_table_ready": true, "log_table_ready": true },
  "authenticated": false,
  "role": "guest"
}
```

### `POST /api/ai.php`

```json
{
  "action": "chat",
  "intent": "chat",
  "message": "你好，請介紹源泉鎮",
  "history": [
    { "role": "user", "content": "上一句玩家訊息" },
    { "role": "assistant", "content": "上一句角色回覆" }
  ]
}
```

成功：

```json
{
  "ok": true,
  "phase": 1,
  "reply": "AI 回覆文字",
  "emotion": null,
  "agent": { "id": "system", "name": "Source Town System Agent" },
  "provider": "openai",
  "model": "gpt-4o-mini",
  "usage": {
    "prompt_tokens": 120,
    "completion_tokens": 80,
    "total_tokens": 200,
    "estimated": false
  },
  "quota": { "date": "2026-11-19", "request_count": 1, "total_tokens": 200 },
  "latency_ms": 1200,
  "request_id": "…"
}
```

### 錯誤格式

```json
{
  "ok": false,
  "error": "AI_DAILY_REQUEST_QUOTA_EXCEEDED",
  "msg": "今日 AI 對話次數已達上限，請明日再試",
  "retry_after": 36000,
  "request_id": "…"
}
```

主要錯誤碼：

| 錯誤碼 | HTTP | 說明 |
|---|---|---|
| `AI_DISABLED` | 503 | 總開關未啟用 |
| `AI_NOT_CONFIGURED` | 503 | 缺少 Key / Model / 合法 URL |
| `AI_SESSION_REQUIRED` | 401 | 沒有有效遊戲 Session |
| `AI_ORIGIN_FORBIDDEN` | 403 | 跨站請求 |
| `AI_FORBIDDEN` | 403 | 身分無權使用該 intent |
| `AI_INTENT_UNKNOWN` | 400 | 未知 intent（例如嘗試 `drop_tables`） |
| `AI_INPUT_INVALID` | 400 | 訊息格式錯誤 |
| `AI_INPUT_TOO_LARGE` | 413 | 訊息或歷史過長 |
| `AI_RATE_LIMITED` | 429 | 每分鐘請求過多 |
| `AI_DAILY_REQUEST_QUOTA_EXCEEDED` | 429 | 每日次數用盡 |
| `AI_DAILY_TOKEN_QUOTA_EXCEEDED` | 429 | 每日 Token 用盡 |
| `AI_PROVIDER_AUTH_ERROR` | 502 | 上游金鑰/權限錯誤（不洩漏細節給玩家） |
| `AI_PROVIDER_TIMEOUT` | 504 | 上游逾時 |
| `AI_PROVIDER_RATE_LIMITED` | 503 | 上游限流 |
| `AI_PROVIDER_UNAVAILABLE` | 503 | 上游不可用 |
| `AI_CONTENT_FILTERED` | 422 | 上游內容政策拒絕 |
| `AI_STORAGE_NOT_READY` | 503 | 尚未執行 SQL Migration |

---

## 6. 安全邊界

1. **API Key 只在伺服器端**：不寫入前端、不出現在任何 API 回應或審計日誌。
2. **AI 無 SQL 能力**：`AIService` / Agent 沒有任何 PDO 寫入介面；資料庫僅由 TokenManager 與 RequestLogger 使用固定 SQL。
3. **AI 不改遊戲資料**：`api/ai.php` 不呼叫 `student_progress`、`student_affection`、`student_save_slots` 的寫入。
4. **System Prompt 不可被玩家覆寫**：`AbstractAgent` 會過濾客戶端傳入的 `system` role。
5. **路由白名單**：intent 必須存在於伺服器端 routing 設定，並通過角色檢查。
6. **跨站防護**：檢查 `Origin` / `Sec-Fetch-Site`，只接受同源請求。
7. **Token 配額**：先預留、後結算，並以 `SELECT … FOR UPDATE` 避免併發超額。
8. **審計 append-only**：`ai_request_logs` 禁止 UPDATE / DELETE；只存對話雜湊。
9. **HTTPS 強制**：正式環境 `base_url` 必須 HTTPS；僅本機開發可明確開啟 `allow_insecure_localhost`。
10. **回應大小限制**：避免上游回傳過大內容耗盡記憶體。
11. **不跟隨 Redirect**：降低 SSRF / 憑證外洩風險。
12. **Fail-closed**：未設定、資料表缺失、配額不足時一律拒絕 AI 請求，不影響既有遊戲。

---

## 7. SQL Migration

執行方式（phpMyAdmin 或 CLI）：

```powershell
Get-Content migration_v30_phase1_ai_infrastructure.sql -Raw -Encoding UTF8 |
  & 'D:\xampp\mysql\bin\mysql.exe' --default-character-set=utf8mb4 -u root source_town
```

或直接在 phpMyAdmin 貼上執行。

建立的資料表：

- `ai_usage_daily`
- `ai_request_logs`

建立的 triggers：

- `prevent_ai_log_update`
- `prevent_ai_log_delete`

---

## 8. 測試案例與結果

執行：

```powershell
D:\xampp\php\php.exe tests\run_phase1_tests.php
```

實際結果（2026-11-19，PHP 8.2.12）：

```
PASS: 20  FAIL: 0  SKIP: 0
```

涵蓋：

1. 預設關閉 AI，不會誤判 configured
2. Mock 啟用後 configured，summary 不含 API Key
3. 非 HTTPS base_url 被拒絕
4. 缺少 API Key 被拒絕
5. 環境變數覆寫設定檔
6. 設定檔載入失敗時 fail-closed
7. TokenEstimator 中英文估算
8. chat → system agent 路由
9. guest 被拒絕
10. 未知 intent 被拒絕
11. System Agent + Mock Provider 端到端
12. Agent 公開資訊不含 System Prompt
13. 輸入超過 max_input_tokens 被拒絕
14. 客戶端 system message 無法覆寫人格
15. OpenAI 相容回應解析（content / usage / request id）
16. Provider 401 → `AI_PROVIDER_AUTH_ERROR`
17. Provider 500 → `AI_PROVIDER_UNAVAILABLE`
18. content_filter → `AI_CONTENT_FILTERED`
19. 無 DB 時 Runtime 仍可建立（health）
20. MySQL TokenManager 預留 / 結算 / 釋放（實際資料庫）

### HTTP 實測（PHP 內建伺服器 + Mock Provider + MySQL）

| 測試 | 結果 |
|---|---|
| `GET /api/ai.php?action=health`（未登入） | 200，`enabled=true`、`configured=true`、storage ready |
| `POST /api/session.php` 建立 Session | 200 |
| `POST /api/ai.php` chat（繁體中文 UTF-8） | 200，正確回傳 Mock 回覆與 usage |
| 無 Session chat | 401 `AI_SESSION_REQUIRED` |
| 跨站 Origin | 403 `AI_ORIGIN_FORBIDDEN` |
| 空白訊息 | 400 `AI_INPUT_INVALID` |
| 未知 intent `drop_tables` | 400 `AI_INTENT_UNKNOWN` |
| `GET` chat | 405 |
| `ai_request_logs` append-only trigger | DELETE 被 SQLSTATE 45000 阻擋 |
| 既有 `api/status.php` | 200，`status=ok`、MySQL schema ready |
| 既有 `api/bootstrap.php` | 200，關卡與劇本正常載入 |

> 測試完成後已清除測試用 Session / usage / request log，並重新建立 append-only triggers。
> MySQL 與測試用 PHP 內建伺服器已停止，回歸原始環境狀態。

---

## 9. 已知問題與限制

1. **尚未接入前端**：`modalCharChat` 仍是 Offline Mock；Phase 1 只提供後端 API。這是刻意安排，避免在角色人格尚未完成前改動 UI。
2. **未實測真實 Provider**：本次沒有可用的真實 API Key，因此只驗證 OpenAI 相容格式與錯誤映射；上線前需用實際 Key 做一次 smoke test（建議先用低额度 Key）。
3. **僅支援 OpenAI 相容協定**：Anthropic Messages API、Google Gemini 原生 API 尚未實作；可透過新增 Provider class 擴充。
4. **Token 估算為近似值**：配額預留使用 CJK/拉丁字元 heuristic；最終用量以 Provider `usage` 為準。
5. **無串流輸出**：目前一次回傳完整回覆；未來若要打字機效果需新增 SSE/stream 支援。
6. **CSRF 依賴 SameSite + 同源檢查**：既有系統未使用 CSRF token；AI endpoint 已加 Origin 檢查，但後續可考慮要求 `X-CSRF-Token`。
7. **審計保留策略未定**：`ai_request_logs` append-only，長期需由 DBA 制定歸檔／分區策略。
8. **未實作內容安全過濾**：依賴 Provider 的 content filter；本地未加額外敏感詞過濾。
9. **`.htaccess` 僅適用 Apache**：XAMPP 正式環境有效；若改用 Nginx 需自行加 deny 規則。API Key 仍建議放在 htdocs 之外。
10. **錯誤請求也會寫入審計**：同一 Session 若大量送出無效請求，可能增加 log 數量；每分鐘限流只套用在真正進入 Token 預留的請求。後續可加入「無效請求」獨立限流。

---

## 10. 回歸確認

- 未修改任何既有 PHP / JS / HTML / CSS 檔案。
- 未 ALTER 任何既有資料表。
- 未變更 `api/sync.php`、`api/save_slots.php`、`api/session.php`、`api/bootstrap.php` 的 request/response 契約。
- V2.6 存檔格式（`student_save_slots.snapshot_json`）未變動。
- 離線 Fallback 劇本（24 條）仍可正常載入。
- `api/status.php` 仍回報 `status=ok`、MySQL schema ready。
- 即使 AI 完全停用，原有遊戲流程不受影響。

---

## 11. Phase 2 接續建議

Phase 2 可在**不修改 Phase 1 基礎設施**的前提下加入：

1. `CharacterAgent`（農場／市集／行政／工業四位）
2. Agent 專屬 system prompt、語氣、口頭禪、情緒標籤
3. `AgentManager` 註冊四個角色 Agent
4. `routing` 新增 `character_chat`，傳入 `sector_id` / `affection_tier` 作為受控 context
5. 後端驗證 sector / tier 由資料庫讀取，**不接受前端任意指定好感度**
6. 回傳 `emotion` 欄位給現有 `EMOTION_LABELS`
7. 前端 `sendCharacterChatMessage()` 改為呼叫 `api/ai.php`，並保留 Offline Fallback

等待批准後才會開始 Phase 2。
