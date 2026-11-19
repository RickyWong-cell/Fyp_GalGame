<?php
// 《源泉鎮 Source Town》V3.0 Phase 1 - AI Runtime 組裝
declare(strict_types=1);

namespace SourceTown\AI;

use PDO;
use SourceTown\AI\Provider\ProviderFactory;
use SourceTown\AI\Support\HttpClient;
use SourceTown\AI\Support\RequestLogger;

final class AiRuntime
{
    public AiConfig $config;
    public AIService $ai;
    public AgentManager $agents;
    public AgentRouter $router;
    public ?TokenManager $tokens = null;
    public ?RequestLogger $logger = null;
    public ?PDO $pdo = null;

    private function __construct(AiConfig $config, ?PDO $pdo)
    {
        $this->config = $config;
        $this->pdo = $pdo;

        $http = new HttpClient(
            $config->getInt('timeout_seconds', 20),
            $config->getInt('connect_timeout_seconds', 5),
            $config->getInt('max_response_bytes', 1048576),
            $config->getInt('max_retries', 2),
            $config->getInt('retry_backoff_ms', 400),
            $config->getBool('verify_tls', true)
        );

        $this->ai = new AIService($config, ProviderFactory::make($config, $http));
        $this->agents = new AgentManager($this->ai, $config);
        $this->router = new AgentRouter($config);

        if ($pdo instanceof PDO) {
            $this->tokens = new TokenManager($pdo, $config);
            $this->logger = new RequestLogger($pdo, $config);
        }
    }

    public static function create(?PDO $pdo = null): self
    {
        return new self(AiConfig::load(), $pdo);
    }

    public static function fromConfig(AiConfig $config, ?PDO $pdo = null): self
    {
        return new self($config, $pdo);
    }

    /**
     * @return array{connected:bool,usage_table_ready:bool,log_table_ready:bool}
     */
    public function storageStatus(): array
    {
        if (!$this->pdo instanceof PDO) {
            return [
                'connected' => false,
                'usage_table_ready' => false,
                'log_table_ready' => false,
            ];
        }

        return [
            'connected' => true,
            'usage_table_ready' => $this->tokens?->tableReady() ?? false,
            'log_table_ready' => $this->logger?->tableReady() ?? false,
        ];
    }

    public function assertStorageReady(): void
    {
        $status = $this->storageStatus();
        if (!$status['connected'] || !$status['usage_table_ready'] || !$status['log_table_ready']) {
            throw new AiException(
                'AI_STORAGE_NOT_READY',
                'AI 資料表尚未就緒，請先執行 Phase 1 SQL Migration',
                503
            );
        }
    }
}
