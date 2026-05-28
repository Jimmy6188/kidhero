import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { DEFAULT_TASKS } from "@/lib/constants"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get("parent_id")

    if (!parentId) {
      return NextResponse.json({ error: "缺少 parent_id" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, name, role, parent_id, family_id, avatar, grade, birth_year, height, weight")
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
    const avatar = typeof body.avatar === "string" ? body.avatar : "🦸‍♂️"
    const height = typeof body.height === "number" ? body.height : null
    const weight = typeof body.weight === "number" ? body.weight : null

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

    const { data: kid, error } = await supabaseAdmin
      .from("users")
      .insert({
        role: "kid",
        name,
        parent_id: parentId,
        family_id: familyId,
        birth_year: birthYear,
        grade,
        avatar,
        height,
        weight,
      })
      .select("id, name, role, parent_id, family_id, avatar, grade, birth_year, height, weight")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create initial streak record
    await supabaseAdmin.from("streaks").insert({ kid_id: kid.id })

    // Create initial growth record if height/weight provided
    if (height || weight) {
      await supabaseAdmin.from("growth_records").insert({
        kid_id: kid.id,
        height: height || null,
        weight: weight || null,
        note: "初始记录",
      })
    }

    // Create default tasks for this parent (if not already exist)
    const { data: existingTasks } = await supabaseAdmin
      .from("tasks")
      .select("id")
      .eq("user_id", parentId)
      .limit(1)

    if (!existingTasks || existingTasks.length === 0) {
      const tasksToInsert = DEFAULT_TASKS.map((t) => ({
        user_id: parentId,
        name: t.name,
        icon: t.icon,
        category: t.category,
        points: t.points,
        frequency: "daily",
        require_approval: true,
        is_active: true,
      }))
      await supabaseAdmin.from("tasks").insert(tasksToInsert)
    }

    return NextResponse.json({ success: true, kid })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
