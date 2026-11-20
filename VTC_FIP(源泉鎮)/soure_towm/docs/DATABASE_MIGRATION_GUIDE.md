# Source Town V3.0 — Database Migration Guide

## 1. 全新安裝 vs 既有資料庫升級
| 情境 | 應使用檔案 | 說明 |
|---|---|---|
| **全新空白資料庫** | `source_town_complete.sql` | 內含 `DROP TABLE IF EXISTS`，會重建全部 20 張資料表與初始資料 |
| **既有 V2.5 / V2.6 資料庫升級** | `migration_v30_phase1_ai_infrastructure.sql` | 僅使用 `CREATE TABLE IF NOT EXISTS` 與 `INSERT IGNORE`，絕不刪除現有玩家存檔或進度 |

## 2. 升級步驟 (XAMPP)
1. **備份現有資料庫**：
   ```bat
   D:\xampp\mysql\bin\mysqldump.exe -u root source_town > D:\backup_source_town_before_v30.sql
   ```
2. **執行安全升級腳本**：於 phpMyAdmin 選擇 `source_town` 資料庫並匯入 `migration_v30_phase1_ai_infrastructure.sql`。
3. **驗證結果**：確認 `schema_migrations` 已記錄 `v3.0_phase1_stabilization`，且 `ai_usage_daily`、`ai_reservations`、`ai_request_logs`、`student_save_slots`、`student_script_unlocks` 均已就緒。

## 3. 回滾方案
若需移除 V3.0 新增之 AI 資料表（不影響 V2.6 玩家進度）：
```sql
USE `source_town`;
DROP TRIGGER IF EXISTS `prevent_ai_log_update`;
DROP TRIGGER IF EXISTS `prevent_ai_log_delete`;
DROP TABLE IF EXISTS `ai_reservations`, `ai_request_logs`, `ai_usage_daily`;
DELETE FROM `schema_migrations` WHERE `version` LIKE 'v3.0%';
```
若需完整還原升級前狀態，請匯入步驟 1 備份之 `backup_source_town_before_v30.sql`。
