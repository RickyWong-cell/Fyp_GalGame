<?php
// 《源泉鎮 Source Town》V3.0 Phase 1 - AI 模組統一例外型別
declare(strict_types=1);

namespace SourceTown\AI;

use RuntimeException;
use Throwable;

final class AiException extends RuntimeException
{
    private string $errorCode;
    private int $httpStatus;
    private ?string $detail;
    private ?int $retryAfter;
    private bool $retryable;

    public function __construct(
        string $errorCode,
        string $publicMessage,
        int $httpStatus = 500,
        ?string $detail = null,
        ?int $retryAfter = null,
        bool $retryable = false,
        ?Throwable $previous = null
    ) {
        parent::__construct($publicMessage, 0, $previous);
        $this->errorCode = $errorCode;
        $this->httpStatus = max(400, min(599, $httpStatus));
        $this->detail = $detail;
        $this->retryAfter = $retryAfter;
        $this->retryable = $retryable;
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public function getHttpStatus(): int
    {
        return $this->httpStatus;
    }

    /**
     * 僅供管理員除錯模式輸出，不可直接回傳給一般玩家。
     */
    public function getDetail(): ?string
    {
        return $this->detail;
    }

    public function getRetryAfter(): ?int
    {
        return $this->retryAfter;
    }

    public function isRetryable(): bool
    {
        return $this->retryable;
    }
}
