// 错题循环复习机制

import { supabaseAdmin } from "./supabase-server"

// 艾宾浩斯遗忘曲线间隔（小时）
const REVIEW_INTERVALS = [1, 24, 72, 168, 336] // 1小时, 1天, 3天, 7天, 14天

/**
 * 计算下次复习时间
 */
function calculateNextReview(wrongCount: number): Date {
  // 边界保护：wrongCount 至少为 1
  const safeCount = Math.max(1, wrongCount)
  const intervalIndex = Math.min(safeCount - 1, REVIEW_INTERVALS.length - 1)
  const hours = REVIEW_INTERVALS[intervalIndex]
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}

/**
 * 记录错误并安排复习
 */
export async function recordError(
  kidId: string,
  knowledgePoint: string
): Promise<void> {
  if (!knowledgePoint) return

  // 查找是否已有记录
  const { data: existing } = await supabaseAdmin
    .from("error_records")
    .select("*")
    .eq("kid_id", kidId)
    .eq("knowledge_point", knowledgePoint)
    .single()

  if (existing) {
    // 更新错误次数和下次复习时间
    const newCount = existing.wrong_count + 1
    await supabaseAdmin
      .from("error_records")
      .update({
        wrong_count: newCount,
        last_wrong_at: new Date().toISOString(),
        next_review_at: calculateNextReview(newCount).toISOString(),
        is_mastered: false, // 如果再次出错，重置为未掌握
      })
      .eq("id", existing.id)
  } else {
    // 创建新记录
    await supabaseAdmin.from("error_records").insert({
      kid_id: kidId,
      knowledge_point: knowledgePoint,
      wrong_count: 1,
      next_review_at: calculateNextReview(1).toISOString(),
    })
  }
}

/**
 * 记录答对（用于判断是否掌握）
 */
export async function recordCorrect(
  kidId: string,
  knowledgePoint: string
): Promise<void> {
  if (!knowledgePoint) return

  const { data: existing } = await supabaseAdmin
    .from("error_records")
    .select("*")
    .eq("kid_id", kidId)
    .eq("knowledge_point", knowledgePoint)
    .eq("is_mastered", false)
    .single()

  if (!existing) return

  // 检查最近的学习记录，如果连续答对 3 次，标记为掌握
  const { data: recentRecords } = await supabaseAdmin
    .from("study_records")
    .select("is_correct")
    .eq("kid_id", kidId)
    .eq("knowledge_point", knowledgePoint)
    .order("answered_at", { ascending: false })
    .limit(3)

  if (recentRecords && recentRecords.length >= 3) {
    const allCorrect = recentRecords.every((r) => r.is_correct)
    if (allCorrect) {
      await supabaseAdmin
        .from("error_records")
        .update({ is_mastered: true })
        .eq("id", existing.id)
    }
  }
}

/**
 * 获取需要复习的知识点
 */
export async function getReviewTopics(
  kidId: string,
  limit: number = 5
): Promise<string[]> {
  const now = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from("error_records")
    .select("knowledge_point")
    .eq("kid_id", kidId)
    .eq("is_mastered", false)
    .lte("next_review_at", now)
    .order("next_review_at", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("[ErrorReview] Failed to get review topics:", error)
    return []
  }

  return data?.map((r) => r.knowledge_point) || []
}

/**
 * 获取错题统计
 */
export async function getErrorStats(kidId: string): Promise<{
  total: number
  mastered: number
  pending: number
  overdue: number
}> {
  const now = new Date().toISOString()

  const [total, mastered, overdue] = await Promise.all([
    supabaseAdmin
      .from("error_records")
      .select("id", { count: "exact", head: true })
      .eq("kid_id", kidId),

    supabaseAdmin
      .from("error_records")
      .select("id", { count: "exact", head: true })
      .eq("kid_id", kidId)
      .eq("is_mastered", true),

    supabaseAdmin
      .from("error_records")
      .select("id", { count: "exact", head: true })
      .eq("kid_id", kidId)
      .eq("is_mastered", false)
      .lte("next_review_at", now),
  ])

  const totalCount = total.count || 0
  const masteredCount = mastered.count || 0
  const overdueCount = overdue.count || 0

  return {
    total: totalCount,
    mastered: masteredCount,
    pending: totalCount - masteredCount,
    overdue: overdueCount,
  }
}

/**
 * 重置某个知识点的掌握状态（用于重新复习）
 */
export async function resetMastery(
  kidId: string,
  knowledgePoint: string
): Promise<void> {
  await supabaseAdmin
    .from("error_records")
    .update({
      is_mastered: false,
      wrong_count: 1,
      next_review_at: calculateNextReview(1).toISOString(),
    })
    .eq("kid_id", kidId)
    .eq("knowledge_point", knowledgePoint)
}