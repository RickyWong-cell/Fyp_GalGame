<?php
// 《源泉鎮 Source Town》問題回報 (Issue / Bug Reports) API
declare(strict_types=1);

require_once __DIR__ . '/db.php';

function ensureIssueReportsTable(PDO $pdo): void {
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS `issue_reports` (
          `report_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          `student_uuid` VARCHAR(64) NOT NULL,
          `category` ENUM('level_bug','story_bug','ui_bug','suggestion') NOT NULL DEFAULT 'level_bug',
          `sector_id` ENUM('admin','farm','market','industrial') NULL DEFAULT NULL,
          `level_code` VARCHAR(64) NULL DEFAULT NULL,
          `title` VARCHAR(120) NOT NULL,
          `description` TEXT NOT NULL,
          `client_meta_json` LONGTEXT NULL,
          `status` ENUM('OPEN','IN_PROGRESS','RESOLVED','WONT_FIX') NOT NULL DEFAULT 'OPEN',
          `admin_note` VARCHAR(500) NULL DEFAULT NULL,
          `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`report_id`),
          KEY `idx_issue_status_created` (`status`, `created_at`),
          KEY `idx_issue_student_created` (`student_uuid`, `created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    $pdo = getDbConnection();
    ensureIssueReportsTable($pdo);

    if ($method === 'GET') {
        $sess = getActiveSession($pdo);
        if (!$sess || ($sess['role'] ?? '') !== 'admin') {
            sendJson(['ok' => false, 'error' => 'UNAUTHORIZED', 'msg' => '僅限教師帳號查看問題回報'], 403);
        }

        $statusFilter = trim((string)($_GET['status'] ?? 'ALL'));
        $allowedStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'WONT_FIX'];

        if (in_array($statusFilter, $allowedStatuses, true)) {
            $stmt = $pdo->prepare(
                "SELECT report_id, student_uuid, category, sector_id, level_code, title, description,
                        client_meta_json, status, admin_note, created_at, updated_at
                 FROM issue_reports
                 WHERE status = ?
                 ORDER BY created_at DESC
                 LIMIT 100"
            );
            $stmt->execute([$statusFilter]);
        } else {
            $stmt = $pdo->query(
                "SELECT report_id, student_uuid, category, sector_id, level_code, title, description,
                        client_meta_json, status, admin_note, created_at, updated_at
                 FROM issue_reports
                 ORDER BY FIELD(status, 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'WONT_FIX'), created_at DESC
                 LIMIT 100"
            );
        }

        sendJson(['ok' => true, 'reports' => $stmt->fetchAll()]);
    }

    if ($method !== 'POST') {
        sendJson(['ok' => false, 'error' => 'METHOD_NOT_ALLOWED'], 405);
    }

    $sess = requireAuthenticatedCsrf($pdo);
    $body = readJsonInput();
    $action = (string)($body['action'] ?? 'create');

    if ($action === 'update_status') {
        if (($sess['role'] ?? '') !== 'admin') {
            sendJson(['ok' => false, 'error' => 'UNAUTHORIZED', 'msg' => '僅限教師帳號更新處理狀態'], 403);
        }
        $reportId = (int)($body['report_id'] ?? 0);
        $newStatus = trim((string)($body['status'] ?? ''));
        $adminNote = mb_substr(trim((string)($body['admin_note'] ?? '')), 0, 500, 'UTF-8');
        $allowedStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'WONT_FIX'];

        if ($reportId <= 0 || !in_array($newStatus, $allowedStatuses, true)) {
            sendJson(['ok' => false, 'error' => 'INVALID_STATUS_INPUT', 'msg' => '無效的回報編號或狀態'], 400);
        }

        $upd = $pdo->prepare('UPDATE issue_reports SET status = ?, admin_note = ? WHERE report_id = ?');
        $upd->execute([$newStatus, $adminNote !== '' ? $adminNote : null, $reportId]);
        sendJson(['ok' => true]);
    }

    $category = trim((string)($body['category'] ?? 'level_bug'));
    $allowedCategories = ['level_bug', 'story_bug', 'ui_bug', 'suggestion'];
    if (!in_array($category, $allowedCategories, true)) {
        $category = 'level_bug';
    }

    $sectorId = trim((string)($body['sector_id'] ?? ''));
    $allowedSectors = ['admin', 'farm', 'market', 'industrial'];
    $sectorParam = in_array($sectorId, $allowedSectors, true) ? $sectorId : null;

    $levelCode = trim((string)($body['level_code'] ?? ''));
    $levelParam = ($levelCode !== '' && preg_match('/^[a-zA-Z0-9_-]{2,64}$/', $levelCode)) ? $levelCode : null;

    $title = trim((string)($body['title'] ?? ''));
    $description = trim((string)($body['description'] ?? ''));

    if ($title === '' || mb_strlen($title, 'UTF-8') > 120) {
        sendJson(['ok' => false, 'error' => 'INVALID_TITLE', 'msg' => '請輸入 1 至 120 字內的問題標題'], 400);
    }
    if ($description === '' || mb_strlen($description, 'UTF-8') > 2000) {
        sendJson(['ok' => false, 'error' => 'INVALID_DESCRIPTION', 'msg' => '請輸入 1 至 2000 字內的詳細描述'], 400);
    }

    $clientMeta = $body['client_meta'] ?? null;
    $metaJson = is_array($clientMeta)
        ? json_encode($clientMeta, JSON_UNESCAPED_UNICODE)
        : null;
    if ($metaJson !== null && strlen($metaJson) > 2048) {
        $metaJson = substr($metaJson, 0, 2048);
    }

    $ins = $pdo->prepare(
        "INSERT INTO issue_reports
         (student_uuid, category, sector_id, level_code, title, description, client_meta_json, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN')"
    );
    $ins->execute([
        (string)$sess['subject_id'],
        $category,
        $sectorParam,
        $levelParam,
        $title,
        $description,
        $metaJson,
    ]);

    sendJson([
        'ok' => true,
        'report_id' => (int)$pdo->lastInsertId(),
    ]);
} catch (Throwable $e) {
    sendJson(['ok' => false, 'error' => 'ISSUE_REPORT_ERROR', 'msg' => '問題回報儲存失敗'], 500);
}
