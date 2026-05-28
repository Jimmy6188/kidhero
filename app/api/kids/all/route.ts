import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, name, avatar, grade")
      .eq("role", "kid")
      .order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ kids: data || [] })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
