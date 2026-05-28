"use client"

import { useState, useEffect } from "react"
import { Question } from "@/lib/types"
import QuestionCard from "@/components/kid/QuestionCard"
import CelebrationEffect from "@/components/kid/CelebrationEffect"
import { getActiveKidId } from "@/lib/session"

export default function ChallengePage() {
  const [isWeekend, setIsWeekend] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [monsterHP, setMonsterHP] = useState(100)
  const [gems, setGems] = useState<string[]>([])
  const [stage, setStage] = useState(1)
  const [showCelebration, setShowCelebration] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  const gemPool = ["💎", "🔴", "🟢", "🟡", "🟣", "🔵"]

  const getKidId = () => getActiveKidId()

  useEffect(() => {
    const day = new Date().getDay()
    setIsWeekend(day === 0 || day === 6)

    // Check if already completed this week
    const lastChallenge = localStorage.getItem("last_challenge_week")
    const currentWeek = getWeekNumber(new Date())
    if (lastChallenge === String(currentWeek)) {
      setHasCompleted(true)
    }
  }, [])

  const getWeekNumber = (d: Date) => {
    const oneJan = new Date(d.getFullYear(), 0, 1)
    return Math.ceil(
      ((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7
    )
  }

  const startChallenge = async () => {
    setIsPlaying(true)
    setStage(1)
    setMonsterHP(100)
    await loadStageQuestions(1)
  }

  const loadStageQuestions = async (s: number) => {
    const res = await fetch(`/api/questions?kid_id=${getKidId()}&count=5&difficulty=${s + 1}`)
    const data = await res.json()
    setQuestions(data.questions || [])
    setCurrentIndex(0)
  }

  const handleAnswer = async (isCorrect: boolean) => {
    if (questions[currentIndex]) {
      await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kid_id: getKidId(),
          question_id: questions[currentIndex].id,
          is_correct: isCorrect,
          mode: "challenge",
        }),
      })
    }

    if (isCorrect) {
      setCorrectCount((c) => c + 1)
      setMonsterHP((hp) => Math.max(0, hp - 20))
      setGems((prev) => [...prev, gemPool[Math.floor(Math.random() * gemPool.length)]])
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      // Stage complete
      if (stage < 3) {
        setStage((s) => s + 1)
        setMonsterHP(100)
        await loadStageQuestions(stage + 1)
      } else {
        // All stages complete
        setIsFinished(true)
        setShowCelebration(true)

        const totalPoints = correctCount * 3 + 30
        await fetch("/api/points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kid_id: getKidId(),
            amount: totalPoints,
            reason: `周末挑战赛完成: ${correctCount}题正确`,
          }),
        })

        localStorage.setItem("last_challenge_week", String(getWeekNumber(new Date())))
        setHasCompleted(true)
      }
    }
  }

  if (!isWeekend) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">周末挑战赛</h1>
        <p className="text-gray-500 text-center">
          挑战赛只在周末开放<br />
          周六 10:00 - 周日 20:00
        </p>
        <div className="mt-4 card">
          <p className="text-sm text-gray-400">下周六见！🎯</p>
        </div>
      </div>
    )
  }

  if (isFinished) {
    const totalPoints = correctCount * 3 + 30
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-screen">
        {showCelebration && <CelebrationEffect />}
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">挑战赛完成！</h1>
        <p className="text-gray-500 mb-4">答对 {correctCount} 题</p>

        <div className="flex gap-1 flex-wrap justify-center mb-4 max-w-xs">
          {gems.map((g, i) => (<span key={i} className="text-2xl">{g}</span>))}
        </div>

        <div className="card text-center mb-6">
          <p className="text-sm text-gray-500">获得积分</p>
          <p className="text-3xl font-bold text-kid-orange">+{totalPoints}</p>
          <p className="text-xs text-gray-400 mt-1">含 30 分挑战奖励</p>
        </div>

        <button onClick={() => window.history.back()} className="btn-primary">
          返回首页
        </button>
      </div>
    )
  }

  if (isPlaying && questions.length > 0) {
    return (
      <div>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 text-white text-center">
          <p className="font-bold">⚔️ 第 {stage}/3 关</p>
        </div>
        <QuestionCard
          question={questions[currentIndex]}
          currentIndex={currentIndex}
          total={questions.length}
          onAnswer={handleAnswer}
          monsterHP={monsterHP}
          monsterMaxHP={100}
          gems={gems}
        />
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold">⚔️ 周末挑战赛</h1>
        <p className="text-white/80 mt-1">难度递增 · 额外勋章 · 限时挑战</p>
      </div>

      {hasCompleted ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🏆</div>
          <p className="text-lg font-bold text-gray-800">本周挑战已完成！</p>
          <p className="text-gray-500">下周六再来挑战吧</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold text-gray-700 mb-2">挑战规则</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 共 3 关，难度逐渐递增</li>
              <li>• 每关 5 题，答对扣怪物血量</li>
              <li>• 完成全部关卡获得 +30 额外积分</li>
              <li>• 收集宝石解锁成就</li>
            </ul>
          </div>

          <button onClick={startChallenge} className="btn-primary w-full text-center text-lg">
            🚀 开始挑战
          </button>
        </div>
      )}
    </div>
  )
}
