<?php
// 《源泉鎮 Source Town》V2.6 + V3.0 PDO MySQL 資料庫連線與共用輔助函式
declare(strict_types=1);

define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'source_town');
define('DB_USER', 'root');
define('DB_PASS', '');

function getDbConnection(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_PORT, DB_NAME);
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}

function sendJson(array $payload, int $statusCode = 200): void {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('X-Content-Type-Options: nosniff');
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function readJsonInput(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function getActiveSession(PDO $pdo): ?array {
    $sid = $_COOKIE['st_session'] ?? '';
    if ($sid === '' || !preg_match('/^[a-f0-9]{32,128}$/', $sid)) {
        return null;
    }
    $stmt = $pdo->prepare(
        'SELECT session_id, subject_id, role, csrf_secret, expires_at
         FROM user_sessions
         WHERE session_id = ? AND revoked_at IS NULL AND expires_at > NOW()
         LIMIT 1'
    );
    $stmt->execute([$sid]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function computeCsrfToken(array $session): string {
    $sid = (string)($session['session_id'] ?? '');
    $subject = (string)($session['subject_id'] ?? '');
    $secret = (string)($session['csrf_secret'] ?? '');
    if ($sid === '' || $secret === '') {
        return '';
    }
    return hash_hmac('sha256', $sid . '|' . $subject, $secret);
}

function verifyCsrfToken(array $session, string $providedToken): bool {
    $providedToken = trim($providedToken);
    if ($providedToken === '') {
        return false;
    }
    $expected = computeCsrfToken($session);
    if ($expected === '') {
        return false;
    }
    return hash_equals($expected, $providedToken);
}

function setSessionCookie(string $sessionId, int $ttlSeconds = 604800): void {
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    setcookie('st_session', $sessionId, [
        'expires' => time() + $ttlSeconds,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function clearSessionCookie(): void {
    setcookie('st_session', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function assertSameOriginRequest(): void {
    $fetchSite = strtolower(trim((string)($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '')));
    if ($fetchSite !== '' && !in_array($fetchSite, ['same-origin', 'none'], true)) {
        sendJson(['ok' => false, 'error' => 'ORIGIN_FORBIDDEN', 'msg' => '跨站請求已被拒絕 (Fetch Metadata)'], 403);
    }
    $origin = trim((string)($_SERVER['HTTP_ORIGIN'] ?? ''));
    $referer = trim((string)($_SERVER['HTTP_REFERER'] ?? ''));
    $sourceUrl = $origin !== '' ? $origin : $referer;
    if ($sourceUrl === '') {
        sendJson(['ok' => false, 'error' => 'ORIGIN_FORBIDDEN', 'msg' => '缺少來源驗證標頭 (Origin/Referer)'], 403);
    }
    $originParts = parse_url($sourceUrl);
    $hostHeader = (string)($_SERVER['HTTP_HOST'] ?? '');
    $requestScheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $hostParts = parse_url($requestScheme . '://' . $hostHeader);
    $originHost = strtolower((string)($originParts['host'] ?? ''));
    $requestHost = strtolower((string)($hostParts['host'] ?? ''));
    $originPort = (int)($originParts['port'] ?? (($originParts['scheme'] ?? '') === 'https' ? 443 : 80));
    $requestPort = (int)($hostParts['port'] ?? ($requestScheme === 'https' ? 443 : 80));
    if ($originHost === '' || $requestHost === '' || $originHost !== $requestHost || $originPort !== $requestPort) {
        sendJson(['ok' => false, 'error' => 'ORIGIN_FORBIDDEN', 'msg' => '跨站請求已被拒絕'], 403);
    }
}

function requireAuthenticatedCsrf(PDO $pdo, ?string $requiredRole = null): array {
    assertSameOriginRequest();
    $sess = getActiveSession($pdo);
    if (!$sess) {
        sendJson(['ok' => false, 'error' => 'SESSION_REQUIRED', 'msg' => '請先建立有效遊戲 Session'], 401);
    }
    if ($requiredRole !== null && ($sess['role'] ?? '') !== $requiredRole) {
        sendJson(['ok' => false, 'error' => 'UNAUTHORIZED', 'msg' => '權限不足'], 403);
    }
    $provided = (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    if (!verifyCsrfToken($sess, $provided)) {
        sendJson(['ok' => false, 'error' => 'CSRF_INVALID', 'msg' => 'CSRF 驗證失敗，請重新整理頁面'], 403);
    }
    return $sess;
}
