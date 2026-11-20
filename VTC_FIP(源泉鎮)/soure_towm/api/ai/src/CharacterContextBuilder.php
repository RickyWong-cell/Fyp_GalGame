<?php
// 《源泉鎮 Source Town》V3.0 Phase 2 - 角色對話唯讀 Context 建立器
// 安全原則：只從 MySQL 讀取可信任的 Session、區域設定與好感度，絕不採信前端傳入的好感度或權限。
declare(strict_types=1);

namespace SourceTown\AI;

use PDO;
use Throwable;

final class CharacterContextBuilder
{
    public const VALID_SECTORS = ['admin', 'farm', 'market', 'industrial'];

    private const FALLBACK_SECTORS = [
        'admin' => [
            'sector_name' => '行政區',
            'heroine_name' => '林靜',
            'language' => 'Java',
            'evaluation_mode' => 'concept_simulation',
        ],
        'farm' => [
            'sector_name' => '生態農場',
            'heroine_name' => '蘇曉',
            'language' => 'Python',
            'evaluation_mode' => 'runtime',
        ],
        'market' => [
            'sector_name' => '海濱市集',
            'heroine_name' => '夏海',
            'language' => 'JavaScript',
            'evaluation_mode' => 'runtime',
        ],
        'industrial' => [
            'sector_name' => '水電工業',
            'heroine_name' => '鐵嵐',
            'language' => 'C++',
            'evaluation_mode' => 'concept_simulation',
        ],
    ];

    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * 依後端 Session 與 sector_id 從 MySQL 建立唯讀角色 Context。
     *
     * @param array<string,mixed> $session
     * @return array<string,mixed>
     */
    public function build(array $session, string $sectorId): array
    {
        $sectorId = trim($sectorId);
        if (!in_array($sectorId, self::VALID_SECTORS, true)) {
            throw new AiException('AI_SECTOR_INVALID', '無效的源泉鎮區域代碼', 400);
        }

        $subjectId = (string)($session['subject_id'] ?? '');
        $role = (string)($session['role'] ?? 'student');
        if ($subjectId === '') {
            throw new AiException('AI_SESSION_REQUIRED', '請先建立有效遊戲 Session', 401);
        }

        $sectorMeta = self::FALLBACK_SECTORS[$sectorId];
        try {
            $secStmt = $this->pdo->prepare(
                'SELECT sector_name, heroine_name, language, evaluation_mode
                 FROM sectors WHERE sector_id = ? LIMIT 1'
            );
            $secStmt->execute([$sectorId]);
            $secRow = $secStmt->fetch();
            if (is_array($secRow)) {
                $sectorMeta = [
                    'sector_name' => (string)$secRow['sector_name'],
                    'heroine_name' => (string)$secRow['heroine_name'],
                    'language' => (string)$secRow['language'],
                    'evaluation_mode' => (string)$secRow['evaluation_mode'],
                ];
            }
        } catch (Throwable) {
            // 保留預設區域資料，避免非關鍵查詢中斷對話
        }

        $affectionScore = 0;
        $affectionTier = 1;
        try {
            $affStmt = $this->pdo->prepare(
                'SELECT current_score, current_tier
                 FROM student_affection
                 WHERE student_uuid = ? AND sector_id = ? LIMIT 1'
            );
            $affStmt->execute([$subjectId, $sectorId]);
            $affRow = $affStmt->fetch();
            if (is_array($affRow)) {
                $affectionScore = max(0, min(100, (int)$affRow['current_score']));
                $affectionTier = max(1, min(3, (int)$affRow['current_tier']));
            }
        } catch (Throwable) {
            $affectionScore = 0;
            $affectionTier = 1;
        }

        $completedInSector = 0;
        try {
            $progStmt = $this->pdo->prepare(
                'SELECT COUNT(*)
                 FROM student_progress p
                 JOIN levels l ON l.level_id = p.level_id
                 WHERE p.student_uuid = ? AND l.sector_id = ? AND p.is_completed = 1'
            );
            $progStmt->execute([$subjectId, $sectorId]);
            $completedInSector = max(0, (int)$progStmt->fetchColumn());
        } catch (Throwable) {
            $completedInSector = 0;
        }

        return [
            'subject_id' => $subjectId,
            'role' => $role,
            'sector_id' => $sectorId,
            'sector_name' => $sectorMeta['sector_name'],
            'heroine_name' => $sectorMeta['heroine_name'],
            'language' => $sectorMeta['language'],
            'evaluation_mode' => $sectorMeta['evaluation_mode'],
            'affection_score' => $affectionScore,
            'affection_tier' => $affectionTier,
            'completed_levels_in_sector' => $completedInSector,
            'world_context' => '源泉鎮是一個依靠 1978 年圖靈博士留下的大型主機 Source-0 維持水電、農場、市集與市政運作的小鎮。玩家是返鄉休養並受託擔任「臨時系統管理員」的前軟體工程師。',
        ];
    }
}
