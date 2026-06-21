import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { kid_id } = await request.json()

    if (!kid_id) {
      return NextResponse.json({ error: "缺少 kid_id" }, { status: 400 })
    }

    // Get the kid's info including creation time
    const { data: kid } = await supabaseAdmin
      .from("users")
      .select("parent_id, created_at")
      .eq("id", kid_id)
      .single()

    if (!kid?.parent_id) {
      return NextResponse.json({ settled: false, reason: "no parent" })
    }

    // Check if kid was created today - skip penalty for new kids
    const today = new Date().toISOString().slice(0, 10)
    const kidCreatedDate = new Date(kid.created_at).toISOString().slice(0, 10)

    if (kidCreatedDate >= today) {
      return NextResponse.json({ settled: false, reason: "new_kid" })
    }

    // Check if already settled today
    const { data: existingLog } = await supabaseAdmin
      .from("points_log")
      .select("id")
      .eq("kid_id", kid_id)
      .like("reason", "daily_penalty_%")
      .gte("created_at", today + "T00:00:00")
      .limit(1)

    if (existingLog && existingLog.length > 0) {
      return NextResponse.json({ settled: false, reason: "already_settled" })
    }

    // Get yesterday's date range
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)

    // Get all active daily tasks for this parent
    const { data: tasks } = await supabaseAdmin
      .from("tasks")
      .select("id, name, icon, points")
      .eq("user_id", kid.parent_id)
      .eq("is_active", true)
      .eq("frequency", "daily")

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ settled: true, missed: 0, deducted: 0 })
    }

    // Get yesterday's approved check-ins
    const { data: checkIns } = await supabaseAdmin
      .from("check_ins")
      .select("task_id")
      .eq("kid_id", kid_id)
      .eq("status", "approved")
      .gte("checked_at", yesterdayStr + "T00:00:00")
      .lt("checked_at", today + "T00:00:00")

    const completedTaskIds = new Set((checkIns || []).map((c) => c.task_id))

    // Find missed tasks
    const missedTasks = tasks.filter((t) => !completedTaskIds.has(t.id))

    if (missedTasks.length === 0) {
      return NextResponse.json({ settled: true, missed: 0, deducted: 0 })
    }

    // Deduct points: 50% of each missed task's points
    let totalDeducted = 0
    for (const task of missedTasks) {
      const deduction = Math.ceil(task.points * 0.5)
      totalDeducted += deduction

      await supabaseAdmin.from("points_log").insert({
        kid_id,
        amount: -deduction,
        reason: `daily_penalty_${yesterdayStr}: 未完成 ${task.name}`,
      })
    }

    // Ensure points don't go below 0
    const { data: pointsData } = await supabaseAdmin
      .from("points_log")
      .select("amount")
      .eq("kid_id", kid_id)

    const totalPoints = (pointsData || []).reduce((sum, p) => sum + p.amount, 0)

    if (totalPoints < 0) {
      await supabaseAdmin.from("points_log").insert({
        kid_id,
        amount: -totalPoints,
        reason: "points_floor_adjustment",
      })
    }

    return NextResponse.json({
      settled: true,
      missed: missedTasks.length,
      deducted: totalDeducted,
      tasks: missedTasks.map((t) => ({ name: t.name, icon: t.icon })),
    })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
