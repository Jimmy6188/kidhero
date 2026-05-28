"use client"

import { useState } from "react"
import { Question } from "@/lib/types"

interface QuestionCardProps {
  question: Question
  currentIndex: number
  total: number
  onAnswer: (isCorrect: boolean) => void
  monsterHP: number
  monsterMaxHP: number
  gems: string[]
}

export default function QuestionCard({
  question,
  currentIndex,
  total,
  onAnswer,
  monsterHP,
  monsterMaxHP,
  gems,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [fillInput, setFillInput] = useState("")

  const content = question.content as { stem?: string; options?: string[] }
  const answer = question.answer as { correct?: number | string; correct_order?: string[] }

  const handleSelect = (index: number) => {
    if (showResult) return
    setSelected(index)
    setShowResult(true)
    const isCorrect = index === (answer.correct as number)
    setTimeout(() => {
      onAnswer(isCorrect)
      setSelected(null)
      setShowResult(false)
    }, 1500)
  }

  const handleFillSubmit = () => {
    if (showResult) return
    setShowResult(true)
    const correctAnswer = answer.correct as string
    const isCorrect = fillInput.trim() === correctAnswer
    setSelected(isCorrect ? 0 : 1)
    setTimeout(() => {
      onAnswer(isCorrect)
      setSelected(null)
      setShowResult(false)
      setFillInput("")
    }, 1500)
  }

  const subjectEmoji = question.subject === "math" ? "🧮" : question.subject === "chinese" ? "📖" : "🌍"
  const subjectName = question.subject === "math" ? "数学" : question.subject === "chinese" ? "语文" : "英语"

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">👹</span>
          <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${(monsterHP / monsterMaxHP) * 100}%` }} />
          </div>
          <span className="text-xs text-gray-500">{monsterHP}/{monsterMaxHP}</span>
        </div>
        <div className="flex gap-0.5">
          {gems.slice(-5).map((g, i) => (<span key={i} className="text-lg">{g}</span>))}
        </div>
        <span className="text-sm text-gray-500">{currentIndex + 1}/{total}</span>
      </div>

      <div className="mb-3">
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
          {subjectEmoji} {subjectName} · 难度 {question.difficulty}
        </span>
      </div>

      <div className="card mb-4">
        <p className="text-lg font-medium text-gray-800">{content.stem || "题目加载中"}</p>
      </div>

      {question.type === "choice" && content.options && (
        <div className="space-y-3">
          {content.options.map((option, index) => {
            let bgClass = "bg-white border-2 border-gray-200"
            if (showResult && index === (answer.correct as number)) bgClass = "bg-green-100 border-2 border-green-500"
            else if (showResult && index === selected && index !== (answer.correct as number)) bgClass = "bg-red-100 border-2 border-red-500"

            return (
              <button key={index} onClick={() => handleSelect(index)} className={`w-full p-4 text-left rounded-2xl font-medium transition-all cursor-pointer ${bgClass}`}>
                <span className="inline-block w-8 h-8 rounded-full bg-gray-100 text-center leading-8 mr-3 text-sm font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </button>
            )
          })}
        </div>
      )}

      {question.type === "fill" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={fillInput}
              onChange={(e) => setFillInput(e.target.value)}
              placeholder="输入答案..."
              className="flex-1 p-4 border-2 border-gray-200 rounded-2xl text-lg focus:outline-none focus:border-blue-500"
              onKeyDown={(e) => { if (e.key === "Enter") handleFillSubmit() }}
            />
            <button onClick={handleFillSubmit} className="btn-primary px-6">确认</button>
          </div>
        </div>
      )}

      {showResult && (
        <div className="mt-4 p-4 bg-blue-50 rounded-2xl">
          <p className="text-sm text-blue-600">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}