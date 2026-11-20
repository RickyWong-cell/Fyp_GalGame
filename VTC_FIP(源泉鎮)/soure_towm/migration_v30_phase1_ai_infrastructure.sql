-- =====================================================================
-- 《源泉鎮 Source Town》V3.0 Phase 1 - 安全增量升級 Migration
-- 版本識別：v3.0_phase1_stabilization
-- 適用環境：XAMPP MariaDB 10.4+ / MySQL 8.0+ (既有 source_town 資料庫)
-- 安全原則：
--   1. 絕不使用 DROP TABLE，不覆蓋或刪除任何既有玩家進度與存檔。
--   2. 所有資料表與索引建立皆具備冪等性 (Idempotent)，可重複安全執行。
--   3. 透過 schema_migrations 追蹤已執行版本。
-- 回滾說明：
--   升級前請先備份：mysqldump -u root source_town > backup_before_v30.sql
--   若需回滾新增之 AI 資料表，可依序執行：
--     DROP TRIGGER IF EXISTS `prevent_ai_log_update`;
--     DROP TRIGGER IF EXISTS `prevent_ai_log_delete`;
--     DROP TABLE IF EXISTS `ai_reservations`, `ai_request_logs`, `ai_usage_daily`;
--     DELETE FROM `schema_migrations` WHERE `version` = 'v3.0_phase1_stabilization';
-- =====================================================================

SET NAMES utf8mb4;
SET TIME_ZONE = '+08:00';

USE `source_town`;

-- ---------------------------------------------------------------------
-- 1. Migration 版本管理表
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `schema_migrations` (
  `version` VARCHAR(64) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `applied_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. 補齊 V2.6 核心 API 所需但舊版匯出檔缺漏之資料表
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `student_save_slots` (
  `slot_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_uuid` VARCHAR(64) NOT NULL,
  `slot_index` TINYINT UNSIGNED NOT NULL,
  `label` VARCHAR(100) NOT NULL DEFAULT '進度快照',
  `current_sector` ENUM('admin', 'farm', 'market', 'industrial') NOT NULL DEFAULT 'farm',
  `current_level_code` VARCHAR(64) NOT NULL DEFAULT 'farm_1',
  `progress_summary` VARCHAR(100) NOT NULL DEFAULT '0/8 關 (0%)',
  `snapshot_json` LONGTEXT NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`slot_id`),
  UNIQUE KEY `uk_save_slot_student_idx` (`student_uuid`, `slot_index`),
  KEY `idx_save_slot_updated` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `student_script_unlocks` (
  `unlock_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_uuid` VARCHAR(64) NOT NULL,
  `sector_id` ENUM('admin', 'farm', 'market', 'industrial') NOT NULL,
  `script_id` INT UNSIGNED NOT NULL,
  `has_unread_dialogue` TINYINT(1) NOT NULL DEFAULT 1,
  `unlocked_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`unlock_id`),
  UNIQUE KEY `uk_unlock_student_script` (`student_uuid`, `sector_id`, `script_id`),
  KEY `idx_unlock_student_unread` (`student_uuid`, `has_unread_dialogue`),
  CONSTRAINT `fk_unlock_sector` FOREIGN KEY (`sector_id`) REFERENCES `sectors` (`sector_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_unlock_script` FOREIGN KEY (`script_id`) REFERENCES `offline_scripts` (`script_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. V3.0 Phase 1 AI 基礎設施資料表
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ai_usage_daily` (
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

-- AI 併發預留與冪等結算追蹤表（P1-01 / P1-05）
CREATE TABLE IF NOT EXISTS `ai_reservations` (
  `reservation_id` CHAR(32) NOT NULL,
  `subject_id` VARCHAR(64) NOT NULL,
  `usage_date` DATE NOT NULL,
  `estimated_input_tokens` INT UNSIGNED NOT NULL DEFAULT 0,
  `max_output_tokens` INT UNSIGNED NOT NULL DEFAULT 0,
  `reserved_tokens` INT UNSIGNED NOT NULL DEFAULT 0,
  `actual_prompt_tokens` INT UNSIGNED NULL DEFAULT NULL,
  `actual_completion_tokens` INT UNSIGNED NULL DEFAULT NULL,
  `status` ENUM('RESERVED', 'SETTLED', 'RELEASED') NOT NULL DEFAULT 'RESERVED',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `settled_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`reservation_id`),
  KEY `idx_ai_res_subject_created` (`subject_id`, `created_at`),
  KEY `idx_ai_res_status_date` (`status`, `usage_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_request_logs` (
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
-- 4. Append-only 保護觸發器
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS `prevent_ai_log_update`;
DROP TRIGGER IF EXISTS `prevent_ai_log_delete`;

DELIMITER $$

CREATE TRIGGER `prevent_ai_log_update` BEFORE UPDATE ON `ai_request_logs`
FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Policy: ai_request_logs is append-only.';
END$$

CREATE TRIGGER `prevent_ai_log_delete` BEFORE DELETE ON `ai_request_logs`
FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Policy: ai_request_logs is append-only.';
END$$

DELIMITER ;

-- ---------------------------------------------------------------------
-- 5. 寫入 Migration 版本紀錄
-- ---------------------------------------------------------------------
INSERT IGNORE INTO `schema_migrations` (`version`, `description`) VALUES
('v3.0_phase1_ai_infrastructure', 'Add ai_usage_daily, ai_request_logs and append-only triggers'),
('v3.0_phase1_stabilization', 'Add schema_migrations, ai_reservations, student_save_slots, student_script_unlocks');
