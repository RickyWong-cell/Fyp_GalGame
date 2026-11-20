<?php
// 《源泉鎮 Source Town》V3.0 Phase 1 - AI API Endpoint
// 安全邊界：AI 只能產生文字；所有遊戲狀態仍由既有後端 API 驗證與寫入。
declare(strict_types=1);

use SourceTown\AI\AiException;
use SourceTown\AI\CharacterContextBuilder;
use SourceTown\AI\Support\TokenEstimator;

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/ai/bootstrap.php';

const AI_MAX_REQUEST_BYTES = 65536;

function aiRequestId(): string
{
    return bin2hex(random_bytes(16));
}

function aiAssertSameOrigin(): void
{
    $fetchSite = strtolower(trim((string)($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '')));
    if ($fetchSite !== '' && !in_array($fetchSite, ['same-origin', 'none'], true)) {
        throw new AiException('AI_ORIGIN_FORBIDDEN', '跨站 AI 請求已被拒絕 (Fetch Metadata)', 403);
    }

    $origin = trim((string)($_SERVER['HTTP_ORIGIN'] ?? ''));
    $referer = trim((string)($_SERVER['HTTP_REFERER'] ?? ''));
    $sourceUrl = $origin !== '' ? $origin : $referer;

    // 不可因缺少 Origin/Referer 就自動視為安全
    if ($sourceUrl === '') {
        throw new AiException('AI_ORIGIN_FORBIDDEN', '缺少來源驗證標頭 (Origin/Referer)', 403);
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
        throw new AiException('AI_ORIGIN_FORBIDDEN', '跨站 AI 請求已被拒絕', 403);
    }
}

function aiAssertCsrf(array $session): void
{
    $provided = (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    if (!verifyCsrfToken($session, $provided)) {
        throw new AiException('AI_CSRF_INVALID', 'CSRF 驗證失敗，請重新整理頁面後再試', 403);
    }
}

/**
 * @return list<array{role:string,content:string}>
 */
function aiParseHistory(mixed $history, int $maxMessages, int $maxCharsPerMessage): array
{
    if ($history === null) {
        return [];
    }
    if (!is_array($history)) {
        throw new AiException('AI_INPUT_INVALID', 'history 必須是陣列', 400);
    }
    if (count($history) > $maxMessages) {
        throw new AiException('AI_INPUT_TOO_LARGE', '歷史訊息回合數超過限制', 413);
    }

    $messages = [];
    foreach ($history as $item) {
        if (!is_array($item)) {
            throw new AiException('AI_INPUT_INVALID', '歷史訊息格式無效', 400);
        }
        $role = (string)($item['role'] ?? '');
        if (!in_array($role, ['user', 'assistant'], true)) {
            throw new AiException('AI_INPUT_INVALID', '歷史訊息只允許 user 或 assistant', 400);
        }
        $content = $item['content'] ?? '';
        if (!is_string($content)) {
            throw new AiException('AI_INPUT_INVALID', '歷史訊息內容格式無效', 400);
        }
        $content = trim($content);
        if ($content === '') {
            continue;
        }
        if (mb_strlen($content, 'UTF-8') > $maxCharsPerMessage) {
            throw new AiException('AI_INPUT_TOO_LARGE', '歷史訊息長度超過限制', 413);
        }
        $messages[] = ['role' => $role, 'content' => $content];
    }

    return $messages;
}

$httpMethod = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
if (!in_array($httpMethod, ['GET', 'POST'], true)) {
    sendJson(['ok' => false, 'error' => 'METHOD_NOT_ALLOWED'], 405);
}

$contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > AI_MAX_REQUEST_BYTES) {
    sendJson(['ok' => false, 'error' => 'AI_REQUEST_TOO_LARGE', 'msg' => '請求內容過大'], 413);
}

$body = $httpMethod === 'POST' ? readJsonInput() : [];
$rawAction = $body['action'] ?? ($_GET['action'] ?? '');
$action = is_string($rawAction) ? strtolower(trim($rawAction)) : '';
if ($action === '') {
    $action = $httpMethod === 'GET' ? 'health' : '';
}

$pdo = null;
$pdoError = null;
try {
    $pdo = getDbConnection();
} catch (Throwable $e) {
    $pdoError = 'DB_UNAVAILABLE';
}

$runtime = null;
$requestId = aiRequestId();
header('X-Request-Id: ' . $requestId);

$session = null;
if ($pdo instanceof PDO) {
    try {
        $session = getActiveSession($pdo);
    } catch (Throwable) {
        $session = null;
    }
}
$role = $session ? (string)($session['role'] ?? 'guest') : 'guest';
$subjectId = $session ? (string)($session['subject_id'] ?? '') : '';

