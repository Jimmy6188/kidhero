"use client"

import { useEffect, useState } from "react"
import { getActiveKidId } from "@/lib/session"
import Link from "next/link"

interface WishItem {
  id: string
  title: string
  description: string | null
  points_cost: number
  status: "pending" | "approved" | "fulfilled"
  kid_id: string
}

export default function ParentRewardsPage() {
  const [pending, setPending] = useState<WishItem[]>([])
  const [approved, setApproved] = useState<WishItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    const kidId = getActiveKidId()
    if (!kidId) {
      setPending([])
      setApproved([])
      setLoading(false)
      return
    }
    setLoading(true)
    const res = await fetch(`/api/wishlist?kid_id=${kidId}`)
    const data = await res.json()
    const wishes: WishItem[] = data.wishes || []
    setPending(wishes.filter((w) => w.status === "pending"))
    setApproved(wishes.filter((w) => w.status === "approved"))
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleApprove = async (id: string, pointsCost: number) => {
    const res = await fetch("/api/wishlist", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "approved", points_cost: pointsCost }),
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || "审批失败")
      return
    }
    loadData()
  }

  const handleFulfill = async (id: string) => {
    const res = await fetch("/api/wishlist", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "fulfilled" }),
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || "更新失败")
      return
    }
    loadData()
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-400 py-12">加载中...</div>
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-4">奖励管理</h1>

      {!getActiveKidId() ? (
        <div className="card mb-5">
          <p className="text-gray-700 font-medium">还没有孩子档案</p>
          <p className="text-sm text-gray-500 mt-2 mb-4">先创建孩子档案，再审批心愿和奖励。</p>
          <Link href="/parent/create-kid" className="btn-primary inline-block">
            去创建
          </Link>
        </div>
      ) : null}

      <h2 className="text-sm font-semibold text-gray-600 mb-2">待审批心愿 ({pending.length})</h2>
      {pending.length === 0 ? (
        <div className="card text-sm text-gray-400 mb-4">暂无待审批心愿</div>
      ) : (
        <div className="space-y-3 mb-5">
          {pending.map((wish) => (
            <div key={wish.id} className="card">
              <h3 className="font-bold text-gray-800">{wish.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{wish.description || "无说明"}</p>
              <div className="mt-3 flex items-center gap-2">
                <input
                  defaultValue={wish.points_cost}
                  type="number"
                  min={1}
                  max={5000}
                  className="w-24 p-2 border border-gray-200 rounded-xl"
                  id={`points-${wish.id}`}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById(`points-${wish.id}`) as HTMLInputElement | null
                    const points = input ? Number(input.value) : wish.points_cost
                    handleApprove(wish.id, points)
                  }}
                  className="bg-kid-green text-white px-3 py-2 rounded-xl text-sm cursor-pointer"
                >
                  审批上架
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-sm font-semibold text-gray-600 mb-2">商城奖励 ({approved.length})</h2>
      {approved.length === 0 ? (
        <div className="card text-sm text-gray-400">暂无已上架奖励</div>
      ) : (
        <div className="space-y-3">
          {approved.map((wish) => (
            <div key={wish.id} className="card flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-800">{wish.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{wish.points_cost} 分</p>
              </div>
              <button
                onClick={() => handleFulfill(wish.id)}
                className="bg-blue-500 text-white px-3 py-2 rounded-xl text-sm cursor-pointer"
              >
                标记已兑现
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
