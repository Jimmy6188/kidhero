// 定时补充题目缓存池 API
// 由 Vercel Cron Job 每天早上 6 点调用

import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { generateQuestions } from "@/lib/question-generator"
import { saveToCache } from "@/lib/question-pool"

// Vercel Cron Job 需要这个配置来验证请求
export const dynamic = "force-dynamic"

// 题目池配置
const POOL_CONFIG = {
  grades: [3, 4, 5, 6],
  subjects: ["math", "chinese", "english"] as const,
  difficulties: [3, 4, 5],
  targetPerCombo: 20,
  maxGeneratePerRun: 50, // 每次运行最多生成 50 道（避免超时）
}

interface ComboDeficit {
  grade: number
  subject: string
  difficulty: number
  needed: number
}

export async function GET(request: Request) {
  try {
    // 验证 Cron Secret（安全措施）
    const authHeader = request.headers.get("authorization")
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[RefillCache] Starting cache refill check...")

    // 1. 查询当前库存
    const { data, error } = await supabaseAdmin
      .from("question_cache")
      .select("grade, subject, difficulty")
      .in("grade", POOL_CONFIG.grades)
      .in("subject", POOL_CONFIG.subjects)
      .in("difficulty", POOL_CONFIG.difficulties)

    if (error) {
      throw new Error(`Failed to query cache: ${error.message}`)
    }

    // 2. 统计每个组合的数量
    const countMap = new Map<string, number>()
    data?.forEach((q) => {
      const key = `${q.grade}-${q.subject}-${q.difficulty}`
      countMap.set(key, (countMap.get(key) || 0) + 1)
    })

    // 3. 找出需要补充的组合
    const deficits: ComboDeficit[] = []
    for (const grade of POOL_CONFIG.grades) {
      for (const subject of POOL_CONFIG.subjects) {
        for (const difficulty of POOL_CONFIG.difficulties) {
          const key = `${grade}-${subject}-${difficulty}`
          const count = countMap.get(key) || 0
          const needed = POOL_CONFIG.targetPerCombo - count

          if (needed > 0) {
            deficits.push({ grade, subject, difficulty, needed })
          }
        }
      }
    }

    if (deficits.length === 0) {
      console.log("[RefillCache] All combinations are sufficient")
      return NextResponse.json({
        success: true,
        message: "All combinations are sufficient",
        generated: 0,
      })
    }

    console.log(`[RefillCache] Found ${deficits.length} combinations needing refill`)

    // 4. 按需求数量排序，优先补充缺口最大的
    deficits.sort((a, b) => b.needed - a.needed)

    // 5. 逐个生成补充（受时间限制）
    let totalGenerated = 0
    const results = []

    for (const deficit of deficits) {
      if (totalGenerated >= POOL_CONFIG.maxGeneratePerRun) {
        console.log("[RefillCache] Reached max generate limit, stopping")
        break
      }

      const generateCount = Math.min(
        deficit.needed,
        10, // 单次最多生成 10 道
        POOL_CONFIG.maxGeneratePerRun - totalGenerated
      )

      try {
        console.log(
          `[RefillCache] Generating ${generateCount} questions for ` +
          `grade=${deficit.grade}, subject=${deficit.subject}, difficulty=${deficit.difficulty}`
        )

        const questions = await generateQuestions(
          deficit.grade,
          deficit.subject as "math" | "chinese" | "english",
          deficit.difficulty,
          generateCount
        )

        const savedIds = await saveToCache(questions)
        totalGenerated += savedIds.length

        results.push({
          grade: deficit.grade,
          subject: deficit.subject,
          difficulty: deficit.difficulty,
          generated: savedIds.length,
          success: true,
        })
      } catch (error) {
        console.error(
          `[RefillCache] Failed to generate for grade=${deficit.grade}, subject=${deficit.subject}:`,
          error
        )
        results.push({
          grade: deficit.grade,
          subject: deficit.subject,
          difficulty: deficit.difficulty,
          generated: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    console.log(`[RefillCache] Completed. Total generated: ${totalGenerated}`)

    return NextResponse.json({
      success: true,
      message: `Generated ${totalGenerated} questions`,
      generated: totalGenerated,
      combinationsProcessed: results.length,
      results,
    })
  } catch (error) {
    console.error("[RefillCache] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to refill cache",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
