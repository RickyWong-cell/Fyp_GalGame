-- =====================================================================
-- 《源泉鎮 Source Town》完整整合資料庫 Schema & Seed Data
-- 整合來源：
--   1. source_town_xampp_mysql.sql (V2.5 基礎架構)
--   2. migration_v26_p0_p1.sql (V2.6 索引、欄位、8 關卡、作業與成就系統)
--   3. migration_v30_phase1_ai_infrastructure.sql (V3.0 Phase 1 AI 基礎設施)
-- 適用環境：XAMPP MariaDB 10.4+ / MySQL 8.0+ (phpMyAdmin 或 mysql CLI 直接匯入)
-- 整合日期：2026-11-19
-- =====================================================================

SET NAMES utf8mb4;
SET TIME_ZONE = '+08:00';

CREATE DATABASE IF NOT EXISTS `source_town`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `source_town`;

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- 1. 清理既有觸發器與資料表（依外鍵相依反向順序）
-- =====================================================================
DROP TRIGGER IF EXISTS `prevent_audit_update`;
DROP TRIGGER IF EXISTS `prevent_audit_delete`;
DROP TRIGGER IF EXISTS `prevent_ai_log_update`;
DROP TRIGGER IF EXISTS `prevent_ai_log_delete`;

DROP TABLE IF EXISTS `assignment_levels`;
DROP TABLE IF EXISTS `student_progress`;
DROP TABLE IF EXISTS `submission_audit_logs`;
DROP TABLE IF EXISTS `test_cases`;
DROP TABLE IF EXISTS `student_achievements`;
DROP TABLE IF EXISTS `assignments`;
DROP TABLE IF EXISTS `offline_scripts`;
DROP TABLE IF EXISTS `affection_history`;
DROP TABLE IF EXISTS `student_affection`;
DROP TABLE IF EXISTS `levels`;
DROP TABLE IF EXISTS `ai_request_logs`;
DROP TABLE IF EXISTS `ai_usage_daily`;
DROP TABLE IF EXISTS `achievements`;
DROP TABLE IF EXISTS `sectors`;
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `teachers`;

-- =====================================================================
-- 2. 建立資料表（依外鍵相依拓撲順序：Level 0 -> Level 1 -> Level 2）
-- =====================================================================

-- ---------------------------------------------------------------------
-- [Level 0] 基礎獨立資料表（無外鍵依賴）
-- ---------------------------------------------------------------------

