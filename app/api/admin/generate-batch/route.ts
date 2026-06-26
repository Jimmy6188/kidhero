// 批量生成题目 API

import { NextRequest, NextResponse } from "next/server"
import { generateQuestions } from "@/lib/question-generator"
import { saveToCache } from "@/lib/question-pool"

// Vercel Hobby 计划最大执行时间 60 秒
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { grade, subject, difficulty, count = 10 } = body

    // 参数验证
    if (!grade || !subject || !difficulty) {
      return NextResponse.json(
        { error: "grade, subject, difficulty are required" },
        { status: 400 }
      )
    }

    if (![3, 4, 5, 6].includes(grade)) {
      return NextResponse.json(
        { error: "grade must be 3, 4, 5, or 6" },
        { status: 400 }
      )
    }

    if (!["math", "chinese", "english"].includes(subject)) {
      return NextResponse.json(
        { error: "subject must be math, chinese, or english" },
        { status: 400 }
      )
    }

    if (![3, 4, 5].includes(difficulty)) {
      return NextResponse.json(
        { error: "difficulty must be 3, 4, or 5" },
        { status: 400 }
      )
    }

    // 限制单次生成数量，避免超时
    const actualCount = Math.min(count, 10)

    console.log(
      `[GenerateBatch] Generating ${actualCount} questions: grade=${grade}, subject=${subject}, difficulty=${difficulty}`
    )

    // 调用 LLM 生成题目
    const questions = await generateQuestions(grade, subject, difficulty, actualCount)

    // 保存到缓存池
    const savedIds = await saveToCache(questions)

    return NextResponse.json({
      success: true,
      generated: questions.length,
      saved: savedIds.length,
      details: {
        grade,
        subject,
        difficulty,
        count: actualCount,
      },
    })
  } catch (error) {
    console.error("[GenerateBatch] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate questions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
