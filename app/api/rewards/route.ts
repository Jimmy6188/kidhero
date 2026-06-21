import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

// GET: fetch parent-managed rewards (kid_id is null)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get("parent_id")

    let query = supabaseAdmin
      .from("wishes")
      .select("*")
      .is("kid_id", null)
      .eq("status", "approved")

    // 如果有 parentId，优先查询该家长创建的奖品，否则返回所有公共奖品
    if (parentId) {
      query = query.or(`description.eq.parent:${parentId},description.is.null`)
    }

    const { data, error } = await query.order("points_cost", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rewards: data || [] })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

// POST: create a new reward
export async function POST(request: NextRequest) {
  try {
    const { title, description, points_cost, parent_id, category } = await request.json()

    if (!title || !points_cost || !parent_id) {
      return NextResponse.json({ error: "参数缺失" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("wishes")
      .insert({
        title,
        description: `parent:${parent_id}`,
        points_cost,
        status: "approved",
        kid_id: null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, reward: data })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

// PUT: update a reward
export async function PUT(request: NextRequest) {
  try {
    const { id, title, points_cost } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "缺少 id" }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (title) updates.title = title
    if (points_cost) updates.points_cost = points_cost

    const { data, error } = await supabaseAdmin
      .from("wishes")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, reward: data })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

// DELETE: remove a reward
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "缺少 id" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from("wishes").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
