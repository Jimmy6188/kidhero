import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { name, relationship, pin_code } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "请输入姓名" }, { status: 400 })
    }

    if (!pin_code || pin_code.length !== 6) {
      return NextResponse.json({ error: "PIN 码需要 6 位数字" }, { status: 400 })
    }

    if (!/^\d+$/.test(pin_code)) {
      return NextResponse.json({ error: "PIN 码只能包含数字" }, { status: 400 })
    }

    // Check if PIN already exists
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("pin_code", pin_code)
      .eq("role", "parent")
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "该 PIN 码已被使用，请换一个" }, { status: 400 })
    }

    // Create parent user
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .insert({
        name: name.trim(),
        role: "parent",
        relationship: relationship || null,
        pin_code,
      })
      .select("id, name, role, family_id, relationship")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update family_id to own id
    await supabaseAdmin
      .from("users")
      .update({ family_id: user.id })
      .eq("id", user.id)

    return NextResponse.json({
      success: true,
      user: { ...user, family_id: user.id },
    })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
