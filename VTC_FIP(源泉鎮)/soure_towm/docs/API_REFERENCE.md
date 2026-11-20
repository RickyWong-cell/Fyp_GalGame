# 《源泉鎮 Source Town》後端 API 參考手冊

所有寫入型端點均強制驗證同源請求（`Origin` / `Referer` + `Sec-Fetch-Site`），並於 `X-CSRF-Token` 標頭比對與 HttpOnly Session Cookie（`st_session`）綁定之 HMAC CSRF Token。

---

## 1. 系統與工作階段

| 端點 | 方法 | 權限 | 說明 |
| :--- | :--- | :--- | :--- |
| `api/status.php` | `GET` | 公開 | 檢查 PHP、PDO MySQL 連線與 `levels` 資料表就緒狀態 |
| `api/session.php` | `POST` | 公開 / 同源 | 建立或續用匿名學生 Session（核發 `st_session` 與 `csrf_token`） |
| `api/session.php` | `DELETE` / `POST(logout)` | Session + CSRF | 撤銷當前 Session 並清除 Cookie |
| `api/bootstrap.php` | `GET` | 公開 / Session | 載入關卡、24 條劇本及個人進度；僅 `role=admin` 回傳 `auditLogs` |

---

## 2. 遊戲進度、存檔與問題回報

| 端點 | 方法 | 權限 | 說明 |
| :--- | :--- | :--- | :--- |
| `api/sync.php` | `POST` | Session + CSRF | 寫入草稿或提交作答審計；好感度由伺服器端交易（`FOR UPDATE`）計算並回傳最新 `affection_score` 與 `affection_tier` |
| `api/save_slots.php` | `POST` | Session + CSRF | 支援 `save` / `load` / `delete` 四組槽位（`slot_index` `0..3`），讀檔時以交易同步回寫 `student_progress` 與 `student_affection` |
| `api/issue_reports.php` | `POST` | Session + CSRF | 學生提交問題回報（自動記錄 `subject_id`、`category`、`sector_id`、`level_code`、`title`、`description`） |
| `api/issue_reports.php` | `GET` / `POST(update_status)` | Admin + CSRF | 教師篩選檢視回報列表及切換狀態（`OPEN` / `IN_PROGRESS` / `RESOLVED` / `WONT_FIX`） |

---

## 3. 教師管理與 AI 對話

| 端點 | 方法 | 權限 | 說明 |
| :--- | :--- | :--- | :--- |
| `api/admin_login.php` | `POST` | 公開 | 以 `password_verify` 驗證 `teachers` 帳號密碼（含 5 次失敗鎖定 60 秒之 429 限流） |
| `api/admin_levels.php` | `POST` | Admin + CSRF | 新增自訂關卡（驗證 `sectorId` 與 `level_code`）、切換啟用狀態或安全刪除／封存（已含審計紀錄改停用） |
| `api/admin_student_timeline.php` | `GET` | Admin + 同源 | 依 `student_uuid` 查詢該生作答時間軸與各區好感度 |
| `api/ai.php` | `GET` / `POST` | Session + CSRF | AI 狀態查詢與角色對話（受 `TokenManager` 每日配額與每分鐘併發限流保護，不支援 `response_format` 時自動降級重試） |
