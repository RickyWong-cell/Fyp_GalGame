<?php
// 《源泉鎮 Source Town》V2.6 匿名學生 Session 管理 API
declare(strict_types=1);

require_once __DIR__ . '/db.php';

try {
    $pdo = getDbConnection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'DELETE') {
        assertSameOriginRequest();
        $sess = getActiveSession($pdo);
        if ($sess) {
            $provided = (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
            if (!verifyCsrfToken($sess, $provided)) {
                sendJson(['ok' => false, 'error' => 'CSRF_INVALID', 'msg' => 'CSRF 驗證失敗'], 403);
            }
            $stmt = $pdo->prepare('UPDATE user_sessions SET revoked_at = NOW() WHERE session_id = ?');
            $stmt->execute([$sess['session_id']]);
        }
        clearSessionCookie();
        sendJson(['ok' => true, 'role' => 'guest', 'student_uuid' => null]);
    }

    if ($method !== 'POST') {
        sendJson(['ok' => false, 'error' => 'METHOD_NOT_ALLOWED'], 405);
    }

    assertSameOriginRequest();
    $body = readJsonInput();
    if (($body['action'] ?? '') === 'logout') {
        $sess = getActiveSession($pdo);
        if ($sess) {
            $provided = (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
            if (!verifyCsrfToken($sess, $provided)) {
                sendJson(['ok' => false, 'error' => 'CSRF_INVALID', 'msg' => 'CSRF 驗證失敗'], 403);
            }
            $stmt = $pdo->prepare('UPDATE user_sessions SET revoked_at = NOW() WHERE session_id = ?');
            $stmt->execute([$sess['session_id']]);
        }
        clearSessionCookie();
        sendJson(['ok' => true, 'role' => 'guest', 'student_uuid' => null]);
    }

    $existing = getActiveSession($pdo);
    if ($existing) {
        sendJson([
            'ok' => true,
            'role' => $existing['role'],
            'student_uuid' => $existing['subject_id'],
            'csrf_token' => computeCsrfToken($existing),
        ]);
    }

    $studentUuid = 'ST-' . strtoupper(bin2hex(random_bytes(3)));
    $sessionId = bin2hex(random_bytes(32));
    $csrfSecret = bin2hex(random_bytes(32));

    $stmt = $pdo->prepare(
        'INSERT INTO user_sessions (session_id, subject_id, role, csrf_secret, expires_at)
         VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))'
    );
    $stmt->execute([$sessionId, $studentUuid, 'student', $csrfSecret]);

    setSessionCookie($sessionId, 604800);
    sendJson([
        'ok' => true,
        'role' => 'student',
        'student_uuid' => $studentUuid,
        'csrf_token' => computeCsrfToken([
            'session_id' => $sessionId,
            'subject_id' => $studentUuid,
            'csrf_secret' => $csrfSecret,
        ]),
    ]);
} catch (Throwable $e) {
    sendJson(['ok' => false, 'error' => 'DB_SESSION_ERROR'], 500);
}