-- 1. 教師管理員表
CREATE TABLE `teachers` (
  `teacher_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(100) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`teacher_id`),
  UNIQUE KEY `uk_teachers_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 持久化 Server-Side Session 表（已整合 V2.6 過期與撤銷索引）
CREATE TABLE `user_sessions` (
  `session_id` VARCHAR(128) NOT NULL,
  `subject_id` VARCHAR(64) NOT NULL,
  `role` ENUM('student', 'admin') NOT NULL,
  `csrf_secret` VARCHAR(128) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `revoked_at` DATETIME NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`),
  KEY `idx_sessions_subject_exp` (`subject_id`, `expires_at`),
  KEY `idx_sessions_expires` (`expires_at`),
  KEY `idx_sessions_revoked` (`revoked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 四大基建區域表
CREATE TABLE `sectors` (
  `sector_id` ENUM('admin', 'farm', 'market', 'industrial') NOT NULL,
  `sector_name` VARCHAR(64) NOT NULL,
  `heroine_name` VARCHAR(64) NOT NULL,
  `language` ENUM('Java', 'Python', 'JavaScript', 'C++') NOT NULL,
  `evaluation_mode` ENUM('runtime', 'concept_simulation') NOT NULL,
  PRIMARY KEY (`sector_id`),
  CONSTRAINT `chk_sector_lang_mode` CHECK (
    (`language` IN ('JavaScript', 'Python') AND `evaluation_mode` = 'runtime') OR
    (`language` IN ('Java', 'C++') AND `evaluation_mode` = 'concept_simulation')
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 成就／徽章定義表（V2.6 P1）
CREATE TABLE `achievements` (
  `achievement_code` VARCHAR(64) NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `icon_emoji` VARCHAR(16) NOT NULL DEFAULT '🏅',
  PRIMARY KEY (`achievement_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. AI 每日 Token / 請求配額表（V3.0 Phase 1）
CREATE TABLE `ai_usage_daily` (
  `subject_id` VARCHAR(64) NOT NULL,
  `usage_date` DATE NOT NULL,
  `request_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `reserved_tokens` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `prompt_tokens` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `completion_tokens` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `total_tokens` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`subject_id`, `usage_date`),
  KEY `idx_ai_usage_date` (`usage_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. AI 請求審計日誌表（Append-only，V3.0 Phase 1）
CREATE TABLE `ai_request_logs` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `request_id` CHAR(32) NOT NULL,
  `subject_id` VARCHAR(64) NOT NULL,
  `role` VARCHAR(16) NOT NULL DEFAULT 'guest',
  `intent` VARCHAR(32) NOT NULL DEFAULT '',
  `agent_id` VARCHAR(64) NOT NULL DEFAULT '',
  `provider` VARCHAR(32) NOT NULL DEFAULT '',
  `model` VARCHAR(100) NOT NULL DEFAULT '',
  `status` VARCHAR(16) NOT NULL DEFAULT 'ERROR',
  `error_code` VARCHAR(64) NULL DEFAULT NULL,
  `prompt_tokens` INT UNSIGNED NOT NULL DEFAULT 0,
  `completion_tokens` INT UNSIGNED NOT NULL DEFAULT 0,
  `total_tokens` INT UNSIGNED NOT NULL DEFAULT 0,
  `estimated_tokens` INT UNSIGNED NOT NULL DEFAULT 0,
  `latency_ms` INT UNSIGNED NOT NULL DEFAULT 0,
  `ip_hash` CHAR(64) NULL DEFAULT NULL,
  `prompt_hash` CHAR(64) NULL DEFAULT NULL,
  `response_hash` CHAR(64) NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_ai_log_request` (`request_id`),
  KEY `idx_ai_log_subject_created` (`subject_id`, `created_at`),
  KEY `idx_ai_log_created_status` (`created_at`, `status`),
  KEY `idx_ai_log_agent_created` (`agent_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- [Level 1] 依賴 Level 0 的資料表
-- ---------------------------------------------------------------------

-- 7. 關卡題庫表（已整合 V2.6 is_builtin、sort_order、difficulty 欄位）
CREATE TABLE `levels` (
  `level_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `level_code` VARCHAR(64) NOT NULL,
  `sector_id` ENUM('admin', 'farm', 'market', 'industrial') NOT NULL,
  `created_by` INT UNSIGNED NULL DEFAULT NULL,
  `title` VARCHAR(150) NOT NULL,
  `metaphor_tag` VARCHAR(120) NOT NULL,
  `starter_code` MEDIUMTEXT NOT NULL,
  `ast_rule_json` JSON NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_builtin` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `difficulty` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '1=入門 2=中 3=進階',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`level_id`),
  UNIQUE KEY `uk_levels_code` (`level_code`),
  KEY `idx_levels_sector_active` (`sector_id`, `is_active`),
  CONSTRAINT `fk_levels_sector` FOREIGN KEY (`sector_id`) REFERENCES `sectors` (`sector_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_levels_teacher` FOREIGN KEY (`created_by`) REFERENCES `teachers` (`teacher_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. 學生角色好感度狀態表
CREATE TABLE `student_affection` (
  `affection_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_uuid` VARCHAR(64) NOT NULL,
  `sector_id` ENUM('admin', 'farm', 'market', 'industrial') NOT NULL,
  `current_score` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `current_tier` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`affection_id`),
  UNIQUE KEY `uk_affection_student_sector` (`student_uuid`, `sector_id`),
  CONSTRAINT `chk_affection_tier` CHECK (
    (`current_score` BETWEEN 0 AND 34 AND `current_tier` = 1) OR
    (`current_score` BETWEEN 35 AND 69 AND `current_tier` = 2) OR
    (`current_score` BETWEEN 70 AND 100 AND `current_tier` = 3)
  ),
  CONSTRAINT `fk_affection_sector` FOREIGN KEY (`sector_id`) REFERENCES `sectors` (`sector_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. 角色好感度變動歷史表
CREATE TABLE `affection_history` (
  `history_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_uuid` VARCHAR(64) NOT NULL,
  `sector_id` ENUM('admin', 'farm', 'market', 'industrial') NOT NULL,
  `delta` SMALLINT NOT NULL,
  `new_score` TINYINT UNSIGNED NOT NULL,
  `trigger_event` VARCHAR(64) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `idx_aff_hist_student` (`student_uuid`, `sector_id`, `created_at`),
  CONSTRAINT `fk_aff_hist_sector` FOREIGN KEY (`sector_id`) REFERENCES `sectors` (`sector_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. 離線 Fallback 劇本庫 (24 條基本組合)
CREATE TABLE `offline_scripts` (
  `script_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sector_id` ENUM('admin', 'farm', 'market', 'industrial') NOT NULL,
  `affection_tier` TINYINT UNSIGNED NOT NULL,
  `trigger_event` ENUM('PASS', 'FAIL') NOT NULL,
  `language_code` VARCHAR(16) NOT NULL DEFAULT 'zh-HK',
  `script_version` VARCHAR(16) NOT NULL DEFAULT 'v2.5',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `dialogue_text` TEXT NOT NULL,
  `emotion_tag` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`script_id`),
  UNIQUE KEY `uk_offline_scripts_ver` (`sector_id`, `affection_tier`, `trigger_event`, `language_code`, `script_version`),
  CONSTRAINT `fk_scripts_sector` FOREIGN KEY (`sector_id`) REFERENCES `sectors` (`sector_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. 教師指派作業表（V2.6 P1）
CREATE TABLE `assignments` (
  `assignment_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(120) NOT NULL,
  `created_by` INT UNSIGNED NULL DEFAULT NULL,
  `starts_at` DATETIME NOT NULL,
  `ends_at` DATETIME NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`assignment_id`),
  CONSTRAINT `fk_assign_teacher` FOREIGN KEY (`created_by`) REFERENCES `teachers` (`teacher_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. 學生解鎖成就表（V2.6 P1）
CREATE TABLE `student_achievements` (
  `student_uuid` VARCHAR(64) NOT NULL,
  `achievement_code` VARCHAR(64) NOT NULL,
  `unlocked_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_uuid`, `achievement_code`),
  CONSTRAINT `fk_sa_ach` FOREIGN KEY (`achievement_code`) REFERENCES `achievements` (`achievement_code`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- [Level 2] 依賴 Level 1 的資料表
-- ---------------------------------------------------------------------

-- 13. 公開與隱藏測試案例表
CREATE TABLE `test_cases` (
  `test_case_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `level_id` INT UNSIGNED NOT NULL,
  `input_params_json` JSON NOT NULL,
  `expected_value_json` JSON NULL DEFAULT NULL,
  `assertion_json` JSON NULL DEFAULT NULL,
  `expected_stdout` TEXT NULL DEFAULT NULL,
  `is_hidden` TINYINT(1) NOT NULL DEFAULT 1,
  `timeout_ms` INT UNSIGNED NOT NULL DEFAULT 2000,
  PRIMARY KEY (`test_case_id`),
  KEY `idx_test_cases_level_hidden` (`level_id`, `is_hidden`),
  CONSTRAINT `chk_tc_has_assertion` CHECK (`expected_value_json` IS NOT NULL OR `assertion_json` IS NOT NULL OR `expected_stdout` IS NOT NULL),
  CONSTRAINT `fk_tc_level` FOREIGN KEY (`level_id`) REFERENCES `levels` (`level_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. 學生提交審計日誌表（已整合 V2.6 is_first_pass 欄位與複合索引）
-- (NULL=不適用, -1=未執行/中斷, 0=失敗, 1=成功)
CREATE TABLE `submission_audit_logs` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_uuid` VARCHAR(64) NOT NULL,
  `level_id` INT UNSIGNED NOT NULL,
  `evaluation_mode` ENUM('runtime', 'concept_simulation') NOT NULL,
  `submitted_code` MEDIUMTEXT NOT NULL,
  `passed_l1` TINYINT NULL DEFAULT NULL,
  `passed_l2` TINYINT NULL DEFAULT NULL,
  `passed_l3` TINYINT NULL DEFAULT NULL,
  `exec_status` ENUM('PASS', 'CONCEPT_PASS', 'FAIL_L1', 'FAIL_L2', 'FAIL_L3', 'CONCEPT_FAIL', 'TIMEOUT', 'RUNTIME_ERROR', 'SYSTEM_ERROR') NOT NULL,
  `latency_ms` INT UNSIGNED NOT NULL DEFAULT 0,
  `hint_depth_used` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `is_first_pass` TINYINT(1) NULL DEFAULT NULL COMMENT '1=該生該關第一次 PASS',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_audit_student_level` (`student_uuid`, `level_id`, `created_at`),
  KEY `idx_audit_level_status` (`level_id`, `exec_status`),
  KEY `idx_audit_created_status` (`created_at`, `exec_status`),
  KEY `idx_audit_student_created` (`student_uuid`, `created_at`),
  CONSTRAINT `fk_audit_level` FOREIGN KEY (`level_id`) REFERENCES `levels` (`level_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. 學生關卡學習進度表（已整合 V2.6 複合索引）
CREATE TABLE `student_progress` (
  `progress_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_uuid` VARCHAR(64) NOT NULL,
  `level_id` INT UNSIGNED NOT NULL,
  `is_completed` TINYINT(1) NOT NULL DEFAULT 0,
  `attempts` INT UNSIGNED NOT NULL DEFAULT 0,
  `best_score` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `draft_code` MEDIUMTEXT NULL DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`progress_id`),
  UNIQUE KEY `uk_progress_student_level` (`student_uuid`, `level_id`),
  KEY `idx_progress_student_updated` (`student_uuid`, `updated_at`),
  CONSTRAINT `fk_progress_level` FOREIGN KEY (`level_id`) REFERENCES `levels` (`level_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. 作業關卡關聯表（V2.6 P1）
CREATE TABLE `assignment_levels` (
  `assignment_id` INT UNSIGNED NOT NULL,
  `level_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`assignment_id`, `level_id`),
  CONSTRAINT `fk_al_assign` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`assignment_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_al_level` FOREIGN KEY (`level_id`) REFERENCES `levels` (`level_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 3. Append-only 保護觸發器
-- =====================================================================
DELIMITER $$

CREATE TRIGGER `prevent_audit_update` BEFORE UPDATE ON `submission_audit_logs`
FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Policy: submission_audit_logs is append-only.';
END$$

CREATE TRIGGER `prevent_audit_delete` BEFORE DELETE ON `submission_audit_logs`
FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Policy: submission_audit_logs is append-only.';
END$$

CREATE TRIGGER `prevent_ai_log_update` BEFORE UPDATE ON `ai_request_logs`
FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Policy: ai_request_logs is append-only.';
END$$

CREATE TRIGGER `prevent_ai_log_delete` BEFORE DELETE ON `ai_request_logs`
FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Policy: ai_request_logs is append-only.';
END$$

DELIMITER ;

-- =====================================================================
-- 4. 初始 SEED DATA（依外鍵順序寫入，保留所有 V2.5 + V2.6 資料）
-- =====================================================================

-- 4.1 四大區域 (4 筆)
INSERT INTO `sectors` (`sector_id`, `sector_name`, `heroine_name`, `language`, `evaluation_mode`) VALUES
('admin', '行政區', '林靜', 'Java', 'concept_simulation'),
('farm', '生態農場', '蘇曉', 'Python', 'runtime'),
('market', '海濱市集', '夏海', 'JavaScript', 'runtime'),
('industrial', '水電工業', '鐵嵐', 'C++', 'concept_simulation');

-- 4.2 內建 8 關卡（已合併 V2.5 初始 5 關與 V2.6 擴充 3 關及完整 ast_rule_json）
INSERT INTO `levels` (`level_id`, `level_code`, `sector_id`, `title`, `metaphor_tag`, `starter_code`, `ast_rule_json`, `is_active`, `is_builtin`, `sort_order`, `difficulty`) VALUES
(1, 'farm_1', 'farm', '第 1 關：條件分支異常', '條件分支異常 · 乾旱警報',
'def evaluate_sprinkler(moisture):\n    if moisture > 40:\n        return "SPRINKLER_ON"\n    return "SPRINKLER_OFF"\n\nprint(evaluate_sprinkler(18))',
'{"file":"sprinkler_controller.py","required_nodes":["FunctionDef","If"],"hints":[["方向提示","檢查第 3 行的比較運算子，目前濕度 > 40 才開水，與抗旱需求相反。"],["關鍵概念","當土壤濕度低於 40（即 moisture < 40）時才應回傳 SPRINKLER_ON。"],["結構提示","保留 def evaluate_sprinkler(moisture): 並修改 if 條件式為 moisture < 40。"]]}',
1, 1, 1, 1),

(2, 'farm_2', 'farm', '第 2 關：溫室異常感測器陣列過濾', '迴圈篩選異常 · 感測器雜訊',
'readings = [22, 35, 19, 42, 28]\ncount = 0\nfor r in readings:\n    if r > 50:\n        count += 1\nprint(count)',
'{"file":"sensor_filter.py","required_nodes":["For","If"],"required_token":"for","pass_pattern":">= 30","expected_stdout":"2","hints":[["方向提示","感測器異常門檻是 30 度以上（含 30），目前條件寫成了 > 50。"],["關鍵概念","在 for 迴圈中將判斷條件改為 >= 30 即可正確累計異常筆數。"],["結構提示","檢查第 5 行的 if 條件比較門檻數值，預期輸出為 2。"]]}',
1, 1, 2, 1),

(3, 'market_1', 'market', '第 1 關：事件佇列溢出', '事件佇列溢出 · 缺少防抖',
'function createDebounce(fn, delay) {\n  let timer = null;\n  return function(...args) {\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n}',
'{"file":"checkout_debounce.js","required_nodes":["FunctionDeclaration","CallExpression"],"hints":[["方向提示","連續點擊結帳時每次都會建立新計時器，缺少取消前一次計時器的步驟。"],["關鍵概念","使用 clearTimeout(timer) 在設定新 setTimeout 前清除舊計時器，達成防抖 (Debounce)。"],["結構提示","於 createDebounce 回傳函式內第 4 行補上 clearTimeout(timer);。"]]}',
1, 1, 3, 1),

(4, 'admin_1', 'admin', '第 1 關：成員未封裝', '成員未封裝 · 鐘樓長鳴',
'public class TownClockTimer {\n    public int strikeCount = 0;\n}',
'{"file":"TownClockTimer.java","required_tokens":["class","private"],"hints":[["方向提示","鐘樓計數器 strikeCount 目前是 public，任何外部程式都能直接竄改。"],["關鍵概念","物件導向封裝 (Encapsulation) 要求將內部狀態欄位設為 private。"],["結構提示","將第 2 行的 public int strikeCount 改為 private int strikeCount。"]]}',
1, 1, 4, 1),

(5, 'industrial_1', 'industrial', '第 1 關：指標位址誤寫', '指標位址誤寫 · 水庫壓力過載',
'void calibrate_valve(int* valve_status) {\n    valve_status = 1;\n}',
'{"file":"valve_control.cpp","required_tokens":["*valve_status","&"],"hints":[["方向提示","函式參數 int* valve_status 是記憶體位址（指標），直接寫 valve_status = 1 會改錯地方。"],["關鍵概念","必須使用解引用運算元 *（Dereference）來修改指標所指向的目標變數值。"],["結構提示","將第 2 行改為 *valve_status = 1;。"]]}',
1, 1, 5, 1),

(6, 'market_2', 'market', '第 2 關：批發購物車折扣結算', '陣列累加與門檻折扣 · 結算異常',
'const items = [120, 80, 150];\n// 目標：使用 reduce 加總金額，滿 300 折 50，並印出實付金額\nconst total = items.reduce((sum, p) => sum + p, 0);\nconst finalPrice = total > 400 ? total - 50 : total;\nconsole.log(finalPrice);',
'{"file":"cart_discount.js","required_token":"reduce","pass_pattern":">= 300","expected_stdout":"300"}',
1, 1, 6, 2),

(7, 'admin_2', 'admin', '第 2 關：檔案館索引空指標防護', '集合預設值存取 · NullPointer 異常',
'import java.util.HashMap;\npublic class ArchiveIndex {\n    public static int getAccessCount(HashMap<String, Integer> map, String key) {\n        return map.get(key);\n    }\n}',
'{"file":"ArchiveIndex.java","required_token":"HashMap","pass_pattern":"getOrDefault","expected_stdout":"0"}',
1, 1, 7, 2),

(8, 'industrial_2', 'industrial', '第 2 關：渦輪緩衝區安全釋放', '動態記憶體釋放 · 懸空指標風險',
'void release_buffer(int* buf) {\n    delete[] buf;\n    // 目標：釋放後將指標設為 nullptr 避免重複釋放\n}',
'{"file":"buffer_guard.cpp","required_token":"delete[]","pass_pattern":"nullptr","expected_stdout":"SAFE_RELEASE"}',
1, 1, 8, 2);

-- 4.3 公開與隱藏測試案例（V2.6 P0）
INSERT INTO `test_cases` (`level_id`, `input_params_json`, `expected_stdout`, `is_hidden`, `timeout_ms`) VALUES
(1, '{"moisture": 18}', 'SPRINKLER_ON', 0, 2000),
(1, '{"moisture": 40}', 'SPRINKLER_OFF', 1, 2000),
(1, '{"moisture": 39}', 'SPRINKLER_ON', 1, 2000),
(2, '{}', '2', 0, 2000);

-- 4.4 離線 Fallback 劇本庫 (24 條)
INSERT INTO `offline_scripts` (`sector_id`, `affection_tier`, `trigger_event`, `language_code`, `script_version`, `is_active`, `dialogue_text`, `emotion_tag`) VALUES
('admin', 1, 'PASS', 'zh-HK', 'v2.5', 1, '「這份封裝勉強符合《鎮公所規章》第三條，下次請注意縮排規範。」', 'strict_nod'),
('admin', 1, 'FAIL', 'zh-HK', 'v2.5', 1, '「存取修飾詞仍有疏漏，成員變數暴露在外會導致鐘樓失控，請重寫。」', 'strict_frown'),
('admin', 2, 'PASS', 'zh-HK', 'v2.5', 1, '「不錯，有你在的話，核心排程邏輯交給你處理我也能放心了。」', 'trust_smile'),
('admin', 2, 'FAIL', 'zh-HK', 'v2.5', 1, '「再檢查一次類別封裝邊界吧，這杯黑咖啡先放你桌上。」', 'calm_support'),
('admin', 3, 'PASS', 'zh-HK', 'v2.5', 1, '「鐘樓運作穩定。其實……我已經把最高存取權限的保留字留給你了。」', 'blush_warm'),
('admin', 3, 'FAIL', 'zh-HK', 'v2.5', 1, '「沒關係，就算規章再嚴格，我也會陪你一行行核對到通過為止。」', 'gentle_encourage'),
('farm', 1, 'PASS', 'zh-HK', 'v2.5', 1, '「總算修好了！雖然行數還可以再精簡一點，但水閥總算正常運作了。」', 'relieved_sigh'),
('farm', 1, 'FAIL', 'zh-HK', 'v2.5', 1, '「喂喂，土壤濕度都低於 40% 了水閥怎麼還沒開？再看一次條件判斷啦！」', 'anxious_point'),
('farm', 2, 'PASS', 'zh-HK', 'v2.5', 1, '「太順手了吧！走，既然腳本自己會跑，我們去溫室吃哈密瓜！」', 'happy_wink'),
('farm', 2, 'FAIL', 'zh-HK', 'v2.5', 1, '「邊界條件好像差了一點點，要不要喝口水再看看 39 跟 40 的差別？」', 'helpful_smile'),
('farm', 3, 'PASS', 'zh-HK', 'v2.5', 1, '「就算未來系統再怎麼拋出例外，只要有你在，我都會笑著接住。」', 'affectionate_glow'),
('farm', 3, 'FAIL', 'zh-HK', 'v2.5', 1, '「別急，慢慢除錯就好，我就在溫室這邊陪你一起測試。」', 'warm_support'),
('market', 1, 'PASS', 'zh-HK', 'v2.5', 1, '「謝謝惠顧！收銀防抖恢復正常了，市集總算不會重複扣款。」', 'hostess_smile'),
('market', 1, 'FAIL', 'zh-HK', 'v2.5', 1, '「客人連點按鈕又送出重複訂單了！檢查看看計時器是不是沒清除？」', 'flustered_wave'),
('market', 2, 'PASS', 'zh-HK', 'v2.5', 1, '「嘿嘿，這個事件監聽器寫得真漂亮，簡直跟我的手腳一樣快！」', 'playful_grin'),
('market', 2, 'FAIL', 'zh-HK', 'v2.5', 1, '「哎呀，出現預期外的輸出啦！快檢查一下 callback 的防抖延遲。」', 'teasing_poke'),
('market', 3, 'PASS', 'zh-HK', 'v2.5', 1, '「面對其他事我都能非同步排隊，唯獨你……我想立刻 Resolve 你的心。」', 'heartfelt_blush'),
('market', 3, 'FAIL', 'zh-HK', 'v2.5', 1, '「不用擔心事件佇列塞車，無論多久我都會優先監聽你的請求。」', 'caring_look'),
('industrial', 1, 'PASS', 'zh-HK', 'v2.5', 1, '「……嗯，指標位址寫對了。水庫壓力總算降下來。」', 'stoic_nod'),
('industrial', 1, 'FAIL', 'zh-HK', 'v2.5', 1, '「外行人別亂動！指標沒有解引用就賦值，水庫十秒內就會跳掣。」', 'stern_glare'),
('industrial', 2, 'PASS', 'zh-HK', 'v2.5', 1, '「你這段記憶體釋放時序挺準的！來，這份 1978 年齒輪中斷表我講給你聽。」', 'excited_explain'),
('industrial', 2, 'FAIL', 'zh-HK', 'v2.5', 1, '「位址運算元再看仔細點，* 是取值、& 是取位址，別搞混了。」', 'focused_coach'),
('industrial', 3, 'PASS', 'zh-HK', 'v2.5', 1, '「這顆心臟的指標與位址，我早就無條件交給你全權託管了。」', 'devoted_blush'),
('industrial', 3, 'FAIL', 'zh-HK', 'v2.5', 1, '「再試一次，我幫你盯著壓力表，底層機房不會垮的。」', 'steady_trust');

-- 4.5 系統成就徽章定義 (4 筆，V2.6 P1)
INSERT INTO `achievements` (`achievement_code`, `title`, `description`, `icon_emoji`) VALUES
('first_clear', '初試啼聲', '第一次成功修復任一基建', '🌱'),
('no_hint_clear', '獨立修復', '不使用提示通關一關', '🔧'),
('fast_clear', '極速除錯', '首次嘗試即一次通關', '⚡'),
('all_sectors', '全鎮巡修', '四區各至少通關一關', '🗺️');
