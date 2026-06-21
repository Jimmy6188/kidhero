"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getKidSession } from "@/lib/session"
import { CaretRight } from "@phosphor-icons/react"

interface StudyStats {
  error_stats: {
    total: number
    mastered: number
    pending: number
    overdue: number
  }
  current_difficulty: number
  difficulty_label: string
  today: {
    total: number
    correct: number
    correct_rate: number
  }
}

export default function StudyPage() {
  const router = useRouter()
  const [stats, setStats] = useState<StudyStats | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      const kid = getKidSession()
      if (!kid?.id) return

      try {
        const res = await fetch(`/api/study/stats?kid_id=${kid.id}`)
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to load study stats:", error)
      }
    }

    loadStats()
  }, [])

  const startStudy = (mode: string, subject?: string) => {
    const kid = getKidSession()
    if (!kid?.id) {
      router.push("/kid")
      return
    }

    // 跳转到答题页面，带上参数
    const params = new URLSearchParams({
      mode,
      subject: subject || "math",
    })
    router.push(`/kid/study/play?${params.toString()}`)
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-4">📚 学习中心</h1>

      {/* 今日统计 */}
      {stats && (
        <div className="card mb-6">
          <h3 className="font-bold text-gray-700 mb-3">📊 今日学习</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {stats.today.total}
              </div>
              <div className="text-xs text-gray-500">已做题数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">
                {stats.today.correct_rate}%
              </div>
              <div className="text-xs text-gray-500">正确率</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">
                {stats.current_difficulty}
              </div>
              <div className="text-xs text-gray-500">当前难度</div>
            </div>
          </div>
        </div>
      )}

      {/* 错题待复习提示 */}
      {stats && stats.error_stats.overdue > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-yellow-800">
                有 {stats.error_stats.overdue} 个知识点需要复习
              </p>
              <p className="text-sm text-yellow-600">
                及时复习可以记得更牢哦！
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 学习模式 */}
      <div className="space-y-4">
        {/* 选择科目 */}
        <h2 className="font-bold text-gray-700">🎯 开始学习</h2>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => startStudy("daily", "math")}
            className="card hover:shadow-lg transition-shadow text-center cursor-pointer"
          >
            <div className="text-3xl mb-2">🔢</div>
            <div className="font-bold text-gray-800">数学</div>
            <div className="text-xs text-gray-500">10 题</div>
          </button>

          <button
            onClick={() => startStudy("daily", "chinese")}
            className="card hover:shadow-lg transition-shadow text-center cursor-pointer"
          >
            <div className="text-3xl mb-2">📖</div>
            <div className="font-bold text-gray-800">语文</div>
            <div className="text-xs text-gray-500">10 题</div>
          </button>

          <button
            onClick={() => startStudy("daily", "english")}
            className="card hover:shadow-lg transition-shadow text-center cursor-pointer"
          >
            <div className="text-3xl mb-2">🅰️</div>
            <div className="font-bold text-gray-800">英语</div>
            <div className="text-xs text-gray-500">10 题</div>
          </button>
        </div>

        {/* 特殊模式 */}
        <h2 className="font-bold text-gray-700 mt-6">🎮 更多模式</h2>

        <button
          onClick={() => startStudy("review")}
          className="card block w-full hover:shadow-lg transition-shadow text-left cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">📖</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">错题复习</h3>
              <p className="text-sm text-gray-500">
                {stats
                  ? `待复习 ${stats.error_stats.pending} 个知识点`
                  : "复习错题，巩固知识"}
              </p>
            </div>
            <CaretRight size={16} className="text-gray-400" />
          </div>
        </button>

        <button
          onClick={() => startStudy("challenge")}
          className="card block w-full hover:shadow-lg transition-shadow text-left cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">🏆</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">挑战模式</h3>
              <p className="text-sm text-gray-500">15 题高难度挑战</p>
            </div>
            <CaretRight size={16} className="text-gray-400" />
          </div>
        </button>
      </div>
    </div>
  )
}
