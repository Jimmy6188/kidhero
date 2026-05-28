"use client"

import { GrowthRecord } from "@/lib/types"

interface GrowthChartProps {
  records: GrowthRecord[]
  type: "height" | "weight"
}

export default function GrowthChart({ records, type }: GrowthChartProps) {
  if (records.length === 0) {
    return <div className="card text-center py-8 text-gray-400">暂无数据</div>
  }

  const values = records.map((record) => (type === "height" ? record.height : record.weight))
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const unit = type === "height" ? "cm" : "kg"

  return (
    <div className="card">
      <h3 className="font-bold text-gray-700 mb-3">
        {type === "height" ? "身高趋势" : "体重趋势"}
      </h3>
      <div className="flex items-end gap-2 h-36">
        {records.map((record) => {
          const value = type === "height" ? record.height : record.weight
          const heightPercent = ((value - min) / range) * 80 + 20

          return (
            <div key={record.id} className="flex-1 flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">{value}</span>
              <div
                className={`w-full rounded-t-lg ${
                  type === "height"
                    ? "bg-gradient-to-t from-blue-500 to-cyan-300"
                    : "bg-gradient-to-t from-orange-500 to-yellow-300"
                }`}
                style={{ height: `${heightPercent}%` }}
              />
              <span className="text-[10px] text-gray-400 mt-2">
                {new Date(record.recorded_at).toLocaleDateString("zh-CN", {
                  month: "2-digit",
                  day: "2-digit",
                })}
              </span>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-400 mt-3 text-center">单位：{unit}</p>
    </div>
  )
}
