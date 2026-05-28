"use client"

import { useState, useEffect } from "react"
import TaskCard from "@/components/kid/TaskCard"
import { Task } from "@/lib/types"
import { getActiveKidId } from "@/lib/session"

interface TaskWithStatus extends Task {
  status: "todo" | "pending" | "approved" | "rejected"
}

export default function KidTasksPage() {
  const [tasks, setTasks] = useState<TaskWithStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const kidId = getActiveKidId()

      const res = await fetch(`/api/tasks?user_id=${kidId}`)
      const data = await res.json()

      const tasksWithStatus: TaskWithStatus[] = (data.tasks || []).map(
        (task: Task) => ({
          ...task,
          status: "todo" as const,
        })
      )

      setTasks(tasksWithStatus)
    } catch {
      setTasks([])
    }
    setLoading(false)
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
          prev.map((t) => (t.id === taskId ? { ...t, status: "pending" } : t))
        )
      } else {
        alert(data.error || "打卡失败")
      }
    } catch {
      alert("网络错误")
    }
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400 py-12">加载中...</div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-4">📋 今日任务</h1>

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">📭</div>
          <p>还没有任务哦</p>
          <p className="text-sm mt-1">请家长先去配置任务吧</p>
        </div>
      ) : (
        <div>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onCheckIn={handleCheckIn} />
          ))}
        </div>
      )}
    </div>
  )
}