try {
    $runtime = sourceTownAiRuntime($pdo);
} catch (AiException $e) {
    sendJson([
        'ok' => false,
        'error' => $e->getErrorCode(),
        'msg' => $e->getMessage(),
        'request_id' => $requestId,
    ], $e->getHttpStatus());
} catch (Throwable $e) {
    sendJson([
        'ok' => false,
        'error' => 'AI_RUNTIME_ERROR',
        'msg' => 'AI 模組初始化失敗',
        'request_id' => $requestId,
    ], 500);
}

/* ---------------------------------------------------------------------
 * Health
 * ------------------------------------------------------------------- */
if ($action === 'health') {
    if ($httpMethod !== 'GET' && $httpMethod !== 'POST') {
        sendJson(['ok' => false, 'error' => 'METHOD_NOT_ALLOWED'], 405);
    }

    $storage = $runtime->storageStatus();
    $detailed = $role === 'admin';
    $aiSummary = $detailed
        ? $runtime->config->publicSummary(true)
        : [
            'phase' => 1,
            'enabled' => $runtime->config->isEnabled(),
            'configured' => $runtime->config->isConfigured(),
        ];

    $payload = [
        'ok' => true,
        'project' => 'Source Town V3.0',
        'phase' => 1,
        'ai' => $aiSummary,
        'storage' => $storage,
        'authenticated' => $session !== null,
        'role' => $role,
        'request_id' => $requestId,
        'server_time' => date('c'),
    ];

    if ($pdoError !== null) {
        $payload['db_error'] = $pdoError;
    }

    if ($session !== null && $runtime->tokens !== null) {
        $payload['usage_today'] = $runtime->tokens->usage($subjectId);
        $payload['intents'] = $runtime->router->intentsForRole($role);
    }

    sendJson($payload);
}

/* ---------------------------------------------------------------------
 * Chat（Phase 1 僅開放 System Agent 文字對話）
 * ------------------------------------------------------------------- */
if ($action !== 'chat') {
    sendJson([
        'ok' => false,
        'error' => 'AI_ACTION_UNKNOWN',
        'msg' => '不支援的 AI 操作',
        'request_id' => $requestId,
    ], 400);
}

if ($httpMethod !== 'POST') {
    sendJson(['ok' => false, 'error' => 'METHOD_NOT_ALLOWED'], 405);
}

if (!$pdo instanceof PDO) {
    sendJson([
        'ok' => false,
        'error' => 'DB_UNAVAILABLE',
        'msg' => '資料庫未連線，AI 功能暫不可用',
        'request_id' => $requestId,
    ], 503);
}

if (!$session) {
    sendJson([
        'ok' => false,
        'error' => 'AI_SESSION_REQUIRED',
        'msg' => '請先建立遊戲 Session 後再使用 AI 對話',
        'request_id' => $requestId,
    ], 401);
}

$reservation = null;
$route = null;
$promptForHash = '';
$userMessage = '';

