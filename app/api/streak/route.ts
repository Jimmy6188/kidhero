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
      .from("streaks")
      .select("*")
      .eq("kid_id", kidId)
      .single()

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      streak: data || {
        current_streak: 0,
        best_streak: 0,
        rescue_count: 0,
      },
    })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}