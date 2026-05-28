"use client"

import { useState, useEffect } from "react"
import StreakCounter from "@/components/kid/StreakCounter"
import PointsDisplay from "@/components/kid/PointsDisplay"
import TaskCard from "@/components/kid/TaskCard"
import { Task } from "@/lib/types"
import { getActiveKidId, getKidSession } from "@/lib/session"

interface TaskWithStatus extends Task {
  status: "todo" | "pending" | "approved" | "rejected"
}

export default function KidHomePage() {
  const [tasks, setTasks] = useState<TaskWithStatus[]>([])
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

      // Daily settlement: check yesterday's missed tasks
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

      const tasksRes = await fetch(`/api/tasks?user_id=${kidId}`)
      const tasksData = await tasksRes.json()
      const tasksWithStatus: TaskWithStatus[] = (tasksData.tasks || []).map((task: Task) => ({
        ...task,
        status: "todo" as const,
      }))
      setTasks(tasksWithStatus.slice(0, 3))

      const pointsRes = await fetch(`/api/points?kid_id=${kidId}`)
      const pointsData = await pointsRes.json()
      setPoints(pointsData.total_points || 0)

      const streakRes = await fetch(`/api/streak?kid_id=${kidId}`)
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

  const handleCheckIn = async (taskId: string) => {
    try {
      const kidId = getActiveKidId()

      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId, kid_id: kidId }),
      })

      const data = await res.json()
      if (data.success) {
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? { ...task, status: "pending" } : task))
        )
      }
    } catch {
      // noop
    }
  }

  return (
    <div className="p-4 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">你好，{kidName}</h1>
        <p className="text-gray-500">今天的任务等着你挑战</p>
      </header>

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

      <div className="grid grid-cols-1 gap-4 mb-6">
        <StreakCounter currentStreak={streak.current} bestStreak={streak.best} />
        <PointsDisplay totalPoints={points} />
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-700">今日任务</h2>
          <a href="/kid/tasks" className="text-sm text-blue-500 font-medium">
            查看全部
          </a>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">空</div>
            <p>还没有任务</p>
            <p className="text-sm mt-1">请家长先去配置任务</p>
          </div>
        ) : (
          <div>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onCheckIn={handleCheckIn} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