try {
    aiAssertSameOrigin();
    aiAssertCsrf($session);
    $runtime->config->assertReady();
    $runtime->assertStorageReady();

    $intentRaw = $body['intent'] ?? 'chat';
    $intent = is_string($intentRaw) ? trim($intentRaw) : '';
    $sectorRaw = $body['sector_id'] ?? '';
    $sectorId = is_string($sectorRaw) ? trim($sectorRaw) : '';
    $route = $runtime->router->route($intent, $role, ['sector_id' => $sectorId]);

    $characterContext = null;
    if ($route['intent'] === 'character_chat') {
        $ctxBuilder = new CharacterContextBuilder($pdo);
        $characterContext = $ctxBuilder->build($session, (string)$route['sector_id']);
    }

    if (!isset($body['message']) || !is_string($body['message'])) {
        throw new AiException('AI_INPUT_INVALID', 'message 必須是字串', 400);
    }
    $userMessage = trim($body['message']);
    if ($userMessage === '') {
        throw new AiException('AI_INPUT_INVALID', '訊息不可為空', 400);
    }

    $maxMessageChars = $runtime->config->getInt('max_message_chars');
    if (mb_strlen($userMessage, 'UTF-8') > $maxMessageChars) {
        throw new AiException(
            'AI_INPUT_TOO_LARGE',
            '訊息長度超過限制（最多 ' . $maxMessageChars . ' 字）',
            413
        );
    }

    $history = aiParseHistory(
        $body['history'] ?? null,
        $runtime->config->getInt('max_history_messages'),
        $maxMessageChars
    );

    $messages = $history;
    $messages[] = ['role' => 'user', 'content' => $userMessage];

    $agentConfig = $runtime->config->agentConfig($route['agent_id']);
    $systemPrompt = (string)($agentConfig['system_prompt'] ?? '');
    $estimateMessages = [['role' => 'system', 'content' => $systemPrompt]];
    foreach ($messages as $message) {
        $estimateMessages[] = $message;
    }
    $estimatedInput = TokenEstimator::estimateMessages($estimateMessages);

    $agentMaxOutput = max(1, (int)($agentConfig['max_output_tokens'] ?? 400));
    $maxOutput = min($runtime->config->getInt('max_output_tokens'), $agentMaxOutput);

    $reservation = $runtime->tokens->reserve($subjectId, $estimatedInput, $maxOutput);

    $promptForHash = $systemPrompt . "\n" . json_encode($messages, JSON_UNESCAPED_UNICODE);
    $result = $runtime->agents->run($route['agent_id'], $messages, [
        'request_id' => $requestId,
        'max_output_tokens' => $maxOutput,
        'character_context' => $characterContext,
    ]);

    $usage = $result['usage'];
    $runtime->tokens->settle(
        $subjectId,
        $reservation['date'],
        $reservation['reserved_tokens'],
        (int)$usage['prompt_tokens'],
        (int)$usage['completion_tokens'],
        $reservation['reservation_id'] ?? null
    );
    $reservation = null;

    $runtime->logger?->log([
        'request_id' => $requestId,
        'subject_id' => $subjectId,
        'role' => $role,
        'intent' => $route['intent'],
        'agent_id' => $route['agent_id'],
        'provider' => $result['provider'],
        'model' => $result['model'],
        'status' => 'SUCCESS',
        'prompt_tokens' => (int)$usage['prompt_tokens'],
        'completion_tokens' => (int)$usage['completion_tokens'],
        'total_tokens' => (int)$usage['total_tokens'],
        'estimated_tokens' => (int)$result['estimated_input_tokens'],
        'latency_ms' => (int)$result['latency_ms'],
        'prompt' => $promptForHash,
        'reply' => (string)$result['reply'],
    ]);

    $quota = $runtime->tokens->usage($subjectId);

    $usageOut = $result['usage'];
    $usageOut['input_tokens'] = (int)($usage['prompt_tokens'] ?? 0);
    $usageOut['output_tokens'] = (int)($usage['completion_tokens'] ?? 0);

    sendJson([
        'ok' => true,
        'phase' => $route['intent'] === 'character_chat' ? 2 : 1,
        'agent_id' => $result['agent_id'],
        'sector_id' => $result['sector_id'] ?? $route['sector_id'],
        'reply' => $result['reply'],
        'emotion' => $result['emotion'] ?? null,
        'agent' => [
            'id' => $result['agent_id'],
            'name' => $result['agent_name'],
        ],
        'provider' => $result['provider'],
        'model' => $result['model'],
        'usage' => $usageOut,
        'quota' => $quota,
        'latency_ms' => (int)$result['latency_ms'],
        'request_id' => $requestId,
    ]);
} catch (AiException $e) {
    if ($reservation !== null && isset($runtime->tokens)) {
        $runtime->tokens->release($subjectId, $reservation['date'], $reservation['reserved_tokens'], $reservation['reservation_id'] ?? null);
    }

    $runtime?->logger?->log([
        'request_id' => $requestId,
        'subject_id' => $subjectId,
        'role' => $role,
        'intent' => $route['intent'] ?? 'chat',
        'agent_id' => $route['agent_id'] ?? '',
        'provider' => $runtime->ai->providerName(),
        'model' => $runtime->config->model(),
        'status' => 'ERROR',
        'error_code' => $e->getErrorCode(),
        'estimated_tokens' => 0,
        'prompt' => $promptForHash,
    ]);

    $payload = [
        'ok' => false,
        'error' => $e->getErrorCode(),
        'msg' => $e->getMessage(),
        'request_id' => $requestId,
    ];

    if ($e->getRetryAfter() !== null) {
        $payload['retry_after'] = $e->getRetryAfter();
        header('Retry-After: ' . $e->getRetryAfter());
    }

    if ($runtime->config->getBool('debug') && $role === 'admin' && $e->getDetail() !== null) {
        $payload['detail'] = $e->getDetail();
    }

    sendJson($payload, $e->getHttpStatus());
} catch (Throwable $e) {
    if ($reservation !== null && isset($runtime->tokens)) {
        $runtime->tokens->release($subjectId, $reservation['date'], $reservation['reserved_tokens'], $reservation['reservation_id'] ?? null);
    }

    $runtime?->logger?->log([
        'request_id' => $requestId,
        'subject_id' => $subjectId,
        'role' => $role,
        'intent' => $route['intent'] ?? 'chat',
        'agent_id' => $route['agent_id'] ?? '',
        'provider' => $runtime->ai->providerName(),
        'model' => $runtime->config->model(),
        'status' => 'ERROR',
        'error_code' => 'AI_INTERNAL_ERROR',
        'prompt' => $promptForHash,
    ]);

    $payload = [
        'ok' => false,
        'error' => 'AI_INTERNAL_ERROR',
        'msg' => 'AI 服務發生內部錯誤',
        'request_id' => $requestId,
    ];
    if ($runtime->config->getBool('debug') && $role === 'admin') {
        $payload['detail'] = $e->getMessage();
    }

    sendJson($payload, 500);
}
