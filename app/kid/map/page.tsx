"use client"

import { useState, useEffect } from "react"
import { MAP_REGIONS } from "@/lib/constants"
import { calculateLevel, getUnlockedRegions, getCurrentRegion } from "@/lib/points"
import MapNode from "@/components/kid/MapNode"
import { getActiveKidId } from "@/lib/session"

export default function MapPage() {
  const [totalPoints, setTotalPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPoints()
  }, [])

  const loadPoints = async () => {
    try {
      const kidId = getActiveKidId()

      const res = await fetch(`/api/points?kid_id=${kidId}`)
      const data = await res.json()
      setTotalPoints(data.total_points || 0)
    } catch {
      setTotalPoints(0)
    }
    setLoading(false)
  }

  const level = calculateLevel(totalPoints)
  const unlocked = getUnlockedRegions(totalPoints)
  const current = getCurrentRegion(totalPoints)

  if (loading) {
    return <div className="p-4 text-center text-gray-400 py-12">加载中...</div>
  }

  return (
    <div className="p-4 pb-24">
      {/* 标题和等级 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🗺️ 冒险地图</h1>
        <div className="flex items-center justify-between mt-2">
          <p className="text-gray-500">
            Lv.{level.level} {level.name}
          </p>
          <p className="text-kid-orange font-bold">{totalPoints} 积分</p>
        </div>

        {/* 等级进度条 */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Lv.{level.level}</span>
            <span>{level.progress}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full transition-all duration-700"
              style={{ width: `${level.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-gray-800">{unlocked.length}</p>
          <p className="text-xs text-gray-500">已解锁区域</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-gray-800">{MAP_REGIONS.length}</p>
          <p className="text-xs text-gray-500">总区域数</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-gray-800">
            {MAP_REGIONS.length - unlocked.length}
          </p>
          <p className="text-xs text-gray-500">待解锁</p>
        </div>
      </div>

      {/* 地图区域 */}
      <h2 className="text-lg font-bold text-gray-700 mb-4">🗺️ 探索世界</h2>
      <div className="space-y-10">
        {MAP_REGIONS.map((region, index) => (
          <MapNode
            key={region.id}
            region={region}
            isUnlocked={unlocked.some((r) => r.id === region.id)}
            isCurrent={current.id === region.id}
            index={index}
            total={MAP_REGIONS.length}
            totalPoints={totalPoints}
          />
        ))}
      </div>

      {/* 底部提示 */}
      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>完成更多任务获取积分，解锁新区域！</p>
      </div>
    </div>
  )
}
