"use client"

import { useState } from "react"
import { Task } from "@/lib/types"

interface TaskFormProps {
  task?: Task
  userId: string
  onSave: () => void
  onCancel: () => void
}

export default function TaskForm({ task, userId, onSave, onCancel }: TaskFormProps) {
  const [name, setName] = useState(task?.name || "")
  const [icon, setIcon] = useState(task?.icon || "⭐")
  const [category, setCategory] = useState<"life" | "learning">(task?.category || "life")
  const [points, setPoints] = useState(task?.points || 10)
  const [requireApproval, setRequireApproval] = useState(task?.require_approval ?? true)

  const icons = ["📚", "🛏️", "🩴", "🧼", "😴", "🎒", "🧹", "🪥", "⭐", "🎯", "📖", "✏️", "🧮", "🌍"]

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("请输入任务名称")
      return
    }

    const payload = {
      ...(task?.id && { id: task.id }),
      user_id: userId,
      name,
      icon,
      category,
      points,
      frequency: "daily",
      require_approval: requireApproval,
      is_active: true,
    }

    await fetch("/api/tasks", {
      method: task?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    onSave()
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{task ? "编辑任务" : "创建新任务"}</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">任务名称</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="例如：整理书桌"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">选择图标</label>
          <div className="flex flex-wrap gap-2">
            {icons.map((i) => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={`text-2xl p-2 rounded-xl transition-all cursor-pointer ${
                  icon === i ? "bg-blue-100 ring-2 ring-blue-500" : "bg-gray-50"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">任务类型</label>
          <div className="flex gap-3">
            {[
              { value: "life" as const, label: "🏠 生活任务" },
              { value: "learning" as const, label: "📚 学习任务" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCategory(opt.value)}
                className={`flex-1 p-3 rounded-2xl font-medium transition-all cursor-pointer ${
                  category === opt.value
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">积分奖励</label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="w-full p-3 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            min={1}
            max={100}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
          <span className="text-gray-700">需要家长审核</span>
          <button
            onClick={() => setRequireApproval(!requireApproval)}
            className={`w-12 h-7 rounded-full transition-colors cursor-pointer ${
              requireApproval ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                requireApproval ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onCancel} className="flex-1 py-3 text-gray-500 font-medium cursor-pointer">
            取消
          </button>
          <button onClick={handleSubmit} className="flex-1 btn-primary">
            {task ? "保存" : "创建"}
          </button>
        </div>
      </div>
    </div>
  )
}