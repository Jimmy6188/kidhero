// 开始学习会话 API

import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { getOrGenerateQuestions } from "@/lib/question-pool"
import { getReviewTopics } from "@/lib/error-review"
import { calculateDifficulty } from "@/lib/difficulty-adapter"
import { randomUUID } from "crypto"

// 设置最大执行时间
export const maxDuration = 300 // 5 分钟（Hobby 计划最大值）

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { kid_id, subject, mode = "daily" } = body

    if (!kid_id) {
      return NextResponse.json({ error: "kid_id is required" }, { status: 400 })
    }

    // 获取孩子的年级
    const { data: kid, error: kidError } = await supabaseAdmin
      .from("users")
      .select("grade")
      .eq("id", kid_id)
      .single()

    if (kidError || !kid) {
      return NextResponse.json({ error: "Kid not found" }, { status: 404 })
    }

    const grade = kid.grade || 3
    const sessionId = randomUUID()

    // 根据模式决定题目来源
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let questions: any[] = []

    if (mode === "review") {
      // 错题复习模式：获取待复习的知识点
      const reviewTopics = await getReviewTopics(kid_id, 3)

      if (reviewTopics.length > 0) {
        // 按知识点获取题目
        for (const topic of reviewTopics) {
          const { data } = await supabaseAdmin
            .from("question_cache")
            .select("*")
            .eq("grade", grade)
            .eq("subject", subject || "math")
            .eq("knowledge_point", topic)
            .limit(2)

          if (data) {
            questions.push(...data)
          }
        }
      }

      // 如果复习题不够，补充新题
      if (questions.length < 5) {
        const needed = 5 - questions.length
        const newQuestions = await getOrGenerateQuestions(
          grade,
          subject || "math",
          2, // 复习时用较低难度
          needed,
          questions.map((q) => String(q.id))
        )
        questions.push(...newQuestions)
      }
    } else {
      // 获取难度设置
      const { data: settings } = await supabaseAdmin
        .from("users")
        .select("difficulty_mode, fixed_difficulty")
        .eq("id", kid_id)
        .single()

      let baseDifficulty: number
      if (settings?.difficulty_mode === "manual" && settings?.fixed_difficulty) {
        // 手动模式：使用固定难度
        baseDifficulty = settings.fixed_difficulty
      } else {
        // 自动模式：根据答题表现计算
        baseDifficulty = await calculateDifficulty(kid_id, subject || "math")
      }

      // 挑战模式难度更高：基础难度 + 2，最高 5
      const difficulty = mode === "challenge"
        ? Math.min(5, baseDifficulty + 2)
        : baseDifficulty
      const count = mode === "challenge" ? 15 : 10

      // 优先从缓存获取（快速路径）
      const { data: cached } = await supabaseAdmin
        .from("question_cache")
        .select("*")
        .eq("grade", grade)
        .eq("subject", subject || "math")
        .eq("difficulty", difficulty)
        .order("used_count", { ascending: true })
        .limit(count)

      if (cached && cached.length >= count) {
        // 缓存充足，直接使用（秒出题）
        console.log(`[StudyStart] Cache hit: ${cached.length} questions for ${subject} grade ${grade} difficulty ${difficulty}`)
        questions = cached
      } else {
        // 缓存不足，使用 getOrGenerateQuestions 作为兜底
        console.log(`[StudyStart] Cache insufficient (${cached?.length || 0}/${count}), falling back to generate`)
        questions = await getOrGenerateQuestions(
          grade,
          subject || "math",
          difficulty,
          count,
          cached?.map(q => String(q.id)) || []
        )
      }
    }

    // 标记题目为已使用
    const questionIds = questions.map((q) => q.id)
    for (const id of questionIds) {
      await supabaseAdmin.rpc("increment_used_count", { question_id: id })
    }

    // 返回题目（隐藏答案）
    const safeQuestions = questions.map((q) => ({
      id: q.id,
      type: q.type,
      content: q.content,
      knowledge_point: q.knowledge_point,
      difficulty: q.difficulty,
    }))

    return NextResponse.json({
      session_id: sessionId,
      questions: safeQuestions,
      total: safeQuestions.length,
      mode,
      subject: subject || "math",
    })
  } catch (error) {
    console.error("[StudyStart] Error:", error)
    return NextResponse.json(
      { error: "Failed to start study session" },
      { status: 500 }
    )
  }
}