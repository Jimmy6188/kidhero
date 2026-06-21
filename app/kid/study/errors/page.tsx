"use client"

import { useState, useEffect } from "react"
import { getActiveKidId } from "@/lib/session"
import BackButton from "@/components/shared/BackButton"
import { ArrowRight } from "@phosphor-icons/react"

interface ErrorEntry {
  id: string
  question_id: string
  wrong_count: number
  questions?: {
    id: string
    subject: string
    content: { stem?: string; options?: string[] }
    answer: { correct?: number | string }
    explanation: string
  }
}

export default function ErrorBookPage() {
  const [errors, setErrors] = useState<ErrorEntry[]>([])
  const [reviewing, setReviewing] = useState<ErrorEntry | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const getKidId = () => getActiveKidId()

  useEffect(() => {
    loadErrors()
  }, [])

  const loadErrors = async () => {
    setLoading(true)
    const res = await fetch(`/api/study/errors?kid_id=${getKidId()}`)
    const data = await res.json()
    setErrors(data.errors || [])
    setLoading(false)
  }

  const handleAnswer = async (index: number) => {
    if (showResult || !reviewing) return
    setSelected(index)
    setShowResult(true)
    const isCorrect = index === (reviewing.questions?.answer.correct as number)

    setTimeout(async () => {
      await fetch("/api/study/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kid_id: getKidId(),
          question_id: reviewing.question_id,
          is_correct: isCorrect,
        }),
      })

      if (isCorrect) {
        setErrors((prev) => prev.filter((e) => e.id !== reviewing.id))
      }

      setReviewing(null)
      setShowResult(false)
      setSelected(null)
    }, 1500)
  }

  const subjectEmoji = (s: string) =>
    s === "math" ? "🧮" : s === "chinese" ? "📖" : "🌍"
  const subjectName = (s: string) =>
    s === "math" ? "数学" : s === "chinese" ? "语文" : "英语"

  if (reviewing) {
    const q = reviewing.questions
    if (!q) return null

    return (
      <div className="p-4">
        <BackButton label="返回纠错本" onClick={() => { setReviewing(null); setShowResult(false) }} />

        <div className="mb-3">
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
            {subjectEmoji(q.subject)} {subjectName(q.subject)}
          </span>
        </div>

        <div className="card mb-4">
          <p className="text-lg font-medium text-gray-800">{q.content.stem}</p>
        </div>

        {q.content.options && (
          <div className="space-y-3">
            {q.content.options.map((option, index) => {
              let bgClass = "bg-white border-2 border-gray-200"
              if (showResult && index === (q.answer.correct as number))
                bgClass = "bg-green-100 border-2 border-green-500"
              else if (showResult && index === selected && index !== (q.answer.correct as number))
                bgClass = "bg-red-100 border-2 border-red-500"

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full p-4 text-left rounded-2xl font-medium transition-all cursor-pointer ${bgClass}`}
                >
                  <span className="inline-block w-8 h-8 rounded-full bg-gray-100 text-center leading-8 mr-3 text-sm font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              )
            })}
          </div>
        )}

        {showResult && (
          <div className="mt-4 p-4 bg-blue-50 rounded-2xl">
            <p className="text-sm text-blue-600">{q.explanation}</p>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-400 py-12">加载中...</div>
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-2">📖 纠错本</h1>
      <p className="text-sm text-gray-500 mb-4">
        {errors.length > 0
          ? `还有 ${errors.length} 道错题待复习`
          : "没有错题，太棒了！"}
      </p>

      {errors.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🎉</div>
          <p className="text-gray-400">所有错题都已掌握！</p>
          <p className="text-sm text-gray-400 mt-1">继续加油，保持满分！</p>
        </div>
      ) : (
        <div className="space-y-3">
          {errors.map((entry) => (
            <div key={entry.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">
                    {entry.questions
                      ? `${subjectEmoji(entry.questions.subject)} ${subjectName(entry.questions.subject)}`
                      : "题目"}
                  </p>
                  <p className="font-medium text-gray-800 mt-1">
                    {entry.questions?.content?.stem || "题目内容"}
                  </p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-xs text-red-400">错了 {entry.wrong_count} 次</p>
                  <button
                    onClick={() => setReviewing(entry)}
                    className="flex items-center gap-1 text-sm text-blue-500 font-medium mt-1 cursor-pointer"
                  >
                    重新做 <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
