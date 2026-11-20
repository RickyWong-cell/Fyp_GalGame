<?php
// 《源泉鎮 Source Town》V2.6 全資料庫即時寫入 API（草稿、評測、對話已讀、成就解鎖）
declare(strict_types=1);

require_once __DIR__ . '/db.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    sendJson(['ok' => false, 'error' => 'METHOD_NOT_ALLOWED'], 405);
}

try {
    $pdo = getDbConnection();
    $sess = requireAuthenticatedCsrf($pdo);
    $studentUuid = (string)$sess['subject_id'];
    $body = readJsonInput();
    $action = (string)($body['action'] ?? 'submit_result');

    if ($action === 'mark_dialogue_read') {
        $sectorId = trim((string)($body['sector_id'] ?? ''));
        if (in_array($sectorId, ['admin', 'farm', 'market', 'industrial'], true)) {
            $stmt = $pdo->prepare(
                'UPDATE student_script_unlocks SET has_unread_dialogue = 0 WHERE student_uuid = ? AND sector_id = ?'
            );
            $stmt->execute([$studentUuid, $sectorId]);
        }
        sendJson(['ok' => true, 'action' => 'mark_dialogue_read']);
    }

    $levelCode = trim((string)($body['level_code'] ?? ''));
    if ($levelCode === '') {
        sendJson(['ok' => false, 'error' => 'MISSING_LEVEL_CODE'], 400);
    }

    $lvlStmt = $pdo->prepare('SELECT level_id, sector_id FROM levels WHERE level_code = ? LIMIT 1');
    $lvlStmt->execute([$levelCode]);
    $lvl = $lvlStmt->fetch();
    if (!$lvl) {
        sendJson(['ok' => false, 'error' => 'LEVEL_NOT_FOUND'], 404);
    }
    $levelId = (int)$lvl['level_id'];
    $sectorId = $lvl['sector_id'];

    if ($action === 'save_draft') {
        $draftCode = (string)($body['draft_code'] ?? '');
        $stmt = $pdo->prepare(
            'INSERT INTO student_progress (student_uuid, level_id, is_completed, attempts, best_score, draft_code)
             VALUES (?, ?, 0, 0, 0, ?)
             ON DUPLICATE KEY UPDATE draft_code = VALUES(draft_code), updated_at = NOW()'
        );
        $stmt->execute([$studentUuid, $levelId, $draftCode]);
        sendJson(['ok' => true, 'action' => 'save_draft']);
    }

    $submittedCode = (string)($body['submitted_code'] ?? '');
    $passedL1 = array_key_exists('passed_l1', $body) && $body['passed_l1'] !== null ? (int)$body['passed_l1'] : null;
    $passedL2 = array_key_exists('passed_l2', $body) && $body['passed_l2'] !== null ? (int)$body['passed_l2'] : null;
    $passedL3 = array_key_exists('passed_l3', $body) && $body['passed_l3'] !== null ? (int)$body['passed_l3'] : null;
    $execStatus = (string)($body['exec_status'] ?? 'SYSTEM_ERROR');
    $latencyMs = max(0, (int)($body['latency_ms'] ?? 0));
    $hintDepth = max(0, (int)($body['hint_depth_used'] ?? 0));
    // P0-02: 好感度與 Tier 完全由後端依驗證結果計算，忽略前端傳入的分數
    $isSuccess = ($execStatus === 'PASS' || $execStatus === 'CONCEPT_PASS');
    $evalMode = in_array($sectorId, ['farm', 'market'], true) ? 'runtime' : 'concept_simulation';

    $pdo->beginTransaction();

    $prevProgStmt = $pdo->prepare('SELECT is_completed, attempts FROM student_progress WHERE student_uuid = ? AND level_id = ? LIMIT 1');
    $prevProgStmt->execute([$studentUuid, $levelId]);
    $prevProg = $prevProgStmt->fetch();
    $wasCompleted = $prevProg ? ((int)$prevProg['is_completed'] === 1) : false;
    $newAttempts = ($prevProg ? (int)$prevProg['attempts'] : 0) + 1;
    $isFirstPass = ($isSuccess && !$wasCompleted) ? 1 : 0;

    $hasFirstPassCol = $pdo->query("SHOW COLUMNS FROM submission_audit_logs LIKE 'is_first_pass'")->fetchColumn() !== false;
    if ($hasFirstPassCol) {
        $logStmt = $pdo->prepare(
            'INSERT INTO submission_audit_logs
             (student_uuid, level_id, evaluation_mode, submitted_code, passed_l1, passed_l2, passed_l3, exec_status, latency_ms, hint_depth_used, is_first_pass)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $logStmt->execute([
            $studentUuid, $levelId, $evalMode, $submittedCode,
            $passedL1, $passedL2, $passedL3, $execStatus, $latencyMs, $hintDepth, $isFirstPass
        ]);
    } else {
        $logStmt = $pdo->prepare(
            'INSERT INTO submission_audit_logs
             (student_uuid, level_id, evaluation_mode, submitted_code, passed_l1, passed_l2, passed_l3, exec_status, latency_ms, hint_depth_used)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $logStmt->execute([
            $studentUuid, $levelId, $evalMode, $submittedCode,
            $passedL1, $passedL2, $passedL3, $execStatus, $latencyMs, $hintDepth
        ]);
    }

    $progStmt = $pdo->prepare(
        'INSERT INTO student_progress (student_uuid, level_id, is_completed, attempts, best_score, draft_code)
         VALUES (?, ?, ?, 1, ?, ?)
         ON DUPLICATE KEY UPDATE
           is_completed = GREATEST(is_completed, VALUES(is_completed)),
           attempts = attempts + 1,
           best_score = GREATEST(best_score, VALUES(best_score)),
           draft_code = VALUES(draft_code),
           updated_at = NOW()'
    );
    $progStmt->execute([
        $studentUuid,
        $levelId,
        $isSuccess ? 1 : 0,
        $isSuccess ? 100 : 0,
        $submittedCode
    ]);

    $prevAffStmt = $pdo->prepare('SELECT current_score, current_tier FROM student_affection WHERE student_uuid = ? AND sector_id = ? LIMIT 1 FOR UPDATE');
    $prevAffStmt->execute([$studentUuid, $sectorId]);
    $prevAffRow = $prevAffStmt->fetch();
    $prevScoreInt = $prevAffRow ? (int)$prevAffRow['current_score'] : 0;
    $prevTierInt = $prevAffRow ? (int)$prevAffRow['current_tier'] : 1;

    $affDelta = 0;
    if ($isSuccess) {
        $affDelta = ($isFirstPass === 1) ? 15 : 2;
    }
    $affScore = max(0, min(100, $prevScoreInt + $affDelta));
    $affTier = ($affScore >= 70) ? 3 : (($affScore >= 35) ? 2 : 1);

    $affStmt = $pdo->prepare(
        'INSERT INTO student_affection (student_uuid, sector_id, current_score, current_tier)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           current_score = VALUES(current_score),
           current_tier = VALUES(current_tier),
           updated_at = NOW()'
    );
    $affStmt->execute([$studentUuid, $sectorId, $affScore, $affTier]);

    if ($affScore !== $prevScoreInt) {
        $histStmt = $pdo->prepare(
            'INSERT INTO affection_history (student_uuid, sector_id, delta, new_score, trigger_event)
             VALUES (?, ?, ?, ?, ?)'
        );
        $histStmt->execute([$studentUuid, $sectorId, $affScore - $prevScoreInt, $affScore, $execStatus]);
    }

    // 好感度升階時記錄新對話提示於 student_script_unlocks
    if ($affTier > $prevTierInt) {
        $scFind = $pdo->prepare(
            "SELECT script_id FROM offline_scripts WHERE sector_id = ? AND affection_tier = ? AND trigger_event = 'PASS' LIMIT 1"
        );
        $scFind->execute([$sectorId, $affTier]);
        $scriptId = $scFind->fetchColumn();
        if ($scriptId !== false) {
            $insUnl = $pdo->prepare(
                'INSERT INTO student_script_unlocks (student_uuid, sector_id, script_id, has_unread_dialogue)
                 VALUES (?, ?, ?, 1)
                 ON DUPLICATE KEY UPDATE has_unread_dialogue = 1'
            );
            $insUnl->execute([$studentUuid, $sectorId, (int)$scriptId]);
        }
    }

    $newlyUnlocked = [];
    if ($isSuccess) {
        $hasAchTable = $pdo->query("SHOW TABLES LIKE 'student_achievements'")->fetchColumn() !== false;
        if ($hasAchTable) {
            $candidates = ['first_clear'];
            if ($hintDepth === 0) $candidates[] = 'no_hint_clear';
            if ($newAttempts === 1) $candidates[] = 'fast_clear';

            $secCountStmt = $pdo->prepare(
                'SELECT COUNT(DISTINCT l.sector_id)
                 FROM student_progress p
                 JOIN levels l ON l.level_id = p.level_id
                 WHERE p.student_uuid = ? AND p.is_completed = 1'
            );
            $secCountStmt->execute([$studentUuid]);
            if ((int)$secCountStmt->fetchColumn() >= 4) {
                $candidates[] = 'all_sectors';
            }

            $insAch = $pdo->prepare('INSERT IGNORE INTO student_achievements (student_uuid, achievement_code) VALUES (?, ?)');
            $getAch = $pdo->prepare('SELECT achievement_code, title, description, icon_emoji FROM achievements WHERE achievement_code = ? LIMIT 1');
            foreach ($candidates as $code) {
                $insAch->execute([$studentUuid, $code]);
                if ($insAch->rowCount() > 0) {
                    $getAch->execute([$code]);
                    $row = $getAch->fetch();
                    if ($row) $newlyUnlocked[] = $row;
                }
            }
        }
    }

    $pdo->commit();
    sendJson([
        'ok' => true,
        'storage' => 'mysql_database',
        'affection_score' => $affScore,
        'affection_tier' => $affTier,
        'newly_unlocked_achievements' => $newlyUnlocked,
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendJson(['ok' => false, 'error' => 'DB_SYNC_ERROR'], 500);
}
