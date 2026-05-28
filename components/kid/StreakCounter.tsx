"use client"

import { useState, useEffect } from "react"

interface StreakCounterProps {
  currentStreak: number
  bestStreak: number
}

export default function StreakCounter({ currentStreak, bestStreak }: StreakCounterProps) {
  const [animate, setAnimate] = useState(false)
  const [showExtinguish, setShowExtinguish] = useState(false)

  useEffect(() => {
    if (currentStreak > 0) {
      setAnimate(true)
      const timer = setTimeout(() => setAnimate(false), 1000)
      return () => clearTimeout(timer)
    } else {
      setShowExtinguish(true)
      const timer = setTimeout(() => setShowExtinguish(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [currentStreak])

  const isOnFire = currentStreak > 0

  return (
    <div className="card flex items-center gap-3">
      <div
        className={`text-5xl transition-all duration-500 ${
          animate ? "scale-125" : ""
        } ${showExtinguish ? "opacity-30 grayscale" : ""}`}
      >
        {isOnFire ? "🔥" : "💨"}
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-800">{currentStreak}</span>
          <span className="text-sm text-gray-500">天连续</span>
        </div>
        <p className="text-xs text-gray-400">最长: {bestStreak} 天</p>
      </div>
      {currentStreak >= 3 && (
        <div className="ml-auto bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
          {currentStreak >= 7 ? "🏆 超级连续" : "⚡ 小有成就"}
        </div>
      )}
    </div>
  )
}