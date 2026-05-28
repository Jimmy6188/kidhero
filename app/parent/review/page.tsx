"use client"

import { useState, useEffect } from "react"
import ReviewItem from "@/components/parent/ReviewItem"

export default function ReviewPage() {
  const [pendingItems, setPendingItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPending()
  }, [])

  const loadPending = async () => {
    setLoading(true)
    const res = await fetch("/api/checkin?status=pending")
    const data = await res.json()
    setPendingItems(data.check_ins || [])
    setLoading(false)
  }

  const handleAction = async (checkInId: string, action: "approve" | "reject") => {
    await fetch("/api/checkin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ check_in_id: checkInId, action }),
    })
    loadPending()
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-400 py-12">加载中...</div>
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-2">✅ 打卡审核</h1>
      <p className="text-sm text-gray-500 mb-4">
        待审核: {pendingItems.length} 项
      </p>

      {pendingItems.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">🎉</div>
          <p>没有待审核的打卡</p>
          <p className="text-sm mt-1">孩子的打卡会出现在这里</p>
        </div>
      ) : (
        pendingItems.map((item: any) => (
          <ReviewItem key={item.id} item={item} onAction={handleAction} />
        ))
      )}
    </div>
  )
}