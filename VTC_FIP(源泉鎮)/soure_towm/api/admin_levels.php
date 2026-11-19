<?php
// 《源泉鎮 Source Town》V2.6 教師關卡寫入與狀態切換 MySQL API
declare(strict_types=1);

require_once __DIR__ . '/db.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    sendJson(['ok' => false, 'error' => 'METHOD_NOT_ALLOWED'], 405);
}

try {
    $pdo = getDbConnection();
    $sess = getActiveSession($pdo);
    if (!$sess || $sess['role'] !== 'admin') {
        sendJson(['ok' => false, 'error' => 'UNAUTHORIZED'], 403);
    }

    $body = readJsonInput();
    $action = $body['action'] ?? 'create';

    if ($action === 'toggle') {
        $levelCode = trim((string)($body['level_code'] ?? ''));
        $isActive = !empty($body['is_active']) ? 1 : 0;
        $stmt = $pdo->prepare('UPDATE levels SET is_active = ? WHERE level_code = ?');
        $stmt->execute([$isActive, $levelCode]);
        sendJson(['ok' => true]);
    }

    $levelCode = trim((string)($body['id'] ?? ('custom_' . time())));
    $sectorId = trim((string)($body['sectorId'] ?? 'farm'));
    $title = trim((string)($body['title'] ?? ''));
    $metaphor = trim((string)($body['metaphor'] ?? '自訂邏輯修復'));
    $starter = (string)($body['starter'] ?? '');

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
