// 定时补充题目缓存池 API
// 由 Vercel Cron Job 每天早上 6 点调用
// 也支持前端手动触发并查询进度

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
  maxGeneratePerRun: 20, // 每次运行最多生成 20 道（避免超时）
  batchSize: 3, // 每次生成 3 道（避免 API 限流）
  delayBetweenBatches: 2000, // 批次间延迟 2 秒
}

interface ComboDeficit {
  grade: number
  subject: string
  difficulty: number
  needed: number
}

// 进度存储（内存中，生产环境可用 Redis）
interface RefillProgress {
  status: "idle" | "running" | "completed" | "error" | "stopped"
  total: number
  completed: number
  currentCombo: string
  totalGenerated: number
  results: Array<{
    grade: number
    subject: string
    difficulty: number
    generated: number
    success: boolean
    error?: string
  }>
  startedAt?: string
  completedAt?: string
}

// 全局进度状态和停止标志
let refillProgress: RefillProgress = {
  status: "idle",
  total: 0,
  completed: 0,
  currentCombo: "",
  totalGenerated: 0,
  results: [],
}
let shouldStop = false

// 获取当前进度
export async function GET() {
  return NextResponse.json(refillProgress)
}

// 停止补充
export async function DELETE() {
  console.log("[RefillCache] DELETE called, current status:", refillProgress.status)
  if (refillProgress.status === "running") {
    shouldStop = true
    console.log("[RefillCache] shouldStop set to true")
    refillProgress.currentCombo = "正在停止..."
    return NextResponse.json({ success: true, message: "Stop signal sent" })
  }
  return NextResponse.json({ success: false, message: "No task is running" })
}

// 异步执行补充任务
async function runRefillTask() {
  try {
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
      refillProgress = {
        ...refillProgress,
        status: "completed",
        currentCombo: "所有组合已充足",
        completedAt: new Date().toISOString(),
      }
      return
    }

    // 4. 按需求数量排序，优先补充缺口最大的
    deficits.sort((a, b) => b.needed - a.needed)

    // 更新进度总数
    refillProgress.total = deficits.length
    refillProgress.currentCombo = `发现 ${deficits.length} 个需要补充的组合`

    console.log(`[RefillCache] Found ${deficits.length} combinations needing refill`)

    // 学科名称映射
    const subjectNames: Record<string, string> = {
      math: "数学",
      chinese: "语文",
      english: "英语",
    }

    // 5. 逐个生成补充（受时间限制）
    let totalGenerated = 0

    for (const deficit of deficits) {
      // 检查停止信号
      if (shouldStop) {
        console.log("[RefillCache] Stop signal received, stopping...")
        refillProgress.status = "stopped"
        refillProgress.currentCombo = `已停止，已生成 ${totalGenerated} 道题目`
        refillProgress.completedAt = new Date().toISOString()
        return
      }

      if (totalGenerated >= POOL_CONFIG.maxGeneratePerRun) {
        console.log("[RefillCache] Reached max generate limit, stopping")
        break
      }

      const comboName = `${deficit.grade}年级${subjectNames[deficit.subject] || deficit.subject}`
      refillProgress.currentCombo = `正在生成: ${comboName} (${refillProgress.completed + 1}/${deficits.length})`

      const totalNeeded = Math.min(
        deficit.needed,
        POOL_CONFIG.maxGeneratePerRun - totalGenerated
      )

      try {
        console.log(
          `[RefillCache] Generating ${totalNeeded} questions for ` +
          `grade=${deficit.grade}, subject=${deficit.subject}, difficulty=${deficit.difficulty}`
        )

        // 分批生成，避免 API 限流
        let generatedForCombo = 0
        const batches = Math.ceil(totalNeeded / POOL_CONFIG.batchSize)

        for (let batch = 0; batch < batches; batch++) {
          // 检查停止信号
          if (shouldStop) {
            console.log("[RefillCache] Stop signal received during batch, stopping...")
            refillProgress.status = "stopped"
            refillProgress.currentCombo = `已停止，已生成 ${totalGenerated} 道题目`
            refillProgress.completedAt = new Date().toISOString()
            return
          }

          const batchCount = Math.min(POOL_CONFIG.batchSize, totalNeeded - generatedForCombo)
          console.log(`[RefillCache] Batch ${batch + 1}/${batches}: generating ${batchCount} questions`)

          const questions = await generateQuestions(
            deficit.grade,
            deficit.subject as "math" | "chinese" | "english",
            deficit.difficulty,
            batchCount
          )

          const savedIds = await saveToCache(questions)
          generatedForCombo += savedIds.length
          totalGenerated += savedIds.length

          // 更新进度
          refillProgress.totalGenerated = totalGenerated

          // 批次间延迟
          if (batch < batches - 1 && POOL_CONFIG.delayBetweenBatches > 0) {
            await new Promise(resolve => setTimeout(resolve, POOL_CONFIG.delayBetweenBatches))
          }
        }

        refillProgress.results.push({
          grade: deficit.grade,
          subject: deficit.subject,
          difficulty: deficit.difficulty,
          generated: generatedForCombo,
          success: true,
        })
      } catch (error) {
        console.error(
          `[RefillCache] Failed to generate for grade=${deficit.grade}, subject=${deficit.subject}:`,
          error
        )
        refillProgress.results.push({
          grade: deficit.grade,
          subject: deficit.subject,
          difficulty: deficit.difficulty,
          generated: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }

      // 更新进度
      refillProgress.completed++
      refillProgress.totalGenerated = totalGenerated
    }

    console.log(`[RefillCache] Completed. Total generated: ${totalGenerated}`)

    // 完成
    refillProgress.status = "completed"
    refillProgress.currentCombo = `完成！共生成 ${totalGenerated} 道题目`
    refillProgress.completedAt = new Date().toISOString()
  } catch (error) {
    console.error("[RefillCache] Error:", error)

    refillProgress.status = "error"
    refillProgress.currentCombo = `错误: ${error instanceof Error ? error.message : "Unknown error"}`
    refillProgress.completedAt = new Date().toISOString()
  }
}

// 开始补充（异步）
export async function POST() {
  // 如果已经在运行中，返回当前进度
  if (refillProgress.status === "running") {
    return NextResponse.json({
      success: false,
      message: "Refill already in progress",
      progress: refillProgress,
    })
  }

  // 重置状态
  shouldStop = false
  refillProgress = {
    status: "running",
    total: 0,
    completed: 0,
    currentCombo: "正在启动...",
    totalGenerated: 0,
    results: [],
    startedAt: new Date().toISOString(),
  }

  // 异步启动任务（不等待完成）
  runRefillTask().catch((err) => {
    console.error("[RefillCache] Unexpected error:", err)
    refillProgress.status = "error"
    refillProgress.currentCombo = `意外错误: ${err.message}`
  })

  // 立即返回
  return NextResponse.json({
    success: true,
    message: "Refill task started",
  })
}