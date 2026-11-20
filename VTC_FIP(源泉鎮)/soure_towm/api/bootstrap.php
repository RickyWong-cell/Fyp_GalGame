<?php
// 《源泉鎮 Source Town》V2.6 全資料庫初始資料載入 API (關卡、劇本、進度、存檔槽位、成就、審計)
declare(strict_types=1);

require_once __DIR__ . '/db.php';

try {
    $pdo = getDbConnection();
    $sess = getActiveSession($pdo);
    $subjectId = $sess ? $sess['subject_id'] : null;
    $role = $sess ? $sess['role'] : 'guest';

    // 1. 讀取所有關卡（包含內建與自訂）
    $hasBuiltinCol = $pdo->query("SHOW COLUMNS FROM levels LIKE 'is_builtin'")->fetchColumn() !== false;
    $orderSql = $hasBuiltinCol ? 'ORDER BY sort_order ASC, level_id ASC' : 'ORDER BY level_id ASC';
    $lvlStmt = $pdo->query(
        "SELECT level_id, level_code, sector_id, title, metaphor_tag, starter_code, ast_rule_json, is_active" .
        ($hasBuiltinCol ? ", is_builtin" : "") .
        " FROM levels {$orderSql}"
    );
    $dbLevels = [];
    $customLevels = [];
    foreach ($lvlStmt->fetchAll() as $row) {
        $meta = json_decode((string)$row['ast_rule_json'], true) ?: [];
        $isBuiltin = $hasBuiltinCol ? ((int)$row['is_builtin'] === 1) : !str_starts_with($row['level_code'], 'custom_');
        $item = [
            'id' => $row['level_code'],
            'sectorId' => $row['sector_id'],
            'title' => $row['title'],
            'file' => $meta['file'] ?? null,
            'metaphor' => $row['metaphor_tag'],
            'starter' => $row['starter_code'],
            'requiredToken' => $meta['required_token'] ?? '',
            'passPattern' => $meta['pass_pattern'] ?? '',
            'expectedStdout' => $meta['expected_stdout'] ?? '',
            'hints' => $meta['hints'] ?? null,
            'isBuiltin' => $isBuiltin,
            'isActive' => ((int)$row['is_active'] === 1),
        ];
        $dbLevels[] = $item;
        if (!$isBuiltin) {
            $customLevels[] = $item;
        }
    }

    // 2. 讀取 24 條劇本庫 (offline_scripts)
    $scriptsMap = [];
    $scStmt = $pdo->query(
        "SELECT sector_id, affection_tier, trigger_event, dialogue_text, emotion_tag
         FROM offline_scripts WHERE is_active = 1"
    );
    foreach ($scStmt->fetchAll() as $sr) {
        $sec = $sr['sector_id'];
        $tier = (int)$sr['affection_tier'];
        $ev = $sr['trigger_event'];
        if (!isset($scriptsMap[$sec])) $scriptsMap[$sec] = [];
        if (!isset($scriptsMap[$sec][$tier])) $scriptsMap[$sec][$tier] = [];
        $scriptsMap[$sec][$tier][$ev] = [$sr['dialogue_text'], $sr['emotion_tag']];
    }

    // 3. 讀取學生個人資料：進度、草稿、好感度、4 組存檔槽位、成就、未讀對話
    $progress = [];
    $drafts = [];
    $affection = [];
    $saveSlots = [null, null, null, null];
    $unlockedAchievements = [];
    $unreadDialogueSectors = [];

    if ($subjectId !== null) {
        $pStmt = $pdo->prepare(
            'SELECT l.level_code, p.is_completed, p.attempts, p.best_score, p.draft_code
             FROM student_progress p
             JOIN levels l ON l.level_id = p.level_id
             WHERE p.student_uuid = ?'
        );
        $pStmt->execute([$subjectId]);
        foreach ($pStmt->fetchAll() as $pRow) {
            $key = $subjectId . '_' . $pRow['level_code'];
            $progress[$key] = [
                'completed' => ((int)$pRow['is_completed'] === 1),
                'attempts' => (int)$pRow['attempts'],
                'bestScore' => (int)$pRow['best_score'],
            ];
            if ($pRow['draft_code'] !== null) {
                $drafts[$key] = $pRow['draft_code'];
            }
        }

        $aStmt = $pdo->prepare(
            'SELECT sector_id, current_score, current_tier
             FROM student_affection
             WHERE student_uuid = ?'
        );
        $aStmt->execute([$subjectId]);
        foreach ($aStmt->fetchAll() as $aRow) {
            $key = $subjectId . '_' . $aRow['sector_id'];
            $affection[$key] = [
                'score' => (int)$aRow['current_score'],
                'tier' => (int)$aRow['current_tier'],
            ];
        }

        $slotStmt = $pdo->prepare(
            'SELECT slot_index, label, current_sector, current_level_code, progress_summary, snapshot_json, updated_at
             FROM student_save_slots
             WHERE student_uuid = ?
             ORDER BY slot_index ASC'
        );
        $slotStmt->execute([$subjectId]);
        foreach ($slotStmt->fetchAll() as $sl) {
            $idx = (int)$sl['slot_index'];
            if ($idx >= 0 && $idx <= 3) {
                $saveSlots[$idx] = [
                    'savedAt' => $sl['updated_at'],
                    'studentUuid' => $subjectId,
                    'currentSector' => $sl['current_sector'],
                    'currentLevelId' => $sl['current_level_code'],
                    'progressSummary' => $sl['progress_summary'],
                    'label' => $sl['label'],
                    'payload' => json_decode((string)$sl['snapshot_json'], true) ?: [],
                ];
            }
        }

        $unrStmt = $pdo->prepare(
            'SELECT DISTINCT sector_id FROM student_script_unlocks WHERE student_uuid = ? AND has_unread_dialogue = 1'
        );
        $unrStmt->execute([$subjectId]);
        foreach ($unrStmt->fetchAll() as $ur) {
            $unreadDialogueSectors[$ur['sector_id']] = true;
        }

        $hasAchTable = $pdo->query("SHOW TABLES LIKE 'student_achievements'")->fetchColumn() !== false;
        if ($hasAchTable) {
            $achStmt = $pdo->prepare(
                'SELECT achievement_code, unlocked_at FROM student_achievements WHERE student_uuid = ?'
            );
            $achStmt->execute([$subjectId]);
            foreach ($achStmt->fetchAll() as $ar) {
                $unlockedAchievements[$ar['achievement_code']] = $ar['unlocked_at'];
            }
        }
    }

    // 4. 教師審計日誌
    $auditLogs = [];
    if ($role === 'admin') {
        $logStmt = $pdo->query(
            'SELECT DATE_FORMAT(a.created_at, "%H:%i:%s") AS time_str,
                    UNIX_TIMESTAMP(a.created_at) * 1000 AS ts_ms,
                    a.student_uuid, s.sector_name, l.title AS level_title,
                    a.evaluation_mode, a.submitted_code, a.passed_l1, a.passed_l2, a.passed_l3,
                    a.exec_status, a.hint_depth_used
             FROM submission_audit_logs a
             JOIN levels l ON l.level_id = a.level_id
             JOIN sectors s ON s.sector_id = l.sector_id
             ORDER BY a.log_id DESC
             LIMIT 100'
        );
        foreach (array_reverse($logStmt->fetchAll()) as $lr) {
            $auditLogs[] = [
                'timestamp' => (int)$lr['ts_ms'],
                'time' => $lr['time_str'],
                'uuid' => $lr['student_uuid'],
                'sector' => $lr['sector_name'],
                'levelTitle' => $lr['level_title'],
                'mode' => $lr['evaluation_mode'],
                'submittedCode' => $lr['submitted_code'],
                'l1' => $lr['passed_l1'] === null ? null : (int)$lr['passed_l1'],
                'l2' => $lr['passed_l2'] === null ? null : (int)$lr['passed_l2'],
                'l3' => $lr['passed_l3'] === null ? null : (int)$lr['passed_l3'],
                'status' => $lr['exec_status'],
                'hintDepth' => (int)$lr['hint_depth_used'],
                'hiddenDetail' => '-',
            ];
        }
    }

    sendJson([
        'ok' => true,
        'session' => [
            'role' => $role,
            'studentUuid' => $subjectId,
            'csrfToken' => $sess ? computeCsrfToken($sess) : '',
        ],
        'dbLevels' => $dbLevels,
        'scripts' => $scriptsMap,
        'progress' => $progress,
        'drafts' => $drafts,
        'affection' => $affection,
        'saveSlots' => $saveSlots,
        'unreadDialogueSectors' => $unreadDialogueSectors,
        'unlockedAchievements' => $unlockedAchievements,
        'customLevels' => $customLevels,
        'auditLogs' => $auditLogs,
    ]);
} catch (Throwable $e) {
    sendJson(['ok' => false, 'error' => 'DB_BOOTSTRAP_ERROR'], 500);
}
