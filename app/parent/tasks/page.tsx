"use client"

import { useState, useEffect } from "react"
import TaskForm from "@/components/parent/TaskForm"
import { Task } from "@/lib/types"
import { getParentSession } from "@/lib/session"

export default function ParentTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [loading, setLoading] = useState(true)

  const getUserId = () => {
    return getParentSession()?.id || ""
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    if (!getUserId()) {
      setTasks([])
      setLoading(false)
      return
    }
    setLoading(true)
    const res = await fetch(`/api/tasks?user_id=${getUserId()}`)
    const data = await res.json()
    setTasks(data.tasks || [])
    setLoading(false)
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm("确定删除这个任务吗？")) return
    await fetch("/api/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId }),
    })
    loadTasks()
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleSave = () => {
    setShowForm(false)
    setEditingTask(undefined)
    loadTasks()
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTask(undefined)
  }

  if (showForm) {
    return (
      <TaskForm
        task={editingTask}
        userId={getUserId()}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">📋 任务管理</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-2xl active:scale-95 transition-transform cursor-pointer"
        >
          + 新任务
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">📝</div>
          <p>还没有任务</p>
          <p className="text-sm mt-1">点击上方按钮创建第一个任务</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="card flex items-center gap-3">
              <div className="text-3xl">{task.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{task.name}</h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {task.category === "life" ? "🏠 生活" : "📚 学习"}
                  </span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                    +{task.points} 分
                  </span>
                  {task.require_approval && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                      需审核
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="text-blue-500 text-sm cursor-pointer"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-red-400 text-sm cursor-pointer"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
