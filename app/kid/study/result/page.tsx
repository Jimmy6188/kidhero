"use client"

import { useRouter, useSearchParams } from "next/navigation"

export default function StudyResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const correct = parseInt(searchParams.get("correct") || "0")
  const total = parseInt(searchParams.get("total") || "0")
  const points = parseInt(searchParams.get("points") || "0")
  const subject = searchParams.get("subject") || "math"
  const mode = searchParams.get("mode") || "daily"

  const correctRate = total > 0 ? Math.round((correct / total) * 100) : 0

  // 根据正确率显示不同的评价
  const getGrade = () => {
    if (correctRate >= 90) return { emoji: "🏆", text: "太棒了！", color: "text-yellow-500" }
    if (correctRate >= 70) return { emoji: "👍", text: "做得不错！", color: "text-green-500" }
    if (correctRate >= 50) return { emoji: "💪", text: "继续加油！", color: "text-blue-500" }
    return { emoji: "📚", text: "需要多练习哦", color: "text-orange-500" }
  }

  const grade = getGrade()

  const subjectNames: Record<string, string> = {
    math: "数学",
    chinese: "语文",
    english: "英语",
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      {/* 评价 */}
      <div className="text-7xl mb-4">{grade.emoji}</div>
      <h1 className={`text-2xl font-bold mb-2 ${grade.color}`}>{grade.text}</h1>
      <p className="text-gray-500 mb-8">
        {subjectNames[subject]} · {mode === "review" ? "错题复习" : "每日挑战"}
      </p>

      {/* 成绩卡片 */}
      <div className="card w-full max-w-sm mb-8">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-green-500">{correct}</div>
            <div className="text-xs text-gray-500">答对</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-500">{correctRate}%</div>
            <div className="text-xs text-gray-500">正确率</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-500">+{points}</div>
            <div className="text-xs text-gray-500">积分</div>
          </div>
        </div>
      </div>

      {/* 鼓励语 */}
      <p className="text-gray-600 text-center mb-12 max-w-xs">
        {correctRate >= 90
          ? "你已经掌握了这些知识，可以尝试更高难度的挑战！"
          : correctRate >= 70
          ? "大部分都答对了，错题会自动加入复习计划哦。"
          : "别灰心，错题会帮你找到薄弱点，多练习就会进步！"}
      </p>

      {/* 操作按钮 */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => {
            const params = new URLSearchParams({ mode, subject })
            router.push(`/kid/study/play?${params.toString()}`)
          }}
          className="w-full py-4 bg-blue-500 text-white font-bold rounded-2xl shadow-lg cursor-pointer"
        >
          再来一轮
        </button>

        <button
          onClick={() => router.push("/kid/study")}
          className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl cursor-pointer"
        >
          返回学习中心
        </button>

        <button
          onClick={() => router.push("/kid/home")}
          className="w-full py-4 text-gray-500 cursor-pointer"
        >
          回到首页
        </button>
      </div>
    </div>
  )
}
