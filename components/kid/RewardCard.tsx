"use client"

interface RewardItem {
  id: string
  title: string
  description: string | null
  points_cost: number
  status: string
}

interface RewardCardProps {
  item: RewardItem
  canAfford: boolean
  onRedeem: (wishId: string) => void
}

export default function RewardCard({ item, canAfford, onRedeem }: RewardCardProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-800">{item.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{item.description || "家长设置的奖励"}</p>
        </div>
        <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
          {item.points_cost} 分
        </span>
      </div>
      <div className="mt-4">
        <button
          onClick={() => onRedeem(item.id)}
          disabled={!canAfford}
          className={`w-full py-2 rounded-2xl font-medium transition-colors cursor-pointer ${
            canAfford
              ? "bg-kid-green text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {canAfford ? "兑换" : "积分不足"}
        </button>
      </div>
    </div>
  )
}