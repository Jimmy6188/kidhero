import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kidId = searchParams.get("kid_id")

    let query = supabaseAdmin
      .from("wishes")
      .select("*")
      .not("kid_id", "is", null)
      .order("created_at", { ascending: false })

    if (kidId) {
      query = query.eq("kid_id", kidId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ wishes: data || [] })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { kid_id, title, description } = await request.json()

    if (!kid_id || !title) {
      return NextResponse.json({ error: "参数缺失" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("wishes")
      .insert({
        kid_id,
        title,
        description: description || null,
        points_cost: 100,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, wish: data })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status, points_cost } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "缺少 id" }, { status: 400 })
    }

    const updates: { status?: string; points_cost?: number } = {}
    if (status) updates.status = status
    if (typeof points_cost === "number") updates.points_cost = points_cost

    const { data, error } = await supabaseAdmin
      .from("wishes")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, wish: data })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}