import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { getQuestionsForDaily } from "@/lib/difficulty"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kidId = searchParams.get("kid_id")
    const count = Number(searchParams.get("count") || "10")
    const subject = searchParams.get("subject")
    const difficulty = searchParams.get("difficulty")

    // If kid_id provided, use adaptive difficulty
    if (kidId) {
      const questions = await getQuestionsForDaily(kidId, count)
      return NextResponse.json({ questions })
    }

    // Otherwise simple query
    let query = supabaseAdmin.from("questions").select("*")
    if (subject) query = query.eq("subject", subject)
    if (difficulty) query = query.eq("difficulty", Number(difficulty))

    const { data, error } = await query.limit(count)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ questions: data || [] })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}