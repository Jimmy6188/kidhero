// 难度自适应算法

import { supabaseAdmin } from "./supabase-server"

interface StudyStats {
  totalQuestions: number
  correctCount: number
  correctRate: number
  currentStreak: number
  avgDifficulty: number
}

/**
 * 获取学习统计
 */
async function getStudyStats(
  kidId: string,
  subject: string,
  recentCount: number = 20
): Promise<StudyStats> {
  const { data: records } = await supabaseAdmin
    .from("study_records")
    .select("is_correct, question_id, question_cache(difficulty)")
    .eq("kid_id", kidId)
    .eq("subject", subject)
    .order("answered_at", { ascending: false })
    .limit(recentCount)

  if (!records || records.length === 0) {
    return {
      totalQuestions: 0,
      correctCount: 0,
      correctRate: 0,
      currentStreak: 0,
      avgDifficulty: 2,
    }
  }

  // 计算正确率
  const correctCount = records.filter((r) => r.is_correct).length
  const correctRate = correctCount / records.length

  // 计算当前连续正确数（从最新的开始）
  let currentStreak = 0
  for (const record of records) {
    if (record.is_correct) {
      currentStreak++
    } else {
      break
    }
  }

  // 计算平均难度
  const difficulties = records
    .map((r: Record<string, unknown>) => {
      const qc = r.question_cache as Record<string, unknown> | undefined
      return (qc?.difficulty as number) || 2
    })
    .filter(Boolean)
  const avgDifficulty =
    difficulties.length > 0
      ? difficulties.reduce((a, b) => a + b, 0) / difficulties.length
      : 2

  return {
    totalQuestions: records.length,
    correctCount,
    correctRate,
    currentStreak,
    avgDifficulty,
  }
}

/**
 * 获取上次使用的难度
 */
async function getLastDifficulty(
  kidId: string,
  subject: string
): Promise<number> {
  const { data } = await supabaseAdmin
    .from("study_records")
    .select("question_cache(difficulty)")
    .eq("kid_id", kidId)
    .eq("subject", subject)
    .order("answered_at", { ascending: false })
    .limit(1)
    .single()

  const record = data as Record<string, unknown> | null
  const qc = record?.question_cache as Record<string, unknown> | undefined
  return (qc?.difficulty as number) || 2
}

/**
 * 计算推荐难度
 *
 * 策略：
 * - 正确率 > 85% 且连续正确 >= 5 → 升级
 * - 正确率 < 50% → 降级
 * - 其他情况 → 保持当前难度
 */
export async function calculateDifficulty(
  kidId: string,
  subject: string
): Promise<number> {
  const [stats, lastDifficulty] = await Promise.all([
    getStudyStats(kidId, subject),
    getLastDifficulty(kidId, subject),
  ])

  // 新手保护：做过少于 5 题，返回默认难度 3
  if (stats.totalQuestions < 5) {
    console.log(`[Difficulty] New user, returning default difficulty 3`)
    return 3
  }

  let newDifficulty = lastDifficulty

  // 升级条件：正确率高 + 连续答对
  if (stats.correctRate > 0.85 && stats.currentStreak >= 5) {
    newDifficulty = Math.min(5, lastDifficulty + 1)
    console.log(
      `[Difficulty] Level up! correctRate=${stats.correctRate.toFixed(2)}, streak=${stats.currentStreak} → ${newDifficulty}`
    )
  }
  // 降级条件：正确率低
  else if (stats.correctRate < 0.5) {
    newDifficulty = Math.max(1, lastDifficulty - 1)
    console.log(
      `[Difficulty] Level down! correctRate=${stats.correctRate.toFixed(2)} → ${newDifficulty}`
    )
  }
  // 保持
  else {
    console.log(
      `[Difficulty] Staying at ${lastDifficulty}, correctRate=${stats.correctRate.toFixed(2)}, streak=${stats.currentStreak}`
    )
  }

  return newDifficulty
}

/**
 * 获取难度描述
 */
export function getDifficultyLabel(difficulty: number): string {
  const labels: Record<number, string> = {
    1: "基础巩固",
    2: "日常练习",
    3: "熟练运用",
    4: "思维提升",
    5: "挑战拓展",
  }
  return labels[difficulty] || "日常练习"
}

/**
 * 获取难度对应的星星数
 */
export function getDifficultyStars(difficulty: number): string {
  return "⭐".repeat(difficulty) + "☆".repeat(5 - difficulty)
}
