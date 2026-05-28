import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get("parent_id")

    if (!parentId) {
      return NextResponse.json({ error: "缺少 parent_id" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, name, role, parent_id, family_id")
      .eq("role", "kid")
      .eq("parent_id", parentId)
      .order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ kids: data || [] })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parentId = typeof body.parent_id === "string" ? body.parent_id.trim() : ""
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const birthYear = typeof body.birth_year === "number" ? body.birth_year : null
    const grade = typeof body.grade === "number" ? body.grade : null

    if (!parentId || !name) {
      return NextResponse.json({ error: "参数缺失" }, { status: 400 })
    }

    if (name.length > 30) {
      return NextResponse.json({ error: "孩子姓名过长" }, { status: 400 })
    }

    if (birthYear !== null && (birthYear < 2000 || birthYear > 2100)) {
      return NextResponse.json({ error: "出生年份无效" }, { status: 400 })
    }

    if (grade !== null && (grade < 1 || grade > 12)) {
      return NextResponse.json({ error: "年级范围无效" }, { status: 400 })
    }

    const { data: parent } = await supabaseAdmin
      .from("users")
      .select("family_id")
      .eq("id", parentId)
      .single()

    const familyId = parent?.family_id || parentId

    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        role: "kid",
        name,
        parent_id: parentId,
        family_id: familyId,
        birth_year: birthYear,
        grade,
      })
      .select("id, name, role, parent_id, family_id")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, kid: data })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
