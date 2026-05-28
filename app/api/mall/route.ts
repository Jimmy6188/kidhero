import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kidId = searchParams.get("kid_id")

    // Get parent rewards (kid_id is null) + kid's own approved wishes
    const { data, error } = await supabaseAdmin
      .from("wishes")
      .select("*")
      .eq("status", "approved")
      .or(`kid_id.is.null,kid_id.eq.${kidId || "null"}`)
      .order("points_cost", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ items: data || [] })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { wish_id, kid_id } = await request.json()

    if (!wish_id || !kid_id) {
      return NextResponse.json({ error: "参数缺失" }, { status: 400 })
    }

    const { data: wish } = await supabaseAdmin
      .from("wishes")
      .select("*")
      .eq("id", wish_id)
      .single()

    if (!wish) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 })
    }

    const { data: logs } = await supabaseAdmin
      .from("points_log")
      .select("amount")
      .eq("kid_id", kid_id)

    const totalPoints = (logs || []).reduce((sum, log) => sum + log.amount, 0)

    if (totalPoints < wish.points_cost) {
      return NextResponse.json({ error: "积分不足" }, { status: 400 })
    }

    await supabaseAdmin.from("points_log").insert({
      kid_id,
      amount: -wish.points_cost,
      reason: `兑换: ${wish.title}`,
    })

    await supabaseAdmin
      .from("wishes")
      .update({ status: "fulfilled" })
      .eq("id", wish_id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}