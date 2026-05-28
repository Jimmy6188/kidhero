import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kidId = searchParams.get("kid_id")

    if (!kidId) {
      return NextResponse.json({ error: "缺少 kid_id" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("user_badges")
      .select("*, badges(*)")
      .eq("kid_id", kidId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ user_badges: data || [] })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { kid_id, badge_name } = await request.json()

    if (!kid_id || !badge_name) {
      return NextResponse.json({ error: "参数缺失" }, { status: 400 })
    }

    // Find badge by name
    const { data: badge } = await supabaseAdmin
      .from("badges")
      .select("*")
      .eq("name", badge_name)
      .single()

    if (!badge) {
      return NextResponse.json({ error: "勋章不存在" }, { status: 404 })
    }

    // Check if already unlocked
    const { data: existing } = await supabaseAdmin
      .from("user_badges")
      .select("*")
      .eq("kid_id", kid_id)
      .eq("badge_id", badge.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: "已解锁" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("user_badges")
      .insert({ kid_id, badge_id: badge.id })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, user_badge: data })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}