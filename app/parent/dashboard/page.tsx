"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import StatsCard from "@/components/parent/StatsCard"
import { getParentSession, switchKid } from "@/lib/session"
import {
  ListChecks,
  ClipboardText,
  ChartLineUp,
  Ruler,
  Gift,
  ChartBar,
  Gear,
  CaretRight,
  Copy,
  Check
} from "@phosphor-icons/react"

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
  const [inviteCode, setInviteCode] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const parent = getParentSession()
    if (!parent) return

    setParentName(parent.name)
    setKids(parent.kids || [])
    setCurrentKidId(parent.kid_id || "")

    // 获取邀请码
    if (parent.id) {
      fetch(`/api/family/invite?user_id=${parent.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.invite_code) {
            setInviteCode(data.invite_code)
          }
        })
        .catch(() => {})
    }
  }, [])

  const copyInviteCode = async () => {
    if (!inviteCode) return
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = inviteCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    if (!currentKidId) return
    loadDashboard(currentKidId)
  }, [currentKidId])

  const loadDashboard = async (kidId: string) => {
    try {
      const [checkInsRes, pointsRes, streakRes, badgesRes] = await Promise.all([
        fetch("/api/checkin?status=pending"),
        fetch(`/api/points?kid_id=${kidId}`),
        fetch(`/api/streak?kid_id=${kidId}`),
        fetch(`/api/badges?kid_id=${kidId}`),
      ])

      const [checkInsData, pointsData, streakData, badgesData] = await Promise.all([
        checkInsRes.json(),
        pointsRes.json(),
        streakRes.json(),
        badgesRes.json(),
      ])

      setState({
        pendingCount: (checkInsData.check_ins || []).length,
        totalPoints: pointsData.total_points || 0,
        bestStreak: streakData.streak?.best_streak || 0,
        badgeCount: (badgesData.user_badges || []).length,
      })
    } catch (error) {
      console.error("Failed to load dashboard:", error)
    }
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
        <Link href="/parent/kids" className="flex items-center gap-1 text-sm text-blue-500 font-medium">
          宝贝管理 <CaretRight size={14} />
        </Link>
      </div>

      {/* Kid Switcher */}
      {kids.length > 0 && (
        <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
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

      {/* 邀请码卡片 */}
      {inviteCode && (
        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">家庭邀请码</p>
              <p className="text-xs text-green-600 mt-0.5">分享给其他家长加入家庭</p>
            </div>
            <button
              onClick={copyInviteCode}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl cursor-pointer hover:bg-green-600 transition-colors"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  <span className="font-bold tracking-wider">{inviteCode}</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span className="font-bold tracking-wider">{inviteCode}</span>
                </>
              )}
            </button>
          </div>
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
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <ListChecks size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">任务管理</p>
                    <p className="text-sm text-gray-500">查看和管理每日任务</p>
                  </div>
                </div>
                <CaretRight size={16} className="text-gray-400" />
              </div>
            </Link>

            <Link href="/parent/review" className="card block hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <ClipboardText size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">打卡审核</p>
                    <p className="text-sm text-gray-500">审核宝贝的打卡记录</p>
                  </div>
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
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <ChartLineUp size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">学习报告</p>
                    <p className="text-sm text-gray-500">查看学习进度和正确率</p>
                  </div>
                </div>
                <CaretRight size={16} className="text-gray-400" />
              </div>
            </Link>

            <Link href="/parent/review-answers" className="card block hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <ClipboardText size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">答题审核</p>
                    <p className="text-sm text-gray-500">查看答题记录，修正错判</p>
                  </div>
                </div>
                <CaretRight size={16} className="text-gray-400" />
              </div>
            </Link>

            <Link href="/parent/growth" className="card block hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-xl">
                    <Ruler size={20} className="text-pink-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">成长数据</p>
                    <p className="text-sm text-gray-500">身高体重记录与曲线</p>
                  </div>
                </div>
                <CaretRight size={16} className="text-gray-400" />
              </div>
            </Link>

            <Link href="/parent/rewards" className="card block hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-xl">
                    <Gift size={20} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">奖励管理</p>
                    <p className="text-sm text-gray-500">商城商品和心愿单</p>
                  </div>
                </div>
                <CaretRight size={16} className="text-gray-400" />
              </div>
            </Link>

            <Link href="/parent/reports" className="card block hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-xl">
                    <ChartBar size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">数据报表</p>
                    <p className="text-sm text-gray-500">统计和勋章进度</p>
                  </div>
                </div>
                <CaretRight size={16} className="text-gray-400" />
              </div>
            </Link>

            <Link href="/parent/cache" className="card block hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-xl">
                    <ChartBar size={20} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">题目缓存池</p>
                    <p className="text-sm text-gray-500">查看库存和手动补充</p>
                  </div>
                </div>
                <CaretRight size={16} className="text-gray-400" />
              </div>
            </Link>

            <Link href="/parent/settings" className="card block hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-xl">
                    <Gear size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">系统设置</p>
                    <p className="text-sm text-gray-500">AI 模型配置等</p>
                  </div>
                </div>
                <CaretRight size={16} className="text-gray-400" />
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
