<?php
// 《源泉鎮 Source Town》V3.0 Phase 1 - 近似 Token 估算
// 注意：此估算僅用於預算控制，實際計費仍以 Provider 回傳 usage 為準。
declare(strict_types=1);

namespace SourceTown\AI\Support;

final class TokenEstimator
{
    public static function estimateText(string $text): int
    {
        if ($text === '') {
            return 0;
        }

        $cjk = preg_match_all(
            '/[\x{3400}-\x{4DBF}\x{4E00}-\x{9FFF}\x{F900}-\x{FAFF}\x{3040}-\x{30FF}\x{AC00}-\x{D7AF}]/u',
            $text
        );
        if ($cjk === false) {
            $cjk = 0;
        }

        $length = mb_strlen($text, 'UTF-8');
        $nonCjk = max(0, $length - $cjk);

        // 中日韓字元約 1 token/字，拉丁文字約 4 字元/token，加上少量格式 overhead。
        return max(1, (int)ceil(($cjk * 1.05) + ($nonCjk / 4)));
    }

    /**
     * @param list<array{role:string,content:string}> $messages
     */
    public static function estimateMessages(array $messages): int
    {
        $total = 0;
        foreach ($messages as $message) {
            $total += 4; // role / separator overhead
            $total += self::estimateText((string)($message['content'] ?? ''));
        }
        return $total + 3;
    }
}
