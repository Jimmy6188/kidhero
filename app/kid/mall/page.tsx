"use client"

import { useEffect, useState } from "react"
import RewardCard from "@/components/kid/RewardCard"
import { getActiveKidId } from "@/lib/session"

interface MallItem {
  id: string
  title: string
  description: string | null
  points_cost: number
  status: string
}

export default function MallPage() {
  const [items, setItems] = useState<MallItem[]>([])
  const [points, setPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  const getKidId = () => getActiveKidId()

  const loadData = async () => {
    setLoading(true)
    const kidId = getKidId()

    const [mallRes, pointsRes] = await Promise.all([
      fetch(`/api/mall?kid_id=${kidId}`),
      fetch(`/api/points?kid_id=${kidId}`),
    ])

    const mallData = await mallRes.json()
    const pointsData = await pointsRes.json()

    setItems(mallData.items || [])
    setPoints(pointsData.total_points || 0)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRedeem = async (wishId: string) => {
    const kidId = getKidId()
    const res = await fetch("/api/mall", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wish_id: wishId, kid_id: kidId }),
    })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "兑换失败")
      return
    }

    alert("兑换成功，等待家长兑现")
    loadData()
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-400 py-12">加载中...</div>
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-2">积分商城</h1>
      <p className="text-sm text-gray-500 mb-4">当前积分：{points}</p>

      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>暂无可兑换商品</p>
          <p className="text-sm mt-1">让家长先审批心愿或添加奖励</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <RewardCard
              key={item.id}
              item={item}
              canAfford={points >= item.points_cost}
              onRedeem={handleRedeem}
            />
          ))}
        </div>
      )}
    </div>
  )
}
