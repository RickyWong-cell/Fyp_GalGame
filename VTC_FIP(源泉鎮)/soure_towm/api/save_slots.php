<?php
// 《源泉鎮 Source Town》V2.6 MySQL 多槽位手動存讀檔 API (student_save_slots)
declare(strict_types=1);

require_once __DIR__ . '/db.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    sendJson(['ok' => false, 'error' => 'METHOD_NOT_ALLOWED'], 405);
}

try {
    $pdo = getDbConnection();
    $sess = getActiveSession($pdo);
    $body = readJsonInput();
    $studentUuid = $sess ? $sess['subject_id'] : trim((string)($body['student_uuid'] ?? ''));
    $slotIndex = isset($body['slot_index']) ? (int)$body['slot_index'] : -1;
    $action = (string)($body['action'] ?? 'save');

    if ($studentUuid === '' || $slotIndex < 0 || $slotIndex > 3) {
        sendJson(['ok' => false, 'error' => 'INVALID_SLOT_OR_SESSION'], 400);
    }

    if ($action === 'delete') {
        $stmt = $pdo->prepare('DELETE FROM student_save_slots WHERE student_uuid = ? AND slot_index = ?');
        $stmt->execute([$studentUuid, $slotIndex]);
        sendJson(['ok' => true, 'action' => 'delete', 'slot_index' => $slotIndex]);
    }

    if ($action === 'load') {
        $stmt = $pdo->prepare(
            'SELECT label, current_sector, current_level_code, progress_summary, snapshot_json
             FROM student_save_slots
             WHERE student_uuid = ? AND slot_index = ? LIMIT 1'
        );
        $stmt->execute([$studentUuid, $slotIndex]);
        $row = $stmt->fetch();
        if (!$row) {
            sendJson(['ok' => false, 'error' => 'SLOT_NOT_FOUND'], 404);
        }

        $snap = json_decode((string)$row['snapshot_json'], true);
        if (!is_array($snap)) {
            sendJson(['ok' => false, 'error' => 'CORRUPTED_SNAPSHOT'], 500);
        }

        // 將快照回寫至 student_progress 與 student_affection 確保資料庫一致
        $pdo->beginTransaction();

        $lvlMap = [];
        foreach ($pdo->query('SELECT level_id, level_code FROM levels')->fetchAll() as $lr) {
            $lvlMap[$lr['level_code']] = (int)$lr['level_id'];
        }

        $pdo->prepare('DELETE FROM student_progress WHERE student_uuid = ?')->execute([$studentUuid]);
        $insProg = $pdo->prepare(
            'INSERT INTO student_progress (student_uuid, level_id, is_completed, attempts, best_score, draft_code)
             VALUES (?, ?, ?, ?, ?, ?)'
        );

        $progress = is_array($snap['progress'] ?? null) ? $snap['progress'] : [];
        $drafts = is_array($snap['drafts'] ?? null) ? $snap['drafts'] : [];
        $prefix = $studentUuid . '_';

        $handledLevels = [];
        foreach ($progress as $k => $pv) {
            if (!str_starts_with($k, $prefix)) continue;
            $code = substr($k, strlen($prefix));
            if (!isset($lvlMap[$code])) continue;
            $handledLevels[$code] = true;
            $insProg->execute([
                $studentUuid,
                $lvlMap[$code],
                !empty($pv['completed']) ? 1 : 0,
                (int)($pv['attempts'] ?? 0),
                (int)($pv['bestScore'] ?? 0),
                $drafts[$k] ?? null,
            ]);
        }
        foreach ($drafts as $k => $dv) {
            if (!str_starts_with($k, $prefix)) continue;
            $code = substr($k, strlen($prefix));
            if (isset($handledLevels[$code]) || !isset($lvlMap[$code])) continue;
            $insProg->execute([$studentUuid, $lvlMap[$code], 0, 0, 0, $dv]);
        }

        $pdo->prepare('DELETE FROM student_affection WHERE student_uuid = ?')->execute([$studentUuid]);
        $insAff = $pdo->prepare(
            'INSERT INTO student_affection (student_uuid, sector_id, current_score, current_tier)
             VALUES (?, ?, ?, ?)'
        );
        $affection = is_array($snap['affection'] ?? null) ? $snap['affection'] : [];
        foreach ($affection as $k => $av) {
            if (!str_starts_with($k, $prefix)) continue;
            $secId = substr($k, strlen($prefix));
            if (!in_array($secId, ['admin', 'farm', 'market', 'industrial'], true)) continue;
            $score = max(0, min(100, (int)($av['score'] ?? 0)));
            $tier = ($score >= 70) ? 3 : (($score >= 35) ? 2 : 1);
            $insAff->execute([$studentUuid, $secId, $score, $tier]);
        }

        $pdo->commit();

        sendJson([
            'ok' => true,
            'action' => 'load',
            'slot_index' => $slotIndex,
            'currentSector' => $row['current_sector'],
            'currentLevelId' => $row['current_level_code'],
            'snapshot' => $snap,
        ]);
    }

    // Default: save
    $label = trim((string)($body['label'] ?? '進度快照'));
    $currentSector = in_array($body['currentSector'] ?? '', ['admin', 'farm', 'market', 'industrial'], true)
        ? $body['currentSector'] : 'farm';
    $currentLevelCode = trim((string)($body['currentLevelId'] ?? 'farm_1'));
    $progressSummary = trim((string)($body['progressSummary'] ?? '0/8 關 (0%)'));
    $snapshotJson = json_encode($body['payload'] ?? [], JSON_UNESCAPED_UNICODE);

    $stmt = $pdo->prepare(
        'INSERT INTO student_save_slots
         (student_uuid, slot_index, label, current_sector, current_level_code, progress_summary, snapshot_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           label = VALUES(label),
           current_sector = VALUES(current_sector),
           current_level_code = VALUES(current_level_code),
           progress_summary = VALUES(progress_summary),
           snapshot_json = VALUES(snapshot_json),
           updated_at = NOW()'
    );
    $stmt->execute([$studentUuid, $slotIndex, $label, $currentSector, $currentLevelCode, $progressSummary, $snapshotJson]);

    sendJson([
        'ok' => true,
        'action' => 'save',
        'slot_index' => $slotIndex,
        'savedAt' => date('Y-m-d H:i:s'),
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendJson(['ok' => false, 'error' => 'SAVE_SLOT_DB_ERROR'], 500);
}
