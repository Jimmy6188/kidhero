"use client"

import { MapRegion } from "@/lib/types"

interface MapNodeProps {
  region: MapRegion
  isUnlocked: boolean
  isCurrent: boolean
  index: number
  total: number
}

export default function MapNode({ region, isUnlocked, isCurrent, index, total }: MapNodeProps) {
  const isFirst = index === 0
  const isLast = index === total - 1

  return (
    <div className="relative">
      {/* 连接线 */}
      {!isLast && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-1 h-8 -bottom-8 ${
            isUnlocked ? "bg-green-300" : "bg-gray-200"
          }`}
        />
      )}

      {/* 节点 */}
      <div
        className={`relative p-5 rounded-3xl transition-all duration-300 ${
          isUnlocked
            ? "shadow-lg"
            : "opacity-40 grayscale"
        } ${isCurrent ? "ring-4 ring-yellow-400 ring-offset-2 scale-105" : ""}`}
        style={{
          backgroundColor: isUnlocked ? `${region.color}15` : "#f3f4f6",
          borderColor: isUnlocked ? region.color : "#e5e7eb",
          borderWidth: "2px",
        }}
      >
        {/* 当前位置标记 */}
        {isCurrent && (
          <div className="absolute -top-3 -right-3 bg-yellow-400 text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
            📍 当前
          </div>
        )}

        {/* 已解锁标记 */}
        {isUnlocked && !isCurrent && (
          <div className="absolute -top-2 -right-2 bg-green-400 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center shadow">
            ✓
          </div>
        )}

        {/* 区域图标 */}
        <div className="text-5xl text-center mb-3">{region.icon}</div>

        {/* 区域信息 */}
        <h3 className="font-bold text-center text-gray-800 text-lg">{region.name}</h3>
        <p className="text-xs text-center text-gray-500 mt-1">{region.theme}</p>

        {/* 解锁条件 */}
        {!isUnlocked && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-400">
              🔒 需要 {region.requiredPoints} 积分
            </p>
            <p className="text-xs text-gray-400">
              Lv.{region.requiredLevel} 解锁
            </p>
          </div>
        )}

        {/* 已解锁进度 */}
        {isUnlocked && (
          <div className="mt-3 text-center">
            <p className="text-xs" style={{ color: region.color }}>
              ✨ 已解锁
            </p>
          </div>
        )}
      </div>
    </div>
  )
}