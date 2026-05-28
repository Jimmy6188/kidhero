import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kidId = searchParams.get("kid_id")

    if (!kidId) {
      return NextResponse.json({ error: "缺少 kid_id" }, { status: 400 })
    }

    const [checkInsResult, pointsResult, badgesResult, growthResult] = await Promise.all([
      supabaseAdmin.from("check_ins").select("status, checked_at").eq("kid_id", kidId),
      supabaseAdmin.from("points_log").select("amount, created_at").eq("kid_id", kidId),
      supabaseAdmin.from("user_badges").select("id").eq("kid_id", kidId),
      supabaseAdmin.from("growth_records").select("height, weight, recorded_at").eq("kid_id", kidId),
    ])

    const checkIns = checkInsResult.data || []
    const pointsLogs = pointsResult.data || []
    const badges = badgesResult.data || []
    const growthRecords = growthResult.data || []

    const approvedCount = checkIns.filter((item) => item.status === "approved").length
    const rejectedCount = checkIns.filter((item) => item.status === "rejected").length
    const totalPoints = pointsLogs.reduce((sum, log) => sum + log.amount, 0)

    const pointsTrend = Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      const dateKey = date.toISOString().split("T")[0]
      const total = pointsLogs
        .filter((log) => log.created_at?.startsWith(dateKey))
        .reduce((sum, log) => sum + log.amount, 0)

      return {
        date: dateKey.slice(5),
        total,
      }
    })

    const latestGrowth = growthRecords[growthRecords.length - 1] || null

    return NextResponse.json({
      summary: {
        approved_count: approvedCount,
        rejected_count: rejectedCount,
        total_points: totalPoints,
        badge_count: badges.length,
      },
      points_trend: pointsTrend,
      latest_growth: latestGrowth,
    })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
