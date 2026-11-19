<?php
// 《源泉鎮 Source Town》V3.0 Phase 1 - Agent 介面
declare(strict_types=1);

namespace SourceTown\AI\Agent;

interface AgentInterface
{
    public function id(): string;

    public function isEnabled(): bool;

    /**
     * 僅回傳可公開的 Agent 中繼資料，不含 system prompt。
     *
     * @return array{id:string,name:string,description:string,enabled:bool,phase:int,max_output_tokens:int}
     */
    public function describe(): array;

    /**
     * @param list<array{role:string,content:string}> $messages
     * @param array<string,mixed> $options
     * @return array<string,mixed>
     */
    public function respond(array $messages, array $options = []): array;
}
