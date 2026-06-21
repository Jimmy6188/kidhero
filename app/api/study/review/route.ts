// 家长审核答题记录 API

import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

// 获取最近的答题记录
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const kidId = searchParams.get("kid_id")
    const limit = parseInt(searchParams.get("limit") || "50")

    if (!kidId) {
      return NextResponse.json({ error: "kid_id is required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("study_records")
      .select(`
        id,
        is_correct,
        answered_at,
        question_cache (
          id,
          subject,
          type,
          content,
          answer,
          explanation,
          knowledge_point
        )
      `)
      .eq("kid_id", kidId)
      .order("answered_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[StudyReview] Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ records: data || [] })
  } catch (error) {
    console.error("[StudyReview] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    )
  }
}

// 修改答题结果（错判补偿）
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { record_id, is_correct, kid_id, knowledge_point } = body

    if (!record_id || is_correct === undefined) {
      return NextResponse.json(
        { error: "record_id and is_correct are required" },
        { status: 400 }
      )
    }

    // 更新答题记录
    const { error } = await supabaseAdmin
      .from("study_records")
      .update({ is_correct })
      .eq("id", record_id)

    if (error) {
      console.error("[StudyReview] Update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 如果改为正确，更新错题记录
    if (is_correct && kid_id && knowledge_point) {
      // 检查是否还有同知识点的错题
      const { count } = await supabaseAdmin
        .from("study_records")
        .select("id", { count: "exact", head: true })
        .eq("kid_id", kid_id)
        .eq("is_correct", false)
        .eq("knowledge_point", knowledge_point)

      // 如果没有同知识点的错题了，标记为已掌握
      if (count === 0) {
        await supabaseAdmin
          .from("error_records")
          .update({ is_mastered: true })
          .eq("kid_id", kid_id)
          .eq("knowledge_point", knowledge_point)
      }
    }

    // 如果改为错误，添加错题记录
    if (!is_correct && kid_id && knowledge_point) {
      const { data: existing } = await supabaseAdmin
        .from("error_records")
        .select("id, wrong_count")
        .eq("kid_id", kid_id)
        .eq("knowledge_point", knowledge_point)
        .single()

      if (existing) {
        // 更新错误次数
        await supabaseAdmin
          .from("error_records")
          .update({
            wrong_count: existing.wrong_count + 1,
            is_mastered: false,
          })
          .eq("id", existing.id)
      } else {
        // 创建新记录
        await supabaseAdmin.from("error_records").insert({
          kid_id,
          knowledge_point,
          wrong_count: 1,
          next_review_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[StudyReview] Error:", error)
    return NextResponse.json(
      { error: "Failed to update record" },
      { status: 500 }
    )
  }
}
