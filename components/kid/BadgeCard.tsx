"use client"

interface BadgeCardProps {
  name: string
  icon: string
  description: string
  isUnlocked: boolean
  unlockedAt?: string
  rarity?: "common" | "rare" | "epic" | "legendary"
}

const RARITY_STYLES = {
  common: { border: "border-gray-200", bg: "bg-gray-50", label: "普通", color: "text-gray-500" },
  rare: { border: "border-blue-300", bg: "bg-blue-50", label: "稀有", color: "text-blue-500" },
  epic: { border: "border-purple-300", bg: "bg-purple-50", label: "史诗", color: "text-purple-500" },
  legendary: { border: "border-yellow-300", bg: "bg-yellow-50", label: "传说", color: "text-yellow-600" },
}

export default function BadgeCard({ name, icon, description, isUnlocked, rarity = "common" }: BadgeCardProps) {
  const style = RARITY_STYLES[rarity]

  return (
    <div className={`text-center p-4 rounded-2xl border-2 ${style.border} ${!isUnlocked ? "opacity-40 grayscale bg-gray-50" : style.bg}`}>
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="font-bold text-gray-800 text-sm">{name}</h3>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
      <span className={`text-xs font-medium ${style.color} mt-1 inline-block`}>
        {style.label}
      </span>
      {isUnlocked ? (
        <p className="text-xs text-green-500 mt-1">已解锁</p>
      ) : (
        <p className="text-xs text-gray-400 mt-1">未解锁</p>
      )}
    </div>
  )
}
