import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const kidId = typeof body.kid_id === "string" ? body.kid_id.trim() : ""
    const questionId = typeof body.question_id === "string" ? body.question_id.trim() : ""
    const isCorrect = typeof body.is_correct === "boolean" ? body.is_correct : null
    const mode = typeof body.mode === "string" ? body.mode.trim() : "daily"

    if (!kidId || !questionId || isCorrect === null) {
      return NextResponse.json({ error: "参数缺失" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from("study_records").insert({
      kid_id: kidId,
      question_id: questionId,
      is_correct: isCorrect,
      mode: mode || "daily",
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update error book
    if (!isCorrect) {
      const { data: existing } = await supabaseAdmin
        .from("error_book")
        .select("*")
        .eq("kid_id", kidId)
        .eq("question_id", questionId)
        .single()

      if (existing) {
        await supabaseAdmin
          .from("error_book")
          .update({
            wrong_count: existing.wrong_count + 1,
            last_wrong_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
      } else {
        await supabaseAdmin.from("error_book").insert({
          kid_id: kidId,
          question_id: questionId,
          wrong_count: 1,
          is_resolved: false,
          last_wrong_at: new Date().toISOString(),
        })
      }
    } else {
      const { data: errorEntry } = await supabaseAdmin
        .from("error_book")
        .select("*")
        .eq("kid_id", kidId)
        .eq("question_id", questionId)
        .eq("is_resolved", false)
        .single()

      if (errorEntry) {
        await supabaseAdmin
          .from("error_book")
          .update({ is_resolved: true })
          .eq("id", errorEntry.id)

        await supabaseAdmin.from("points_log").insert({
          kid_id: kidId,
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kidId = searchParams.get("kid_id")

    if (!kidId) {
      return NextResponse.json({ error: "缺少 kid_id" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("study_records")
      .select("*, questions(subject, difficulty, knowledge_point)")
      .eq("kid_id", kidId)
      .order("answered_at", { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ records: data || [] })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
