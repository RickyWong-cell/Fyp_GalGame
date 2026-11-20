<?php
// 《源泉鎮 Source Town》V3.0 Phase 2 - 角色 AI Agent 與安全機制自動化測試
// 執行：D:\xampp\php\php.exe tests\run_phase2_tests.php
declare(strict_types=1);

require_once __DIR__ . '/../api/db.php';
require_once __DIR__ . '/../api/ai/bootstrap.php';

use SourceTown\AI\Agent\CharacterAgent;
use SourceTown\AI\AgentManager;
use SourceTown\AI\AgentRouter;
use SourceTown\AI\AiConfig;
use SourceTown\AI\AiException;
use SourceTown\AI\AIService;
use SourceTown\AI\CharacterContextBuilder;
use SourceTown\AI\Provider\MockProvider;
use SourceTown\AI\TokenManager;

final class Phase2SkippedTest extends RuntimeException {}

final class Phase2Suite
{
    private int $passed = 0;
    private int $failed = 0;
    private int $skipped = 0;
    /** @var list<string> */
    private array $failures = [];

    public function test(string $name, callable $fn): void
    {
        try {
            $fn();
            $this->passed++;
            echo "  [PASS] {$name}\n";
        } catch (Phase2SkippedTest $e) {
            $this->skipped++;
            echo "  [SKIP] {$name} - {$e->getMessage()}\n";
        } catch (Throwable $e) {
            $this->failed++;
            $this->failures[] = "{$name}: {$e->getMessage()}";
            echo "  [FAIL] {$name} - {$e->getMessage()}\n";
        }
    }

    public function assertTrue(bool $cond, string $msg = 'expected true'): void
    {
        if (!$cond) throw new RuntimeException($msg);
    }

    public function assertSame(mixed $exp, mixed $act, string $msg = ''): void
    {
        if ($exp !== $act) {
            throw new RuntimeException(($msg ? $msg . ' ' : '') . 'expected=' . var_export($exp, true) . ' actual=' . var_export($act, true));
        }
    }

    public function assertContains(string $needle, string $haystack, string $msg = ''): void
    {
        if (!str_contains($haystack, $needle)) {
            throw new RuntimeException(($msg ? $msg . ' ' : '') . "missing '{$needle}'");
        }
    }

    public function assertNotContains(string $needle, string $haystack, string $msg = ''): void
    {
        if (str_contains($haystack, $needle)) {
            throw new RuntimeException(($msg ? $msg . ' ' : '') . "unexpected '{$needle}'");
        }
    }

    public function expectAiError(string $code, callable $fn): void
    {
        try {
            $fn();
        } catch (AiException $e) {
            $this->assertSame($code, $e->getErrorCode());
            return;
        }
        throw new RuntimeException("expected AiException {$code}");
    }

    public function summary(): int
    {
        echo "\n----------------------------------------\n";
        echo "PASS: {$this->passed}  FAIL: {$this->failed}  SKIP: {$this->skipped}\n";
        if ($this->failed > 0) {
            foreach ($this->failures as $f) echo "  - {$f}\n";
            return 1;
        }
        return 0;
    }
}

$suite = new Phase2Suite();
echo "Source Town V3.0 Phase 2 - Character Agent & Security Tests\nPHP " . PHP_VERSION . "\n\n";

$baseConfig = AiConfig::fromArray([
    'enabled' => true,
    'provider' => 'mock',
    'model' => 'mock-1',
]);

echo "[Routing & Registration]\n";
$suite->test('AgentManager 自動註冊 system 與四位角色 Agent', function () use ($suite, $baseConfig): void {
    $ai = new AIService($baseConfig, new MockProvider($baseConfig));
    $mgr = new AgentManager($ai, $baseConfig);
    foreach (['system', 'character_admin', 'character_farm', 'character_market', 'character_industrial'] as $id) {
        $suite->assertTrue($mgr->has($id), "missing agent {$id}");
    }
});

$suite->test('AgentRouter 依 sector_id 白名單路由四位角色', function () use ($suite, $baseConfig): void {
    $router = new AgentRouter($baseConfig);
    $suite->assertSame('character_admin', $router->route('character_chat', 'student', ['sector_id' => 'admin'])['agent_id']);
    $suite->assertSame('character_farm', $router->route('character_chat', 'student', ['sector_id' => 'farm'])['agent_id']);
    $suite->assertSame('character_market', $router->route('character_chat', 'student', ['sector_id' => 'market'])['agent_id']);
    $suite->assertSame('character_industrial', $router->route('character_chat', 'student', ['sector_id' => 'industrial'])['agent_id']);
});

$suite->test('AgentRouter 拒絕未知 sector_id 與未授權角色', function () use ($suite, $baseConfig): void {
    $router = new AgentRouter($baseConfig);
    $suite->expectAiError('AI_SECTOR_INVALID', fn () => $router->route('character_chat', 'student', ['sector_id' => 'unknown']));
    $suite->expectAiError('AI_FORBIDDEN', fn () => $router->route('character_chat', 'guest', ['sector_id' => 'farm']));
});

