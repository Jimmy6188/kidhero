"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import StreakCounter from "@/components/kid/StreakCounter"
import PointsDisplay from "@/components/kid/PointsDisplay"
import { getActiveKidId, getKidSession } from "@/lib/session"
import { getAdaptiveDifficulty } from "@/lib/difficulty"

export default function KidHomePage() {
  const [streak, setStreak] = useState({ current: 0, best: 0 })
  const [points, setPoints] = useState(0)
  const [penalty, setPenalty] = useState<{ missed: number; deducted: number; tasks: { name: string; icon: string }[] } | null>(null)
  const [kidName, setKidName] = useState("小超人")

  useEffect(() => {
    const session = getKidSession()
    if (session?.name) setKidName(session.name)
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const kidId = getActiveKidId()
      if (!kidId) return

      // Daily settlement
      try {
        const settleRes = await fetch("/api/daily-settlement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kid_id: kidId }),
        })
        const settleData = await settleRes.json()
        if (settleData.settled && settleData.missed > 0) {
          setPenalty(settleData)
        }
      } catch {
        // noop
      }

      const [pointsRes, streakRes] = await Promise.all([
        fetch(`/api/points?kid_id=${kidId}`),
        fetch(`/api/streak?kid_id=${kidId}`),
      ])

      const pointsData = await pointsRes.json()
      setPoints(pointsData.total_points || 0)

      const streakData = await streakRes.json()
      if (streakData.streak) {
        setStreak({
          current: streakData.streak.current_streak,
          best: streakData.streak.best_streak,
        })
      }
    } catch {
      // noop
    }
  }

  return (
    <div className="p-4 pb-24">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">你好，{kidName} 🦸</h1>
        <p className="text-gray-500 text-sm">今天也要加油哦！</p>
      </header>

      {/* Penalty notification */}
      {penalty && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">😢</span>
            <h3 className="font-bold text-red-700">昨天有任务没完成哦</h3>
          </div>
          <p className="text-red-600 text-sm mb-2">
            未完成 {penalty.missed} 项，扣除 {penalty.deducted} 积分
          </p>
          <div className="flex flex-wrap gap-2">
            {penalty.tasks.map((t, i) => (
              <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                {t.icon} {t.name}
              </span>
            ))}
          </div>
          <p className="text-red-500 text-xs mt-2">今天要全部完成哦！</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <StreakCounter currentStreak={streak.current} bestStreak={streak.best} />
        <PointsDisplay totalPoints={points} />
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-bold text-gray-700 mb-3">快捷入口</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/kid/tasks" className="card flex flex-col items-center py-5 hover:shadow-md transition-shadow">
          <span className="text-3xl mb-2">📋</span>
          <span className="font-bold text-gray-700 text-sm">每日任务</span>
          <span className="text-xs text-gray-400 mt-1">打卡赚积分</span>
        </Link>

        <Link href="/kid/study" className="card flex flex-col items-center py-5 hover:shadow-md transition-shadow">
          <span className="text-3xl mb-2">📚</span>
          <span className="font-bold text-gray-700 text-sm">学习闯关</span>
          <span className="text-xs text-gray-400 mt-1">每科 10 题</span>
        </Link>

        <Link href="/kid/map" className="card flex flex-col items-center py-5 hover:shadow-md transition-shadow">
          <span className="text-3xl mb-2">🗺️</span>
          <span className="font-bold text-gray-700 text-sm">冒险地图</span>
          <span className="text-xs text-gray-400 mt-1">探索新世界</span>
        </Link>

        <Link href="/kid/badges" className="card flex flex-col items-center py-5 hover:shadow-md transition-shadow">
          <span className="text-3xl mb-2">🏅</span>
          <span className="font-bold text-gray-700 text-sm">勋章墙</span>
          <span className="text-xs text-gray-400 mt-1">收集成就</span>
        </Link>
      </div>
    </div>
  )
}
