import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { updateStreak } from "@/lib/streak"

export async function POST(request: NextRequest) {
  try {
    const { check_in_id, action } = await request.json()

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "无效操作" }, { status: 400 })
    }

    const status = action === "approve" ? "approved" : "rejected"

    const { data: checkIn, error } = await supabaseAdmin
      .from("check_ins")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", check_in_id)
      .select("*, tasks(points, name)")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (action === "approve") {
      await supabaseAdmin.from("points_log").insert({
        kid_id: checkIn.kid_id,
        amount: checkIn.tasks.points,
        reason: `完成任务: ${checkIn.tasks.name || "打卡任务"}`,
      })

      await updateStreak(checkIn.kid_id)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}