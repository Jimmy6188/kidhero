import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kidId = searchParams.get("kid_id")

    if (!kidId) {
      return NextResponse.json({ error: "缺少 kid_id" }, { status: 400 })
    }

    // Get study records
    const { data: records } = await supabaseAdmin
      .from("study_records")
      .select("*, questions(subject, difficulty, knowledge_point)")
      .eq("kid_id", kidId)
      .order("answered_at", { ascending: false })

    // Calculate stats by subject
    const subjects = ["math", "chinese", "english"]
    const subjectStats: Record<string, { total: number; correct: number; rate: number }> = {}

    for (const subject of subjects) {
      const subjectRecords = (records || []).filter(
        (r) => r.questions?.subject === subject
      )
      const total = subjectRecords.length
      const correct = subjectRecords.filter((r) => r.is_correct).length
      subjectStats[subject] = {
        total,
        correct,
        rate: total > 0 ? Math.round((correct / total) * 100) : 0,
      }
    }

    // Get weak points
    const weakPoints: string[] = []
    for (const subject of subjects) {
      const subjectRecords = (records || []).filter(
        (r) => r.questions?.subject === subject
      )
      const pointStats: Record<string, { total: number; correct: number }> = {}

      for (const record of subjectRecords) {
        const point = record.questions?.knowledge_point || "未知"
        if (!pointStats[point]) pointStats[point] = { total: 0, correct: 0 }
        pointStats[point].total++
        if (record.is_correct) pointStats[point].correct++
      }

      for (const [point, stats] of Object.entries(pointStats)) {
        if (stats.total >= 3 && stats.correct / stats.total < 0.6) {
          const subjectName =
            subject === "math" ? "数学" : subject === "chinese" ? "语文" : "英语"
          weakPoints.push(`${subjectName}: ${point} (${Math.round((stats.correct / stats.total) * 100)}%)`)
        }
      }
    }

    // Get error book count
    const { count: unresolvedErrors } = await supabaseAdmin
      .from("error_book")
      .select("*", { count: "exact", head: true })
      .eq("kid_id", kidId)
      .eq("is_resolved", false)

    // Get weekly trend (last 7 days)
    const weeklyTrend: { date: string; correct: number; total: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayRecords = (records || []).filter(
        (r) => r.answered_at?.startsWith(dateStr)
      )

      weeklyTrend.push({
        date: dateStr.slice(5),
        correct: dayRecords.filter((r) => r.is_correct).length,
        total: dayRecords.length,
      })
    }

    return NextResponse.json({
      total_records: records?.length || 0,
      subject_stats: subjectStats,
      weak_points: weakPoints,
      unresolved_errors: unresolvedErrors || 0,
      weekly_trend: weeklyTrend,
    })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}