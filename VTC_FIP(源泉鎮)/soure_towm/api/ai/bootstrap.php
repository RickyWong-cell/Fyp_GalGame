<?php
// 《源泉鎮 Source Town》V3.0 Phase 1 - AI 模組 Bootstrap / Autoloader
declare(strict_types=1);

if (!defined('SOURCE_TOWN_AI_BOOTSTRAPPED')) {
    define('SOURCE_TOWN_AI_BOOTSTRAPPED', true);

    spl_autoload_register(static function (string $class): void {
        $prefix = 'SourceTown\\AI\\';
        if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
            return;
        }

        $relative = substr($class, strlen($prefix));
        $file = __DIR__ . '/src/' . str_replace('\\', '/', $relative) . '.php';
        if (is_file($file)) {
            require_once $file;
        }
    });
}

if (!function_exists('sourceTownAiRuntime')) {
    /**
     * 建立 AI Runtime。DB 連線可為 null（僅 health 檢查時使用）。
     */
    function sourceTownAiRuntime(?\PDO $pdo = null): \SourceTown\AI\AiRuntime
    {
        return \SourceTown\AI\AiRuntime::create($pdo);
    }
}