echo "\n[Character Personas & Emotion JSON]\n";
$suite->test('四位角色設定不混淆且保留專業語言', function () use ($suite, $baseConfig): void {
    $suite->assertContains('Java', (string)$baseConfig->agentConfig('character_admin')['system_prompt']);
    $suite->assertContains('Python', (string)$baseConfig->agentConfig('character_farm')['system_prompt']);
    $suite->assertContains('JavaScript', (string)$baseConfig->agentConfig('character_market')['system_prompt']);
    $suite->assertContains('C++', (string)$baseConfig->agentConfig('character_industrial')['system_prompt']);
});

$suite->test('CharacterAgent 可透過 MockProvider 回傳合法 reply 與白名單 emotion', function () use ($suite, $baseConfig): void {
    $ai = new AIService($baseConfig, new MockProvider($baseConfig));
    $mgr = new AgentManager($ai, $baseConfig);
    $res = $mgr->run('character_farm', [['role' => 'user', 'content' => '你好蘇曉']], [
        'character_context' => ['sector_id' => 'farm', 'affection_tier' => 2, 'affection_score' => 45, 'completed_levels_in_sector' => 1, 'world_context' => '源泉鎮']
    ]);
    $suite->assertTrue(trim((string)$res['reply']) !== '');
    $suite->assertTrue(in_array($res['emotion'], CharacterAgent::ALLOWED_EMOTIONS, true));
});

$suite->test('parseReplyAndEmotion 過濾非法 emotion、HTML XSS 與過長回覆', function () use ($suite): void {
    $badJson = '{"reply":"<img src=x onerror=alert(1)>哈囉","emotion":"hacked_emo"}';
    $parsed = CharacterAgent::parseReplyAndEmotion($badJson, 'admin');
    $suite->assertSame('calm_support', $parsed['emotion']);
    $suite->assertNotContains('<img', $parsed['reply']);
    $suite->assertContains('哈囉', $parsed['reply']);

    $broken = '這是不完整的純文字回覆 {broken';
    $fallback = CharacterAgent::parseReplyAndEmotion($broken, 'industrial');
    $suite->assertSame('stoic_nod', $fallback['emotion']);
    $suite->assertTrue($fallback['reply'] !== '');

    $longText = str_repeat('源', 900);
    $longRes = CharacterAgent::parseReplyAndEmotion(json_encode(['reply' => $longText, 'emotion' => 'stoic_nod']), 'industrial');
    $suite->assertTrue(mb_strlen($longRes['reply'], 'UTF-8') <= 801);
});

echo "\n[Phase 1 Security Hardening]\n";
$suite->test('CSRF Token 計算與驗證正確，錯誤 Token 被拒絕', function () use ($suite): void {
    $sess = ['session_id' => str_repeat('a', 64), 'subject_id' => 'ST-TEST01', 'csrf_secret' => str_repeat('b', 64)];
    $tok = computeCsrfToken($sess);
    $suite->assertTrue(verifyCsrfToken($sess, $tok));
    $suite->assertSame(false, verifyCsrfToken($sess, 'wrong-token'));
    $suite->assertSame(false, verifyCsrfToken($sess, ''));
});

$suite->test('明確指定不存在的 SOURCE_TOWN_AI_CONFIG 時 fail-closed', function () use ($suite): void {
    $old = getenv('SOURCE_TOWN_AI_CONFIG');
    putenv('SOURCE_TOWN_AI_CONFIG=' . __DIR__ . '/nonexistent_ai_cfg.php');
    try {
        $cfg = AiConfig::load();
        $suite->assertSame(false, $cfg->isEnabled());
        $suite->assertSame(false, $cfg->isConfigured());
    } finally {
        if ($old === false) putenv('SOURCE_TOWN_AI_CONFIG'); else putenv('SOURCE_TOWN_AI_CONFIG=' . $old);
    }
});

echo "\n[Database Integration (MySQL)]\n";
$suite->test('MySQL CharacterContextBuilder 與 TokenManager 併發/冪等測試', function () use ($suite, $baseConfig): void {
    try {
        $pdo = getDbConnection();
    } catch (Throwable $e) {
        throw new Phase2SkippedTest('MySQL 無法連線：' . $e->getMessage());
    }
    $tm = new TokenManager($pdo, $baseConfig);
    if (!$tm->tableReady()) {
        throw new Phase2SkippedTest('ai_usage_daily 或 ai_reservations 尚未建立');
    }

    $ctxBuilder = new CharacterContextBuilder($pdo);
    $ctx = $ctxBuilder->build(['subject_id' => 'ST-TEST-DB', 'role' => 'student'], 'farm');
    $suite->assertSame('farm', $ctx['sector_id']);
    $suite->assertSame('蘇曉', $ctx['heroine_name']);

    $res = $tm->reserve('ST-TEST-DB', 100, 100);
    $suite->assertTrue($tm->settle('ST-TEST-DB', $res['date'], $res['reserved_tokens'], 80, 40, $res['reservation_id']));
    // 重複結算必須冪等回傳 false
    $suite->assertSame(false, $tm->settle('ST-TEST-DB', $res['date'], $res['reserved_tokens'], 80, 40, $res['reservation_id']));
    // 已結算後再 release 必須回傳 false（不可重複退款）
    $suite->assertSame(false, $tm->release('ST-TEST-DB', $res['date'], $res['reserved_tokens'], $res['reservation_id']));
});

exit($suite->summary());
