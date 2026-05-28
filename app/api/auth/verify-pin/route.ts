import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { pin_code } = await request.json()

    if (!pin_code || pin_code.length < 4) {
      return NextResponse.json({ error: "PIN 码无效" }, { status: 400 })
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, name, role, family_id")
      .eq("pin_code", pin_code)
      .eq("role", "parent")
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "PIN 码错误" }, { status: 401 })
    }

    const { data: kid } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("role", "kid")
      .eq("parent_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        family_id: user.family_id,
        kid_id: kid?.id || undefined,
      },
    })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
