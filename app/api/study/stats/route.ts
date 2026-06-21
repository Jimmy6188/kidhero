// 学习统计 API

import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { getErrorStats } from "@/lib/error-review"
import { calculateDifficulty, getDifficultyLabel } from "@/lib/difficulty-adapter"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const kidId = searchParams.get("kid_id")
    const subject = searchParams.get("subject") || "math"

    if (!kidId) {
      return NextResponse.json({ error: "kid_id is required" }, { status: 400 })
    }

    // 并行获取各项数据
    const [errorStats, difficulty, todayRecords, totalRecords] = await Promise.all([
      getErrorStats(kidId),
      calculateDifficulty(kidId, subject),
      getTodayRecords(kidId),
      getTotalRecords(kidId),
    ])

    return NextResponse.json({
      error_stats: errorStats,
      current_difficulty: difficulty,
      difficulty_label: getDifficultyLabel(difficulty),
      today: todayRecords,
      total: totalRecords,
    })
  } catch (error) {
    console.error("[StudyStats] Error:", error)
    return NextResponse.json(
      { error: "Failed to get study stats" },
      { status: 500 }
    )
  }
}

async function getTodayRecords(kidId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data, error } = await supabaseAdmin
    .from("study_records")
    .select("is_correct")
    .eq("kid_id", kidId)
    .gte("answered_at", today.toISOString())

  if (error || !data) {
    return { total: 0, correct: 0, correct_rate: 0 }
  }

  const total = data.length
  const correct = data.filter((r) => r.is_correct).length

  return {
    total,
    correct,
    correct_rate: total > 0 ? Math.round((correct / total) * 100) : 0,
  }
}

async function getTotalRecords(kidId: string) {
  const { data, error } = await supabaseAdmin
    .from("study_records")
    .select("is_correct")
    .eq("kid_id", kidId)

  if (error || !data) {
    return { total: 0, correct: 0, correct_rate: 0 }
  }

  const total = data.length
  const correct = data.filter((r) => r.is_correct).length

  return {
    total,
    correct,
    correct_rate: total > 0 ? Math.round((correct / total) * 100) : 0,
  }
}
