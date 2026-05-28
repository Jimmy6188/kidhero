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
      .from("error_book")
      .select("*, questions(id, subject, content, answer, explanation, difficulty)")
      .eq("kid_id", kidId)
      .eq("is_resolved", false)
      .order("last_wrong_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ errors: data || [] })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { kid_id, question_id, is_correct } = await request.json()

    if (!kid_id || !question_id) {
      return NextResponse.json({ error: "参数缺失" }, { status: 400 })
    }

    if (is_correct) {
      const { data: existing } = await supabaseAdmin
        .from("error_book")
        .select("*")
        .eq("kid_id", kid_id)
        .eq("question_id", question_id)
        .single()

      if (existing) {
        await supabaseAdmin
          .from("error_book")
          .update({ is_resolved: true })
          .eq("id", existing.id)

        await supabaseAdmin.from("points_log").insert({
          kid_id,
          amount: 5,
          reason: "纠错本重做正确",
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}