<?php
// 《源泉鎮 Source Town》V3.0 Phase 1 - AI Provider 介面
declare(strict_types=1);

namespace SourceTown\AI\Provider;

interface ProviderInterface
{
    public function name(): string;

    /**
     * @param list<array{role:string,content:string}> $messages
     * @param array<string,mixed> $options
     * @return array{
     *   content:string,
     *   finish_reason:?string,
     *   model:string,
     *   usage:array{prompt_tokens:int,completion_tokens:int,total_tokens:int,estimated:bool},
     *   provider_request_id:?string,
     *   latency_ms:int
     * }
     */
    public function chat(array $messages, array $options = []): array;
}
