// 家庭邀请码 API

import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

// 获取或生成邀请码
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 })
    }

    // 查询用户当前邀请码
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("invite_code, family_id")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 如果已有邀请码，直接返回
    if (user.invite_code) {
      return NextResponse.json({ invite_code: user.invite_code })
    }

    // 生成新邀请码
    const { data: codeData, error: codeError } = await supabaseAdmin
      .rpc("generate_invite_code")
      .single()

    if (codeError || !codeData) {
      return NextResponse.json({ error: "Failed to generate code" }, { status: 500 })
    }

    // 更新用户邀请码
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ invite_code: codeData })
      .eq("id", userId)

    if (updateError) {
      return NextResponse.json({ error: "Failed to save code" }, { status: 500 })
    }

    return NextResponse.json({ invite_code: codeData })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// 验证邀请码并加入家庭
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { invite_code, user_id } = body

    if (!invite_code || !user_id) {
      return NextResponse.json(
        { error: "invite_code and user_id are required" },
        { status: 400 }
      )
    }

    // 查找邀请码对应的家长
    const { data: inviter, error: inviterError } = await supabaseAdmin
      .from("users")
      .select("id, family_id, name")
      .eq("invite_code", invite_code.toUpperCase())
      .eq("role", "parent")
      .single()

    if (inviterError || !inviter) {
      return NextResponse.json(
        { error: "邀请码无效" },
        { status: 400 }
      )
    }

    // 获取邀请者的家庭 ID（如果没有则用邀请者自己的 ID）
    const familyId = inviter.family_id || inviter.id

    // 更新当前用户加入家庭
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ family_id: familyId })
      .eq("id", user_id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to join family" }, { status: 500 })
    }

    // 获取该家庭的孩子列表
    const { data: kids } = await supabaseAdmin
      .from("users")
      .select("id, name, avatar, grade")
      .eq("family_id", familyId)
      .eq("role", "kid")

    return NextResponse.json({
      success: true,
      family_id: familyId,
      inviter_name: inviter.name,
      kids: kids || [],
    })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
