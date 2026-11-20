# Source Town V3.0 — Phase 1 Stabilization Report

## 1. 審查範圍與發現摘要
本報告針對 `VTC_FIP(源泉鎮)/soure_towm/` 現有 V2.6 與 V3.0 Phase 1 程式碼進行全面安全與資料庫穩定性審查，並完成 P0 與 P1 項目修復。

## 2. P0 修復項目
| 編號 | 問題位置 | 問題原因與風險 | 修復方式 | 驗證狀態 |
|---|---|---|---|---|
| **P0-01** | `app.js` (`appendChatBubble`, `renderOfflineScriptsPreview`) | 直接將 `name`、`text` 寫入 `innerHTML`，存在 DOM XSS 執行風險（如 `<img src=x onerror=alert(1)>`） | 改用 `document.createElement()` 與 `textContent` 建立節點，徹底阻斷 HTML/JS 注入 | Node.js 靜態與 DOM 檢查通過 |
| **P0-02** | `source_town_complete.sql` | 完整 SQL 內含 `DROP TABLE IF EXISTS`，誤用於既有資料庫將清空玩家資料 | 標註 `source_town_complete.sql` 為「全新安裝專用」，並建立無 `DROP TABLE` 的版本化 `migration_v30_phase1_ai_infrastructure.sql`（含 `schema_migrations`） | Python SQL 結構檢查通過 |
| **P0-03** | `source_town_complete.sql` vs `api/bootstrap.php` / `api/save_slots.php` / `api/sync.php` | 完整 SQL 缺少 `student_save_slots` 與 `student_script_unlocks` 兩張資料表 | 依 `api/save_slots.php`、`api/sync.php` 與 `api/bootstrap.php` 實際欄位補齊兩張表至完整 SQL 與升級 Migration | 20 張資料表拓撲檢查通過 |

## 3. P1 修復項目
| 編號 | 問題位置 | 問題原因與風險 | 修復方式 |
|---|---|---|---|
| **P1-01** | `api/ai/src/TokenManager.php` | 原先以 `ai_request_logs` 計算每分鐘請求數，請求未寫入前可遭併發繞過 | 新增 `ai_reservations` 資料表，於 `SELECT ... FOR UPDATE` 交易鎖定內統計近 60 秒預留紀錄 |
| **P1-02** | `api/ai.php`, `api/db.php`, `api/session.php`, `api/bootstrap.php`, `api/admin_login.php` | 缺少 `X-CSRF-Token` 驗證，且空 `Origin` 標頭可繞過來源檢查 | 新增 `computeCsrfToken()` / `verifyCsrfToken()`，強制驗證 `X-CSRF-Token`、`Origin`/`Referer` 與 `Sec-Fetch-Site` |
| **P1-03** | `api/ai/src/AiConfig.php` (`resolveConfigFile`) | `dirname(__DIR__, 4)` 指向 `htdocs` 內部，且 `SOURCE_TOWN_AI_CONFIG` 缺失時會靜默降級 | 修正為 `dirname(__DIR__, 5)`（`D:\xampp\.source_town_ai.php`），並於 `SOURCE_TOWN_AI_CONFIG` 缺失時 fail-closed |
| **P1-04** | `migration_v30_phase1_ai_infrastructure.sql` | 確保升級腳本冪等且不與既有資料表衝突 | 全數採用 `CREATE TABLE IF NOT EXISTS` 與 `INSERT IGNORE` 寫入 `schema_migrations` |
| **P1-05** | `api/ai/src/TokenManager.php` | `settle()` 與 `release()` 缺少冪等鎖定，可能重複結算或重複退款 | 透過 `ai_reservations.status` (`RESERVED` → `SETTLED` / `RELEASED`) 實作交易冪等控制與 `GREATEST(0, ...)` 防負數 |

## 4. 已知限制與環境驗證說明
- 本次建置環境僅具備 Node.js v18.20.4 與 Python 3，未安裝 PHP CLI 與 MySQL，因此 `tests/run_phase1_tests.php` 與 `tests/run_phase2_tests.php` 需於本地 XAMPP 環境執行驗證。
