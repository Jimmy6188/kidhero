"use client"

import { calculateLevel } from "@/lib/points"

interface PointsDisplayProps {
  totalPoints: number
}

export default function PointsDisplay({ totalPoints }: PointsDisplayProps) {
  const level = calculateLevel(totalPoints)

  return (
    <div className="card flex items-center gap-3">
      <div className="text-5xl">⭐</div>
      <div className="flex-1">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-800">{totalPoints}</span>
          <span className="text-sm text-gray-500">分</span>
        </div>
        <p className="text-xs text-gray-400">Lv.{level.level} {level.name}</p>
      </div>
      <div className="w-16">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${level.progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 text-center mt-1">{level.progress}%</p>
      </div>
    </div>
  )
}