// LLM 配置管理 API（按家庭隔离）

import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { getCurrentUser, verifyFamilyMember } from "@/lib/auth-middleware"

// 获取当前家庭的配置
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const familyId = searchParams.get("family_id")

    if (!familyId) {
      return NextResponse.json({ error: "family_id is required" }, { status: 400 })
    }

    // 验证用户是否属于该家庭
    const isMember = await verifyFamilyMember(user.id, familyId)
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data, error } = await supabaseAdmin
      .from("llm_configs")
      .select("id, name, url, api_key, protocol, model, priority, enabled, created_at")
      .eq("family_id", familyId)
      .order("priority", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 隐藏 API Key 的中间部分
    const maskedConfigs = (data || []).map(config => ({
      ...config,
      api_key: config.api_key ? `${config.api_key.slice(0, 8)}...${config.api_key.slice(-4)}` : '',
    }))

    return NextResponse.json({ configs: maskedConfigs })
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
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, url, api_key, protocol, model, priority, family_id } = body

    // 验证必填字段
    if (!name || !url || !api_key || !protocol || !model || !family_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // 验证用户是否属于该家庭
    const isMember = await verifyFamilyMember(user.id, family_id)
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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
        family_id,
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
    const { id, name, url, api_key, protocol, model, priority, enabled, family_id } = body

    if (!id || !family_id) {
      return NextResponse.json({ error: "id and family_id are required" }, { status: 400 })
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
      .eq("family_id", family_id)  // 只能修改自己家庭的配置
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
    const familyId = searchParams.get("family_id")

    if (!id || !familyId) {
      return NextResponse.json({ error: "id and family_id are required" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("llm_configs")
      .delete()
      .eq("id", id)
      .eq("family_id", familyId)  // 只能删除自己家庭的配置

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