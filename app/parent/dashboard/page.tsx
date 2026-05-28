"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import StatsCard from "@/components/parent/StatsCard"
import { getParentSession, switchKid, getActiveKidId } from "@/lib/session"

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
  const [parentName, setParentName] = useState("")
  const [kids, setKids] = useState<{ id: string; name: string; avatar: string }[]>([])
  const [currentKidId, setCurrentKidId] = useState("")

  useEffect(() => {
    const parent = getParentSession()
    if (!parent) return

    setParentName(parent.name)
    setKids(parent.kids || [])
    setCurrentKidId(parent.kid_id || "")
  }, [])

  useEffect(() => {
    if (!currentKidId) return
    loadDashboard(currentKidId)
  }, [currentKidId])

  const loadDashboard = async (kidId: string) => {
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

  const handleSwitchKid = (kidId: string) => {
    switchKid(kidId)
    setCurrentKidId(kidId)
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">
          {parentName ? `${parentName}的` : ""}家长总览
        </h1>
        <Link href="/parent/kids" className="text-sm text-blue-500 font-medium">
          宝贝管理 →
        </Link>
      </div>

      {/* Kid Switcher */}
      {kids.length > 0 && (
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {kids.map((kid) => (
            <button
              key={kid.id}
              onClick={() => handleSwitchKid(kid.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl whitespace-nowrap transition-all cursor-pointer ${
                currentKidId === kid.id
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <span className="text-lg">{kid.avatar || "🦸‍♂️"}</span>
              <span className="font-medium text-sm">{kid.name}</span>
            </button>
          ))}
        </div>
      )}

      {!currentKidId ? (
        <div className="card">
          <p className="font-medium text-gray-700">还没有添加宝贝</p>
          <p className="mb-4 mt-2 text-sm text-gray-500">
            先添加宝贝信息，任务、成长数据和学习记录才能正常工作。
          </p>
          <Link href="/parent/create-kid" className="btn-primary inline-block">
            去添加宝贝
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatsCard title="待审核" value={state.pendingCount} />
            <StatsCard title="总积分" value={state.totalPoints} />
            <StatsCard title="最长连击" value={`${state.bestStreak} 天`} />
            <StatsCard title="勋章数" value={state.badgeCount} />
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <Link href="/parent/tasks" className="card block hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">任务管理</p>
                  <p className="text-sm text-gray-500">查看和管理每日任务</p>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Link>

            <Link href="/parent/review" className="card block hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">打卡审核</p>
                  <p className="text-sm text-gray-500">审核宝贝的打卡记录</p>
                </div>
                {state.pendingCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {state.pendingCount}
                  </span>
                )}
              </div>
            </Link>

            <Link href="/parent/study-report" className="card block hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">学习报告</p>
                  <p className="text-sm text-gray-500">查看学习进度和正确率</p>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Link>

            <Link href="/parent/growth" className="card block hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">成长数据</p>
                  <p className="text-sm text-gray-500">身高体重记录与曲线</p>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Link>

            <Link href="/parent/rewards" className="card block hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">奖励管理</p>
                  <p className="text-sm text-gray-500">商城商品和心愿单</p>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Link>

            <Link href="/parent/reports" className="card block hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">数据报表</p>
                  <p className="text-sm text-gray-500">统计和勋章进度</p>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
