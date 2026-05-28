"use client"

interface BadgeCardProps {
  name: string
  icon: string
  description: string
  isUnlocked: boolean
  unlockedAt?: string
}

export default function BadgeCard({ name, icon, description, isUnlocked, unlockedAt }: BadgeCardProps) {
  return (
    <div className={`card text-center p-4 ${!isUnlocked ? "opacity-40 grayscale" : ""}`}>
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="font-bold text-gray-800 text-sm">{name}</h3>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
      {isUnlocked ? (
        <p className="text-xs text-green-500 mt-2">✅ 已解锁</p>
      ) : (
        <p className="text-xs text-gray-400 mt-2">🔒 未解锁</p>
      )}
    </div>
  )
}