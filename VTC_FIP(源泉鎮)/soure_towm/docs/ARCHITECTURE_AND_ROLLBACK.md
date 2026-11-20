# 《源泉鎮 Source Town》系統架構與資料庫升級／回滾方案

## 1. 系統分層架構

1. **表現層（Frontend）**：`index.html`、`styles.css`、`app.js`
   - 採模組化區塊設計：狀態遷移與偏好持久化（`UI_PREFS_KEY`）、四語言評測引擎（`safeEvalPythonMoistureCond`、`stripCodeComments`、Web Worker Watchdog）、GalGame 五分頁系統設定、劇情播放器（`#modalStoryPlayer`）與教師管理控制台（`#modalAdminDash`）。
2. **API 與安全邊界層（`api/*.php`）**：
   - `api/db.php` 提供共用安全原語：`assertSameOriginRequest()`、`getActiveSession()`、`computeCsrfToken()`、`requireAuthenticatedCsrf()`。
   - 所有寫入操作一律從伺服器端 `$sess['subject_id']` 取得使用者身分，不信任客戶端傳入的 `student_uuid` 或 `affection_score`。
3. **AI 基礎設施層（`api/ai/src/`）**：
   - `AiConfig`（讀取 htdocs 外設定或環境變數）→ `AgentRouter` → `CharacterContextBuilder` → `TokenManager`（交易鎖定預留 + 冪等結算/釋放）→ `OpenAiCompatibleProvider`（含不支援 `json_object` 之自動降級重試）。
4. **資料層（MySQL / MariaDB `source_town`）**：
   - 共 21 張資料表（含 `issue_reports`）與 4 個 Append-Only 防竄改觸發器（保護 `submission_audit_logs` 與 `ai_request_logs`）。

---

## 2. 資料庫升級與回滾方案

### 2.1 全新環境部署
直接於 phpMyAdmin 匯入 `source_town_complete.sql`（已整合 V2.5、V2.6、V3.0 AI 基礎設施、P0-05 `industrial_2` 修正與 `issue_reports` 資料表）。

### 2.2 既有資料庫無痛升級（不清除現有玩家資料）
1. 備份現有資料庫：
   ```bash
   mysqldump -u root source_town > backup_source_town_$(date +%Y%m%d).sql
   ```
2. 執行增量更新：
   - 更新 `industrial_2` 題目定義（P0-05）：
     ```sql
     UPDATE levels
     SET starter_code = 'void release_buffer(int*& buf) {\n    delete[] buf;\n    // 目標：以指標參考 (int*&) 釋放動態陣列後，將指標設為 nullptr 避免呼叫端懸空指標\n}'
     WHERE level_code = 'industrial_2';
     ```
   - `issue_reports` 資料表會由 `api/issue_reports.php` 首次存取時以 `CREATE TABLE IF NOT EXISTS` 自動建立，亦可手動從 `source_town_complete.sql` 執行該段 `CREATE TABLE`。

### 2.3 回滾方案（Rollback）
1. **程式碼回滾**：所有歷次變更前之檔案皆保留於 Google Drive `soure_towm/backup_old/`，依時間戳記覆蓋回對應路徑即可。
2. **資料庫回滾**：
   - 若僅需移除 `issue_reports`：`DROP TABLE IF EXISTS issue_reports;`（不影響任何既有遊戲資料表）。
   - 若需完整還原：`mysql -u root source_town < backup_source_town_YYYYMMDD.sql`。
