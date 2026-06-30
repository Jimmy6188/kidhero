// API 认证中间件

import { NextRequest } from "next/server"
import { supabaseAdmin } from "./supabase-server"

export interface AuthUser {
  id: string
  family_id: string
  role: "parent" | "kid"
}

/**
 * 从请求中获取当前用户
 * 支持两种方式：
 * 1. Authorization header (Bearer token)
 * 2. 查询参数 user_id（用于简单场景）
 */
export async function getCurrentUser(req: NextRequest): Promise<AuthUser | null> {
  // 尝试从 header 获取 token
  const authHeader = req.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7)
    // 这里可以扩展为 JWT 验证
    // 目前简单实现：token 就是 user_id
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, family_id, role")
      .eq("id", token)
      .single()

    return user as AuthUser | null
  }

  // 尝试从查询参数获取
  const url = new URL(req.url)
  const userId = url.searchParams.get("user_id") || url.searchParams.get("parent_id")
  if (userId) {
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, family_id, role")
      .eq("id", userId)
      .single()

    return user as AuthUser | null
  }

  return null
}

/**
 * 验证用户是否为指定孩子的家长
 */
export async function verifyParentOfKid(
  parentId: string,
  kidId: string
): Promise<boolean> {
  try {
    // 并行查询提高性能
    const [parentResult, kidResult] = await Promise.all([
      supabaseAdmin
        .from("users")
        .select("family_id, role")
        .eq("id", parentId)
        .single(),
      supabaseAdmin
        .from("users")
        .select("family_id")
        .eq("id", kidId)
        .single(),
    ])

    const parent = parentResult.data
    const kid = kidResult.data

    if (!parent || parent.role !== "parent" || !kid) {
      return false
    }

    // 验证是否在同一家庭
    return parent.family_id === kid.family_id
  } catch (error) {
    console.error("verifyParentOfKid error:", error)
    return false
  }
}

/**
 * 验证用户是否属于指定家庭
 */
export async function verifyFamilyMember(
  userId: string,
  familyId: string
): Promise<boolean> {
  try {
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("family_id")
      .eq("id", userId)
      .single()

    return user?.family_id === familyId
  } catch (error) {
    console.error("verifyFamilyMember error:", error)
    return false
  }
}