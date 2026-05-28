import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const taskId = typeof body.task_id === "string" ? body.task_id.trim() : ""
    const kidId = typeof body.kid_id === "string" ? body.kid_id.trim() : ""

    if (!taskId || !kidId) {
      return NextResponse.json({ error: "参数缺失" }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]
    const { data: existing } = await supabaseAdmin
      .from("check_ins")
      .select("id")
      .eq("task_id", taskId)
      .eq("kid_id", kidId)
      .gte("checked_at", `${today}T00:00:00`)
      .single()

    if (existing) {
      return NextResponse.json({ error: "今日已打卡" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("check_ins")
      .insert({
        task_id: taskId,
        kid_id: kidId,
        status: "pending",
        checked_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, check_in: data })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kidId = searchParams.get("kid_id")
    const status = searchParams.get("status")

    let query = supabaseAdmin
      .from("check_ins")
      .select("*, tasks(name, icon, points)")
      .order("checked_at", { ascending: false })

    if (kidId) query = query.eq("kid_id", kidId)
    if (status) query = query.eq("status", status)

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ check_ins: data || [] })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
