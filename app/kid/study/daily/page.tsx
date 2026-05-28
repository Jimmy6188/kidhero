"use client"

import { useState, useEffect } from "react"
import { Question } from "@/lib/types"
import QuestionCard from "@/components/kid/QuestionCard"
import CelebrationEffect from "@/components/kid/CelebrationEffect"
import { getActiveKidId } from "@/lib/session"

export default function DailyChallengePage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [monsterHP, setMonsterHP] = useState(150)
  const [gems, setGems] = useState<string[]>([])
  const [isFinished, setIsFinished] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [loading, setLoading] = useState(true)

  const gemPool = ["💎", "🔴", "🟢", "🟡", "🟣", "🔵"]

  const getKidId = () => getActiveKidId()

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/questions?kid_id=${getKidId()}&count=30`)
      const data = await res.json()
      setQuestions(data.questions || [])
    } catch {
      setQuestions([])
    }
    setLoading(false)
  }

  const handleAnswer = async (isCorrect: boolean) => {
    // Record answer
    if (questions[currentIndex]) {
      await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kid_id: getKidId(),
          question_id: questions[currentIndex].id,
          is_correct: isCorrect,
          mode: "daily",
        }),
      })
    }

    if (isCorrect) {
      setCorrectCount((c) => c + 1)
      setMonsterHP((hp) => Math.max(0, hp - 5))
      setGems((prev) => [
        ...prev,
        gemPool[Math.floor(Math.random() * gemPool.length)],
      ])
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      setIsFinished(true)
      if (correctCount >= questions.length * 0.6) {
        setShowCelebration(true)
      }

      // Award points based on performance
      const finalCorrect = correctCount + (isCorrect ? 1 : 0)
      const points = Math.round(finalCorrect * 2)
      if (points > 0) {
        await fetch("/api/points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kid_id: getKidId(),
            amount: points,
            reason: `日常闯关完成: 答对${finalCorrect}/${questions.length}题`,
          }),
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-5xl mb-4 animate-bounce">📚</div>
        <p className="text-gray-500">正在准备题目...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-gray-500">暂无题目</p>
        <p className="text-sm text-gray-400 mt-1">请家长在后台添加题库数据</p>
      </div>
    )
  }

  if (isFinished) {
    const finalCorrect = correctCount
    const points = Math.round(finalCorrect * 2)
    const percentage = Math.round((finalCorrect / questions.length) * 100)

    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-screen">
        {showCelebration && <CelebrationEffect />}

        <div className="text-6xl mb-4">
          {monsterHP <= 0 ? "🎉" : percentage >= 80 ? "🌟" : percentage >= 60 ? "💪" : "📖"}
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {monsterHP <= 0
            ? "怪物击败！"
            : percentage >= 80
              ? "太棒了！"
              : percentage >= 60
                ? "继续加油！"
                : "下次努力！"}
        </h1>

        <p className="text-gray-500 mb-4">
          答对 {finalCorrect}/{questions.length} 题 ({percentage}%)
        </p>

        {/* 宝石收集展示 */}
        <div className="flex gap-1 flex-wrap justify-center mb-4 max-w-xs">
          {gems.map((g, i) => (
            <span key={i} className="text-2xl">
              {g}
            </span>
          ))}
        </div>

        <div className="card text-center mb-6">
          <p className="text-sm text-gray-500">获得积分</p>
          <p className="text-3xl font-bold text-kid-orange">+{points}</p>
        </div>

        {/* 学科正确率 */}
        <div className="grid grid-cols-3 gap-3 mb-6 w-full max-w-sm">
          {["math", "chinese", "english"].map((subject) => {
            const subjectQs = questions.filter((q) => q.subject === subject)
            const subjectEmoji =
              subject === "math" ? "🧮" : subject === "chinese" ? "📖" : "🌍"
            return (
              <div key={subject} className="card text-center py-2">
                <div className="text-2xl mb-1">{subjectEmoji}</div>
                <p className="text-xs text-gray-500">{subjectQs.length} 题</p>
              </div>
            )
          })}
        </div>

        <button onClick={() => window.history.back()} className="btn-primary">
          返回首页
        </button>
      </div>
    )
  }

  return (
    <QuestionCard
      question={questions[currentIndex]}
      currentIndex={currentIndex}
      total={questions.length}
      onAnswer={handleAnswer}
      monsterHP={monsterHP}
      monsterMaxHP={150}
      gems={gems}
    />
  )
}
