<?php
// 《源泉鎮 Source Town》V2.6 教師管理員後端驗證 API (使用 password_verify 與 HttpOnly Session)
declare(strict_types=1);

require_once __DIR__ . '/db.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    sendJson(['ok' => false, 'error' => 'METHOD_NOT_ALLOWED'], 405);
}

session_start();
$now = time();
$failCount = (int)($_SESSION['admin_fail_count'] ?? 0);
$lockedUntil = (int)($_SESSION['admin_locked_until'] ?? 0);

if ($now < $lockedUntil) {
    sendJson([
        'ok' => false,
        'error' => 'RATE_LIMITED',
        'retry_after' => $lockedUntil - $now,
        'msg' => '嘗試次數過多，請稍後再試',
    ], 429);
}

try {
    $pdo = getDbConnection();
    $body = readJsonInput();
    $username = trim((string)($body['username'] ?? ''));
    $password = (string)($body['password'] ?? '');

    if ($username === '' || $password === '') {
        sendJson(['ok' => false, 'error' => 'MISSING_CREDENTIALS', 'msg' => '請輸入帳號與密碼'], 400);
    }

    $totalTeachers = (int)$pdo->query('SELECT COUNT(*) FROM teachers')->fetchColumn();
    if ($totalTeachers === 0) {
        sendJson([
            'ok' => false,
            'error' => 'NO_TEACHER_ACCOUNT',
            'msg' => '資料庫 teachers 資料表尚無教師帳號，請先於 phpMyAdmin 新增教師帳號',
        ], 403);
    }

    $stmt = $pdo->prepare('SELECT teacher_id, username, password_hash, display_name FROM teachers WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $teacher = $stmt->fetch();

    if (!$teacher || !password_verify($password, $teacher['password_hash'])) {
        $failCount++;
        $_SESSION['admin_fail_count'] = $failCount;
        if ($failCount >= 5) {
            $_SESSION['admin_locked_until'] = $now + 60;
        }
        sendJson(['ok' => false, 'error' => 'INVALID_CREDENTIALS', 'msg' => '帳號或密碼錯誤'], 401);
    }

    $_SESSION['admin_fail_count'] = 0;
    $_SESSION['admin_locked_until'] = 0;

    $subjectId = 'ADMIN-' . $teacher['teacher_id'];
    $sessionId = bin2hex(random_bytes(32));
    $csrfSecret = bin2hex(random_bytes(32));

    $ins = $pdo->prepare(
        'INSERT INTO user_sessions (session_id, subject_id, role, csrf_secret, expires_at)
         VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY))'
    );
    $ins->execute([$sessionId, $subjectId, 'admin', $csrfSecret]);

    setSessionCookie($sessionId, 86400);
    sendJson([
        'ok' => true,
        'role' => 'admin',
        'student_uuid' => $subjectId,
        'display_name' => $teacher['display_name'],
        'csrf_token' => computeCsrfToken([
            'session_id' => $sessionId,
            'subject_id' => $subjectId,
            'csrf_secret' => $csrfSecret,
        ]),
    ]);
} catch (Throwable $e) {
    sendJson(['ok' => false, 'error' => 'AUTH_SERVER_ERROR'], 500);
}
