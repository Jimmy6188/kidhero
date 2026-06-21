"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getKidSession } from "@/lib/session"
import { REGION_BOSSES } from "@/lib/constants"
import BackButton from "@/components/shared/BackButton"
import { Sword, Trophy, Skull } from "@phosphor-icons/react"

interface BossStatus {
  id: string
  name: string
  icon: string
  description: string
  challengePoints: number
  challengeSubject: string
  challengeDifficulty: number
  challengeCount: number
  rewardPoints: number
  canChallenge: boolean
  isDefeated: boolean
}

export default function BossPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const regionId = searchParams.get("region")

  const [bosses, setBosses] = useState<BossStatus[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedBoss, setSelectedBoss] = useState<BossStatus | null>(null)

  useEffect(() => {
    loadBosses()
  }, [])

  const loadBosses = async () => {
    const kid = getKidSession()
    if (!kid?.id) return

    try {
      const res = await fetch(`/api/boss?kid_id=${kid.id}`)
      const data = await res.json()
      setBosses(data.bosses || [])
      setTotalPoints(data.totalPoints || 0)
    } catch (error) {
      console.error("Failed to load bosses:", error)
    } finally {
      setLoading(false)
    }
  }

  const startChallenge = async (boss: BossStatus) => {
    const kid = getKidSession()
    if (!kid?.id) return

    if (!boss.canChallenge) {
      alert(`需要 ${boss.challengePoints} 积分才能挑战`)
      return
    }

    if (boss.isDefeated) {
      alert("已经击败过这个 Boss 了")
      return
    }

    try {
      const res = await fetch("/api/boss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kid_id: kid.id,
          boss_id: boss.id,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "无法开始挑战")
        return
      }

      const data = await res.json()
      // 跳转到答题页面
      router.push(`/kid/study/play?mode=boss&boss_id=${boss.id}&challenge_id=${data.challenge.id}`)
    } catch (error) {
      alert("网络错误")
    }
  }

  const subjectName: Record<string, string> = {
    math: "数学",
    chinese: "语文",
    english: "英语",
  }

  const subjectEmoji: Record<string, string> = {
    math: "🔢",
    chinese: "📖",
    english: "🅰️",
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-400 py-12">加载中...</div>
  }

  return (
    <div className="p-4 pb-24">
      <BackButton href="/kid/map" />

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">⚔️ Boss 挑战</h1>
        <p className="text-gray-500 mt-1">击败 Boss 获取专属徽章和大量积分</p>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-orange-500">{totalPoints}</p>
          <p className="text-xs text-gray-500">当前积分</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-500">
            {bosses.filter(b => b.isDefeated).length}/{bosses.length}
          </p>
          <p className="text-xs text-gray-500">已击败</p>
        </div>
      </div>

      {/* Boss 列表 */}
      <div className="space-y-4">
        {bosses.map((boss) => {
          const isRegionTarget = regionId === boss.id.replace("boss_", "")
          return (
            <div
              key={boss.id}
              className={`card transition-all ${
                isRegionTarget ? "ring-2 ring-yellow-400" : ""
              } ${boss.isDefeated ? "bg-green-50" : !boss.canChallenge ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-4">
                {/* Boss 图标 */}
                <div className={`text-5xl ${boss.isDefeated ? "grayscale" : ""}`}>
                  {boss.icon}
                </div>

                {/* Boss 信息 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 text-lg">{boss.name}</h3>
                    {boss.isDefeated && (
                      <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                        已击败
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{boss.description}</p>

                  {/* 挑战信息 */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {subjectEmoji[boss.challengeSubject]} {subjectName[boss.challengeSubject]}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {boss.challengeCount} 题
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      难度 {boss.challengeDifficulty}
                    </span>
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                      +{boss.rewardPoints} 积分
                    </span>
                  </div>

                  {/* 解锁条件 */}
                  {!boss.canChallenge && !boss.isDefeated && (
                    <p className="text-xs text-red-400 mt-2">
                      🔒 需要 {boss.challengePoints} 积分才能挑战
                    </p>
                  )}
                </div>

                {/* 挑战按钮 */}
                {!boss.isDefeated && (
                  <button
                    onClick={() => startChallenge(boss)}
                    disabled={!boss.canChallenge}
                    className={`p-3 rounded-xl cursor-pointer ${
                      boss.canChallenge
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <Sword size={24} />
                  </button>
                )}

                {/* 已击败 */}
                {boss.isDefeated && (
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Trophy size={24} className="text-green-600" />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 提示 */}
      <div className="card mt-6 bg-yellow-50">
        <h3 className="font-bold text-yellow-800 mb-2">💡 挑战规则</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 积分达到要求才能挑战 Boss</li>
          <li>• 正确率 ≥ 70% 即为胜利</li>
          <li>• 胜利可获得大量积分和专属徽章</li>
          <li>• 每个 Boss 只能击败一次</li>
        </ul>
      </div>
    </div>
  )
}
