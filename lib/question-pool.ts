// 题目缓存池管理

import { supabaseAdmin } from "./supabase-server"
import { generateQuestions, type GeneratedQuestion } from "./question-generator"

interface CachedQuestion {
  id: string
  grade: number
  subject: string
  difficulty: number
  type: string
  content: Record<string, unknown>
  answer: Record<string, unknown>
  explanation: string | null
  knowledge_point: string | null
  used_count: number
}

/**
 * 从缓存池获取未使用的题目
 */
export async function getUnusedQuestions(
  grade: number,
  subject: string,
  difficulty: number,
  count: number
): Promise<CachedQuestion[]> {
  const { data, error } = await supabaseAdmin
    .from("question_cache")
    .select("*")
    .eq("grade", grade)
    .eq("subject", subject)
    .eq("difficulty", difficulty)
    .order("used_count", { ascending: true })
    .limit(count)

  if (error) {
    console.error("[QuestionPool] Failed to fetch questions:", error)
    return []
  }

  return data || []
}

/**
 * 获取指定知识点的题目（用于错题复习）
 */
export async function getQuestionsByTopic(
  grade: number,
  subject: string,
  knowledgePoint: string,
  count: number
): Promise<CachedQuestion[]> {
  const { data, error } = await supabaseAdmin
    .from("question_cache")
    .select("*")
    .eq("grade", grade)
    .eq("subject", subject)
    .eq("knowledge_point", knowledgePoint)
    .order("used_count", { ascending: true })
    .limit(count)

  if (error) {
    console.error("[QuestionPool] Failed to fetch questions by topic:", error)
    return []
  }

  return data || []
}

/**
 * 标记题目为已使用
 */
export async function markQuestionsAsUsed(questionIds: string[]): Promise<void> {
  if (questionIds.length === 0) return

  // 使用 RPC 来原子性地增加 used_count
  for (const id of questionIds) {
    await supabaseAdmin.rpc("increment_used_count", { question_id: id })
  }
}

/**
 * 保存生成的题目到缓存池
 */
export async function saveToCache(questions: GeneratedQuestion[]): Promise<string[]> {
  if (questions.length === 0) return []

  const records = questions.map((q) => ({
    grade: q.grade,
    subject: q.subject,
    difficulty: q.difficulty,
    type: q.type,
    content: q.content,
    answer: q.answer,
    explanation: q.explanation,
    knowledge_point: q.knowledge_point,
  }))

  const { data, error } = await supabaseAdmin
    .from("question_cache")
    .insert(records)
    .select("id")

  if (error) {
    console.error("[QuestionPool] Failed to save questions:", error)
    return []
  }

  return data.map((d) => d.id)
}

/**
 * 检查缓存池中某类题目的数量
 */
export async function getCacheCount(
  grade: number,
  subject: string,
  difficulty?: number
): Promise<number> {
  let query = supabaseAdmin
    .from("question_cache")
    .select("id", { count: "exact", head: true })
    .eq("grade", grade)
    .eq("subject", subject)

  if (difficulty !== undefined) {
    query = query.eq("difficulty", difficulty)
  }

  const { count, error } = await query

  if (error) {
    console.error("[QuestionPool] Failed to count questions:", error)
    return 0
  }

  return count || 0
}

/**
 * 获取或生成题目（核心逻辑）
 */
export async function getOrGenerateQuestions(
  grade: number,
  subject: "math" | "chinese" | "english",
  difficulty: number,
  count: number,
  excludeIds: string[] = []
): Promise<CachedQuestion[]> {
  const questions: CachedQuestion[] = []

  // 1. 先从缓存取（排除已使用的）
  let cached = await getUnusedQuestions(grade, subject, difficulty, count + excludeIds.length)

  // 排除已使用过的题目
  if (excludeIds.length > 0) {
    cached = cached.filter((q) => !excludeIds.includes(q.id))
  }

  questions.push(...cached.slice(0, count))

  // 2. 如果不够，生成补充
  if (questions.length < count) {
    const needed = count - questions.length
    console.log(`[QuestionPool] Cache insufficient, generating ${needed} questions...`)

    try {
      const generated = await generateQuestions(grade, subject, difficulty, needed)
      const savedIds = await saveToCache(generated)

      // 重新从数据库读取（确保格式一致）
      if (savedIds.length > 0) {
        const { data } = await supabaseAdmin
          .from("question_cache")
          .select("*")
          .in("id", savedIds)

        if (data) {
          questions.push(...data)
        }
      }
    } catch (error) {
      console.error("[QuestionPool] Failed to generate questions:", error)
    }
  }

  // 3. 打乱顺序
  return shuffleArray(questions)
}

/**
 * 打乱数组
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
