"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import StatsCard from "@/components/parent/StatsCard"
import { getActiveKidId } from "@/lib/session"

interface DashboardState {
  pendingCount: number
  totalPoints: number
  bestStreak: number
  badgeCount: number
}

export default function ParentDashboard() {
  const [state, setState] = useState<DashboardState>({
    pendingCount: 0,
    totalPoints: 0,
    bestStreak: 0,
    badgeCount: 0,
  })

  useEffect(() => {
    const loadDashboard = async () => {
      const kidId = getActiveKidId()
      if (!kidId) {
        return
      }

      const [checkInsRes, pointsRes, streakRes, badgesRes] = await Promise.all([
        fetch("/api/checkin?status=pending"),
        fetch(`/api/points?kid_id=${kidId}`),
        fetch(`/api/streak?kid_id=${kidId}`),
        fetch(`/api/badges?kid_id=${kidId}`),
      ])

      const checkInsData = await checkInsRes.json()
      const pointsData = await pointsRes.json()
      const streakData = await streakRes.json()
      const badgesData = await badgesRes.json()

      setState({
        pendingCount: (checkInsData.check_ins || []).length,
        totalPoints: pointsData.total_points || 0,
        bestStreak: streakData.streak?.best_streak || 0,
        badgeCount: (badgesData.user_badges || []).length,
      })
    }

    loadDashboard()
  }, [])

  return (
    <div className="p-4 pb-24">
      <h1 className="mb-4 text-xl font-bold text-gray-800">家长总览</h1>

      {!getActiveKidId() ? (
        <div className="card">
          <p className="font-medium text-gray-700">还没有绑定孩子档案。</p>
          <p className="mb-4 mt-2 text-sm text-gray-500">
            先创建孩子档案，任务、成长数据和学习记录才能正常工作。
          </p>
          <Link href="/parent/create-kid" className="btn-primary inline-block">
            去创建孩子档案
          </Link>
        </div>
      ) : null}

      <div className="mb-6 mt-6 grid grid-cols-2 gap-4">
        <StatsCard title="待审核" value={state.pendingCount} />
        <StatsCard title="总积分" value={state.totalPoints} />
        <StatsCard title="最长连击" value={`${state.bestStreak} 天`} />
        <StatsCard title="勋章数" value={state.badgeCount} />
      </div>

      <div className="card">
        <p className="font-medium text-gray-700">当前状态</p>
        <p className="mt-2 text-sm text-gray-500">
          当前已接入真实的亲子绑定字段。只要 Supabase 环境变量和数据迁移配置正确，家长端与孩子端即可正常联动。
        </p>
      </div>
    </div>
  )
}
