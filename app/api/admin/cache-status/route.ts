// 题目缓存池状态 API

import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

// 题目池配置
const POOL_CONFIG = {
  grades: [3, 4, 5, 6],
  subjects: ["math", "chinese", "english"] as const,
  difficulties: [3, 4, 5],
  targetPerCombo: 20,
}

interface CacheStatus {
  grade: number
  subject: string
  difficulty: number
  count: number
  target: number
  needed: number
  status: "sufficient" | "low" | "empty"
}

export async function GET() {
  try {
    // 查询所有组合的库存
    const { data, error } = await supabaseAdmin
      .from("question_cache")
      .select("grade, subject, difficulty")
      .in("grade", POOL_CONFIG.grades)
      .in("subject", POOL_CONFIG.subjects)
      .in("difficulty", POOL_CONFIG.difficulties)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 统计每个组合的数量
    const countMap = new Map<string, number>()
    data?.forEach((q) => {
      const key = `${q.grade}-${q.subject}-${q.difficulty}`
      countMap.set(key, (countMap.get(key) || 0) + 1)
    })

    // 生成状态报告
    const statuses: CacheStatus[] = []
    let totalNeeded = 0

    for (const grade of POOL_CONFIG.grades) {
      for (const subject of POOL_CONFIG.subjects) {
        for (const difficulty of POOL_CONFIG.difficulties) {
          const key = `${grade}-${subject}-${difficulty}`
          const count = countMap.get(key) || 0
          const needed = Math.max(0, POOL_CONFIG.targetPerCombo - count)
          totalNeeded += needed

          statuses.push({
            grade,
            subject,
            difficulty,
            count,
            target: POOL_CONFIG.targetPerCombo,
            needed,
            status: count >= POOL_CONFIG.targetPerCombo
              ? "sufficient"
              : count === 0
                ? "empty"
                : "low",
          })
        }
      }
    }

    // 汇总统计
    const summary = {
      totalCombinations: statuses.length,
      sufficient: statuses.filter((s) => s.status === "sufficient").length,
      low: statuses.filter((s) => s.status === "low").length,
      empty: statuses.filter((s) => s.status === "empty").length,
      totalQuestions: statuses.reduce((sum, s) => sum + s.count, 0),
      totalNeeded,
      targetTotal: statuses.length * POOL_CONFIG.targetPerCombo,
    }

    return NextResponse.json({ summary, details: statuses })
  } catch (error) {
    console.error("[CacheStatus] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch cache status" },
      { status: 500 }
    )
  }
}
