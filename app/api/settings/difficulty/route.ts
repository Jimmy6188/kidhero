// 难度设置 API

import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { getCurrentUser, verifyParentOfKid } from "@/lib/auth-middleware"

// 获取难度设置
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const kidId = searchParams.get("kid_id")

    if (!kidId) {
      return NextResponse.json({ error: "kid_id is required" }, { status: 400 })
    }

    // 验证权限：家长可以查看孩子的设置，孩子可以查看自己的设置
    if (user.id !== kidId) {
      const isParent = await verifyParentOfKid(user.id, kidId)
      if (!isParent) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // 从 users 表获取难度设置
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("difficulty_mode, fixed_difficulty")
      .eq("id", kidId)
      .single()

    if (error) {
      // 如果字段不存在，返回默认值
      return NextResponse.json({
        mode: "auto",
        fixed_difficulty: 3,
      })
    }

    return NextResponse.json({
      mode: data?.difficulty_mode || "auto",
      fixed_difficulty: data?.fixed_difficulty || 3,
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 }
    )
  }
}

// 更新难度设置
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { kid_id, mode, fixed_difficulty } = body

    if (!kid_id || !mode) {
      return NextResponse.json(
        { error: "kid_id and mode are required" },
        { status: 400 }
      )
    }

    // 验证权限：只有家长可以修改设置
    const isParent = await verifyParentOfKid(user.id, kid_id)
    if (!isParent) {
      return NextResponse.json({ error: "只有家长可以修改难度设置" }, { status: 403 })
    }

    // 验证参数
    if (!["auto", "manual"].includes(mode)) {
      return NextResponse.json(
        { error: "mode must be 'auto' or 'manual'" },
        { status: 400 }
      )
    }

    if (mode === "manual" && (fixed_difficulty < 1 || fixed_difficulty > 5)) {
      return NextResponse.json(
        { error: "fixed_difficulty must be between 1 and 5" },
        { status: 400 }
      )
    }

    // 更新设置
    const { error } = await supabaseAdmin
      .from("users")
      .update({
        difficulty_mode: mode,
        fixed_difficulty: mode === "manual" ? fixed_difficulty : null,
      })
      .eq("id", kid_id)

    if (error) {
      // 如果字段不存在，尝试添加字段后再更新
      console.error("[DifficultySettings] Update error:", error)
      return NextResponse.json(
        { error: "Failed to update settings. Please run database migration first." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
}
