"use client"

import { Task } from "@/lib/types"

interface TaskWithStatus extends Task {
  status: "todo" | "pending" | "approved" | "rejected"
}

interface TaskCardProps {
  task: TaskWithStatus
  onCheckIn: (taskId: string) => void
}

export default function TaskCard({ task, onCheckIn }: TaskCardProps) {
  const statusConfig = {
    todo: { label: "打卡", bg: "bg-kid-green", text: "text-white", disabled: false },
    pending: { label: "⏳ 待审核", bg: "bg-gray-200", text: "text-gray-500", disabled: true },
    approved: { label: "✅ 已完成", bg: "bg-gray-100", text: "text-gray-400", disabled: true },
    rejected: { label: "❌ 未通过", bg: "bg-red-100", text: "text-red-500", disabled: false },
  }

  const config = statusConfig[task.status]

  return (
    <div className="card flex items-center gap-4 mb-3">
      <div className="text-4xl">{task.icon}</div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-800">{task.name}</h3>
        <p className="text-sm text-kid-orange font-semibold">+{task.points} 积分</p>
      </div>
      <button
        onClick={() => onCheckIn(task.id)}
        disabled={config.disabled}
        className={`${config.bg} ${config.text} font-bold py-2 px-5 rounded-2xl active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 cursor-pointer`}
      >
        {config.label}
      </button>
    </div>
  )
}