<?php
// 《源泉鎮 Source Town》V2.6 教師後台：單一學生除錯歷程時間軸與提交程式碼檢視 API
declare(strict_types=1);

require_once __DIR__ . '/db.php';

try {
    $pdo = getDbConnection();
    $sess = getActiveSession($pdo);
    if (!$sess || $sess['role'] !== 'admin') {
        sendJson(['ok' => false, 'error' => 'UNAUTHORIZED'], 403);
    }

    $studentUuid = trim((string)($_GET['student_uuid'] ?? ''));
    if ($studentUuid === '') {
        sendJson(['ok' => false, 'error' => 'MISSING_STUDENT_UUID'], 400);
    }

    $stmt = $pdo->prepare(
        'SELECT a.log_id, l.level_code, l.title AS level_title, s.sector_name,
                a.evaluation_mode, a.submitted_code,
                a.passed_l1, a.passed_l2, a.passed_l3,
                a.exec_status, a.latency_ms, a.hint_depth_used, a.created_at
         FROM submission_audit_logs a
         JOIN levels l ON l.level_id = a.level_id
         JOIN sectors s ON s.sector_id = l.sector_id
         WHERE a.student_uuid = ?
         ORDER BY a.created_at ASC, a.log_id ASC
         LIMIT 100'
    );
    $stmt->execute([$studentUuid]);
    $timeline = $stmt->fetchAll();

    $affStmt = $pdo->prepare(
        'SELECT sa.sector_id, s.sector_name, s.heroine_name, sa.current_score, sa.current_tier
         FROM student_affection sa
         JOIN sectors s ON s.sector_id = sa.sector_id
         WHERE sa.student_uuid = ?'
    );
    $affStmt->execute([$studentUuid]);
    $affections = $affStmt->fetchAll();

    sendJson([
        'ok' => true,
        'student_uuid' => $studentUuid,
        'timeline' => $timeline,
        'affections' => $affections,
    ]);
} catch (Throwable $e) {
    sendJson(['ok' => false, 'error' => 'TIMELINE_QUERY_ERROR'], 500);
}
