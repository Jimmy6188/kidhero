"use client"

interface ReviewItemProps {
  item: {
    id: string
    checked_at: string
    tasks?: { name: string; icon: string; points: number }
  }
  onAction: (checkInId: string, action: "approve" | "reject") => void
}

export default function ReviewItem({ item, onAction }: ReviewItemProps) {
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes} 分钟前`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} 小时前`
    return `${Math.floor(hours / 24)} 天前`
  }

  return (
    <div className="card mb-3">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-3xl">{item.tasks?.icon || "📋"}</div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800">{item.tasks?.name || "未知任务"}</h3>
          <p className="text-xs text-gray-400">{timeAgo(item.checked_at)}</p>
        </div>
        <div className="text-kid-orange font-bold">+{item.tasks?.points || 0} 分</div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onAction(item.id, "reject")}
          className="flex-1 py-2 bg-gray-100 text-gray-500 font-medium rounded-2xl active:scale-95 transition-transform cursor-pointer"
        >
          ❌ 拒绝
        </button>
        <button
          onClick={() => onAction(item.id, "approve")}
          className="flex-1 py-2 bg-kid-green text-white font-medium rounded-2xl active:scale-95 transition-transform cursor-pointer"
        >
          ✅ 确认
        </button>
      </div>
    </div>
  )
}