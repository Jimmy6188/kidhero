"use client"

import { useEffect, useState } from "react"
import StatsCard from "@/components/parent/StatsCard"
import { getActiveKidId } from "@/lib/session"
import Link from "next/link"

interface ReportsData {
  summary: {
    approved_count: number
    rejected_count: number
    total_points: number
    badge_count: number
  }
  points_trend: { date: string; total: number }[]
  latest_growth: { height?: number; weight?: number } | null
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)

  const getKidId = () => getActiveKidId()

  useEffect(() => {
    const loadReports = async () => {
      if (!getKidId()) {
        setLoading(false)
        return
      }
      setLoading(true)
      const res = await fetch(`/api/reports?kid_id=${getKidId()}`)
      const report = await res.json()
      setData(report)
      setLoading(false)
    }

    loadReports()
  }, [])

  if (loading) {
    return <div className="p-4 text-center text-gray-400 py-12">加载中...</div>
  }

  if (!data) {
    if (!getKidId()) {
      return (
        <div className="p-4 pb-24">
          <div className="card">
            <p className="text-gray-700 font-medium">还没有孩子档案</p>
            <p className="text-sm text-gray-500 mt-2 mb-4">先创建孩子档案，再查看报表。</p>
            <Link href="/parent/create-kid" className="btn-primary inline-block">
              去创建
            </Link>
          </div>
        </div>
      )
    }
    return <div className="p-4 text-center text-gray-400 py-12">暂无报表数据</div>
  }

  const trendMax = Math.max(...data.points_trend.map((item) => item.total), 1)

  return (
    <div className="p-4 pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-4">综合报表</h1>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatsCard title="通过打卡" value={data.summary.approved_count} />
        <StatsCard title="未通过" value={data.summary.rejected_count} />
        <StatsCard title="总积分" value={data.summary.total_points} />
        <StatsCard title="勋章数" value={data.summary.badge_count} />
      </div>

      <div className="card mb-5">
        <h2 className="font-bold text-gray-700 mb-3">积分趋势</h2>
        <div className="flex items-end gap-2 h-32">
          {data.points_trend.map((item) => (
            <div key={item.date} className="flex-1 flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">{item.total}</span>
              <div
                className="w-full bg-gradient-to-t from-purple-500 to-pink-300 rounded-t-lg"
                style={{ height: `${(item.total / trendMax) * 100 || 8}%` }}
              />
              <span className="text-[10px] text-gray-400 mt-2">{item.date}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="font-bold text-gray-700 mb-3">最新成长记录</h2>
        {data.latest_growth ? (
          <div className="grid grid-cols-2 gap-3">
            <StatsCard title="最新身高" value={`${data.latest_growth.height ?? "-"} cm`} />
            <StatsCard title="最新体重" value={`${data.latest_growth.weight ?? "-"} kg`} />
          </div>
        ) : (
          <div className="text-sm text-gray-400">暂无成长记录</div>
        )}
      </div>
    </div>
  )
}
