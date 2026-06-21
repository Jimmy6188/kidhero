// LLM 配置管理 API

import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

// 获取所有配置
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("llm_configs")
      .select("id, name, url, protocol, model, priority, enabled, created_at")
      .order("priority", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ configs: data || [] })
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch configs" },
      { status: 500 }
    )
  }
}

// 添加新配置
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, url, api_key, protocol, model, priority } = body

    // 验证必填字段
    if (!name || !url || !api_key || !protocol || !model) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // 验证协议
    if (!["openai", "anthropic"].includes(protocol)) {
      return NextResponse.json(
        { error: "Protocol must be 'openai' or 'anthropic'" },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("llm_configs")
      .insert({
        name,
        url,
        api_key,
        protocol,
        model,
        priority: priority || 0,
        enabled: true,
      })
      .select("id, name, url, protocol, model, priority, enabled")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ config: data })
  } catch {
    return NextResponse.json(
      { error: "Failed to add config" },
      { status: 500 }
    )
  }
}

// 更新配置
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, name, url, api_key, protocol, model, priority, enabled } = body

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (url !== undefined) updateData.url = url
    if (api_key !== undefined) updateData.api_key = api_key
    if (protocol !== undefined) updateData.protocol = protocol
    if (model !== undefined) updateData.model = model
    if (priority !== undefined) updateData.priority = priority
    if (enabled !== undefined) updateData.enabled = enabled

    const { data, error } = await supabaseAdmin
      .from("llm_configs")
      .update(updateData)
      .eq("id", id)
      .select("id, name, url, protocol, model, priority, enabled")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ config: data })
  } catch {
    return NextResponse.json(
      { error: "Failed to update config" },
      { status: 500 }
    )
  }
}

// 删除配置
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("llm_configs")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Failed to delete config" },
      { status: 500 }
    )
  }
}
