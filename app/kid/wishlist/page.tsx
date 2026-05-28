"use client"

import { FormEvent, useEffect, useState } from "react"
import { getActiveKidId } from "@/lib/session"

interface WishItem {
  id: string
  title: string
  description: string | null
  points_cost: number
  status: "pending" | "approved" | "fulfilled"
}

export default function WishlistPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [wishes, setWishes] = useState<WishItem[]>([])
  const [loading, setLoading] = useState(true)

  const getKidId = () => getActiveKidId()

  const loadWishes = async () => {
    setLoading(true)
    const res = await fetch(`/api/wishlist?kid_id=${getKidId()}`)
    const data = await res.json()
    setWishes(data.wishes || [])
    setLoading(false)
  }

  useEffect(() => {
    loadWishes()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kid_id: getKidId(),
        title: title.trim(),
        description: description.trim() || null,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      alert(data.error || "提交失败")
      return
    }

    setTitle("")
    setDescription("")
    loadWishes()
  }

  const statusText = (status: WishItem["status"]) => {
    if (status === "pending") return "待家长审批"
    if (status === "approved") return "已上架商城"
    return "已兑换"
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-3">我的心愿单</h1>

      <form onSubmit={handleSubmit} className="card mb-4 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="心愿标题，例如：周末看电影"
          className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="补充说明（可选）"
          className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-20"
        />
        <button type="submit" className="btn-primary w-full">
          提交心愿
        </button>
      </form>

      {loading ? (
        <div className="text-center text-gray-400 py-8">加载中...</div>
      ) : wishes.length === 0 ? (
        <div className="text-center text-gray-400 py-8">还没有心愿，先提交一个吧</div>
      ) : (
        <div className="space-y-3">
          {wishes.map((wish) => (
            <div key={wish.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-800">{wish.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{wish.description || "无说明"}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {wish.points_cost} 分
                </span>
              </div>
              <p className="text-xs text-blue-500 mt-3">{statusText(wish.status)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
