# 《源泉鎮 Source Town》V3.1

結合 **GalGame 敘事體驗** 與 **四語言程式除錯實戰** 的教學型網頁 RPG。玩家扮演返鄉工程師，協助四位角色修復「Source-0」主機底層異常，並透過 100% MySQL 資料庫保存進度、存檔槽位、審計日誌與問題回報。

---

## 四大區域與技術主題

| 區域 | 角色 | 程式語言 | 評測模式 | 核心教學主題 |
| :--- | :--- | :--- | :--- | :--- |
| 生態農場 | 蘇曉 | Python | `runtime`（安全運算式解析 / 結構檢查） | 條件分支、邊界值與迴圈篩選 |
| 海濱市集 | 夏海 | JavaScript | `runtime`（隔離 Web Worker + 2000ms Watchdog） | 防抖 Debounce、`reduce` 與門檻折扣 |
| 行政區 | 林靜 | Java | `concept_simulation` | OOP 封裝（`private`）與 `HashMap.getOrDefault(key, 0)` |
| 水電工業 | 鐵嵐 | C++ | `concept_simulation` | 指標解引用（`*ptr`）與指標參考釋放（`int*& buf`） |

---

## 本機 XAMPP 快速安裝指南

1. **啟動服務**：開啟 XAMPP Control Panel，啟動 **Apache** 與 **MySQL**。
2. **建立資料庫**：開啟 phpMyAdmin（`http://localhost/phpmyadmin`），匯入專案根目錄的 `source_town_complete.sql`（會自動建立 `source_town` 資料庫、20 張資料表、4 個防竄改觸發器、預設教師帳號 `admin` 與種子資料）。
3. **部署程式碼**：將專案資料夾置於 `htdocs/soure_towm/`，於瀏覽器開啟 `http://localhost/soure_towm/`。
4. **設定 AI 角色對話（選填）**：
   - 複製 `api/ai/config.example.php` 至 `htdocs` 外的 `.source_town_ai.php`（或設定環境變數 `SOURCE_TOWN_AI_CONFIG` 與 `ST_AI_API_KEY`）。
   - 未設定時系統會自動使用資料庫內建的 24 條 `offline_scripts` 離線劇本，不影響遊戲主流程。

---

## 自動化測試執行方式

```bash
# 前端語法、評測邏輯與安全規則測試 (Node.js 18+)
node --check app.js
node tests/run_frontend_p0_p2_tests.js

# 後端 PHP 語法與 AI Phase 1 / Phase 2 測試 (PHP 8.2+)
php tests/run_phase1_tests.php
php tests/run_phase2_tests.php
```

---

## 相關技術文件

- [API 參考手冊](docs/API_REFERENCE.md)
- [系統架構與資料庫升級／回滾方案](docs/ARCHITECTURE_AND_ROLLBACK.md)
- [AI 設定指南](docs/AI_CONFIGURATION_GUIDE.md)
- [資料庫 Migration 指南](docs/DATABASE_MIGRATION_GUIDE.md)
