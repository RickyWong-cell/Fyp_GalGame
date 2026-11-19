<?php
// 《源泉鎮 Source Town》V3.0 Phase 1 - Provider Factory
declare(strict_types=1);

namespace SourceTown\AI\Provider;

use SourceTown\AI\AiConfig;
use SourceTown\AI\AiException;
use SourceTown\AI\Support\HttpClient;

final class ProviderFactory
{
    public static function make(AiConfig $config, HttpClient $http): ProviderInterface
    {
        return match ($config->provider()) {
            'openai', 'openai_compatible' => new OpenAiCompatibleProvider($config, $http),
            'mock' => new MockProvider($config),
            default => throw new AiException(
                'AI_CONFIG_INVALID',
                'AI Provider 設定無效，請聯絡管理員',
                503
            ),
        };
    }
}
