<?php
// 《源泉鎮 Source Town》V2.6 教師關卡寫入與狀態切換 MySQL API
declare(strict_types=1);

require_once __DIR__ . '/db.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    sendJson(['ok' => false, 'error' => 'METHOD_NOT_ALLOWED'], 405);
}

try {
    $pdo = getDbConnection();
    $sess = requireAuthenticatedCsrf($pdo, 'admin');

    $body = readJsonInput();
    $action = (string)($body['action'] ?? 'create');

    if ($action === 'toggle') {
        $levelCode = trim((string)($body['level_code'] ?? ''));
        if ($levelCode === '' || !preg_match('/^[a-zA-Z0-9_-]{2,64}$/', $levelCode)) {
            sendJson(['ok' => false, 'error' => 'INVALID_LEVEL_CODE'], 400);
        }
        $isActive = !empty($body['is_active']) ? 1 : 0;
        $stmt = $pdo->prepare('UPDATE levels SET is_active = ? WHERE level_code = ?');
        $stmt->execute([$isActive, $levelCode]);
        sendJson(['ok' => true]);
    }

    if ($action === 'delete') {
        $levelCode = trim((string)($body['level_code'] ?? ''));
        if ($levelCode === '' || !preg_match('/^[a-zA-Z0-9_-]{2,64}$/', $levelCode)) {
            sendJson(['ok' => false, 'error' => 'INVALID_LEVEL_CODE'], 400);
        }

        $findStmt = $pdo->prepare('SELECT level_id, is_builtin FROM levels WHERE level_code = ? LIMIT 1');
        $findStmt->execute([$levelCode]);
        $row = $findStmt->fetch();
        if (!$row) {
            sendJson(['ok' => true, 'mode' => 'deleted']);
        }
        if ((int)$row['is_builtin'] === 1) {
            sendJson(['ok' => false, 'error' => 'BUILTIN_LEVEL_PROTECTED', 'msg' => '內建核心關卡不可刪除'], 403);
        }

        $levelId = (int)$row['level_id'];
        $auditStmt = $pdo->prepare('SELECT 1 FROM submission_audit_logs WHERE level_id = ? LIMIT 1');
        $auditStmt->execute([$levelId]);
        if ($auditStmt->fetchColumn()) {
            $updStmt = $pdo->prepare('UPDATE levels SET is_active = 0 WHERE level_id = ? AND is_builtin = 0');
            $updStmt->execute([$levelId]);
            sendJson([
                'ok' => true,
                'mode' => 'archived',
                'msg' => '此關卡已有學生作答審計紀錄，已改為停用封存以保留紀錄'
            ]);
        }

        $delStmt = $pdo->prepare('DELETE FROM levels WHERE level_id = ? AND is_builtin = 0');
        $delStmt->execute([$levelId]);
        sendJson(['ok' => true, 'mode' => 'deleted']);
    }

    $levelCode = trim((string)($body['id'] ?? ('custom_' . time())));
    $sectorId = trim((string)($body['sectorId'] ?? 'farm'));
    $title = trim((string)($body['title'] ?? ''));
    $metaphor = trim((string)($body['metaphor'] ?? '自訂邏輯修復'));
    $starter = (string)($body['starter'] ?? '');

    $allowedSectors = ['farm', 'market', 'admin', 'industrial'];
    if (!in_array($sectorId, $allowedSectors, true)) {
        sendJson(['ok' => false, 'error' => 'INVALID_SECTOR_ID'], 400);
    }
    if (!preg_match('/^[a-zA-Z0-9_-]{2,64}$/', $levelCode)) {
        sendJson(['ok' => false, 'error' => 'INVALID_LEVEL_CODE'], 400);
    }
    if ($title === '' || $starter === '') {
        sendJson(['ok' => false, 'error' => 'INVALID_LEVEL_INPUT'], 400);
    }

    $metaJson = json_encode([
        'file' => $body['file'] ?? 'custom_task.code',
        'required_token' => $body['requiredToken'] ?? '',
        'pass_pattern' => $body['passPattern'] ?? '',
        'expected_stdout' => $body['expectedStdout'] ?? '',
        'hints' => $body['hints'] ?? [],
    ], JSON_UNESCAPED_UNICODE);

    $stmt = $pdo->prepare(
        'INSERT INTO levels (level_code, sector_id, title, metaphor_tag, starter_code, ast_rule_json, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)'
    );
    $stmt->execute([$levelCode, $sectorId, $title, $metaphor, $starter, $metaJson]);

    sendJson(['ok' => true, 'level_code' => $levelCode]);
} catch (Throwable $e) {
    sendJson(['ok' => false, 'error' => 'ADMIN_LEVEL_DB_ERROR'], 500);
}
