// 提交答案 API

import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { recordError, recordCorrect } from "@/lib/error-review"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      kid_id,
      question_id,
      user_answer,
    } = body

    if (!kid_id || !question_id) {
      return NextResponse.json(
        { error: "kid_id and question_id are required" },
        { status: 400 }
      )
    }

    // 幂等性检查：是否已经提交过这道题的答案
    const { data: existingRecord } = await supabaseAdmin
      .from("study_records")
      .select("id, is_correct")
      .eq("kid_id", kid_id)
      .eq("question_id", question_id)
      .single()

    if (existingRecord) {
      // 已经提交过，返回之前的结果（不重复计分）
      const { data: question } = await supabaseAdmin
        .from("question_cache")
        .select("answer, explanation, knowledge_point")
        .eq("id", question_id)
        .single()

      return NextResponse.json({
        is_correct: existingRecord.is_correct,
        correct_answer: question?.answer,
        explanation: question?.explanation,
        points_earned: 0, // 重复提交不再给分
        knowledge_point: question?.knowledge_point,
        duplicate: true,
      })
    }

    // 获取题目信息
    const { data: question, error: questionError } = await supabaseAdmin
      .from("question_cache")
      .select("*")
      .eq("id", question_id)
      .single()

    if (questionError || !question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // 判断答案是否正确
    let isCorrect = false

    if (question.type === "choice") {
      // 选择题：比较选项索引
      isCorrect = user_answer === question.answer.correct
    } else if (question.type === "fill") {
      // 填空题：更宽松的比对逻辑
      const correctAnswer = String(question.answer.correct).trim().toLowerCase()
      const userAnswer = String(user_answer).trim().toLowerCase()

      // 1. 完全匹配
      if (correctAnswer === userAnswer) {
        isCorrect = true
      }
      // 2. 去除标点符号后匹配（处理中文逗号、顿号等分隔符）
      else {
        const cleanCorrect = correctAnswer.replace(/[，,、;；\s]/g, '')
        const cleanUser = userAnswer.replace(/[，,、;；\s]/g, '')
        isCorrect = cleanCorrect === cleanUser
      }

      // 3. 如果答案包含多个部分（用逗号/顿号分隔），尝试匹配任一部分
      if (!isCorrect && /[，,、]/.test(correctAnswer)) {
        const correctParts = correctAnswer.split(/[，,、]/).map(s => s.trim()).filter(Boolean)
        const userParts = userAnswer.split(/[，,、]/).map(s => s.trim()).filter(Boolean)
        // 如果用户只填了一个答案，检查是否匹配任一部分
        if (userParts.length === 1 && correctParts.includes(userParts[0])) {
          isCorrect = true
        }
        // 如果用户填了多个答案，检查是否全部包含
        else if (userParts.length > 1) {
          isCorrect = userParts.every(part => correctParts.includes(part))
        }
      }
    }

    // 记录学习结果（使用原始表结构）
    const { error: insertError } = await supabaseAdmin.from("study_records").insert({
      kid_id,
      question_id,
      is_correct: isCorrect,
      mode: "daily",
    })

    if (insertError) {
      console.error("[StudyAnswer] Insert error:", insertError)
      // 即使记录失败，也返回答案结果
    }

    // 处理错题记录
    if (!isCorrect && question.knowledge_point) {
      await recordError(kid_id, question.knowledge_point)
    } else if (isCorrect && question.knowledge_point) {
      await recordCorrect(kid_id, question.knowledge_point)
    }

    // 计算积分（答对 +10，答错 +2 参与分）
    const points = isCorrect ? 10 : 2

    // 更新积分（两个数据源都要更新）
    await Promise.all([
      // 更新 users.points 字段
      supabaseAdmin.rpc("update_kid_points", {
        kid_id,
        points_to_add: points,
      }),
      // 写入 points_log（首页从这里读取）
      supabaseAdmin.from("points_log").insert({
        kid_id,
        amount: points,
        reason: isCorrect ? "答题正确" : "答题参与",
      }),
    ])

    return NextResponse.json({
      is_correct: isCorrect,
      correct_answer: question.answer,
      explanation: question.explanation,
      points_earned: points,
      knowledge_point: question.knowledge_point,
    })
  } catch (error) {
    console.error("[StudyAnswer] Error:", error)
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 }
    )
  }
}