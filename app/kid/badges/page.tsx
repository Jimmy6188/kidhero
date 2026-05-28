"use client"

import { useState, useEffect } from "react"
import BadgeCard from "@/components/kid/BadgeCard"
import { BADGE_DEFINITIONS } from "@/lib/badges"
import { getActiveKidId } from "@/lib/session"

export default function BadgesPage() {
  const [unlockedNames, setUnlockedNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBadges()
  }, [])

  const loadBadges = async () => {
    try {
      const kidId = getActiveKidId()

      const res = await fetch(`/api/badges?kid_id=${kidId}`)
      const data = await res.json()
      const names = (data.user_badges || []).map((ub: any) => ub.badges?.name || "")
      setUnlockedNames(names)
    } catch {
      setUnlockedNames([])
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-400 py-12">加载中...</div>
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-2">🏅 勋章墙</h1>
      <p className="text-sm text-gray-500 mb-4">
        已解锁 {unlockedNames.length}/{BADGE_DEFINITIONS.length}
      </p>
      <div className="grid grid-cols-3 gap-3">
        {BADGE_DEFINITIONS.map((badge) => (
          <BadgeCard
            key={badge.name}
            name={badge.name}
            icon={badge.icon}
            description={badge.description}
            isUnlocked={unlockedNames.includes(badge.name)}
          />
        ))}
      </div>
    </div>
  )
}
