"use client"

import { useEffect, useState } from "react"
import { getParentSession } from "@/lib/session"
import Link from "next/link"

interface WishItem {
  id: string
  title: string
  description: string | null
  points_cost: number
  status: "pending" | "approved" | "fulfilled"
  kid_id: string | null
}

const TABS = [
  { key: "manage", label: "商城管理" },
  { key: "wishes", label: "心愿审批" },
]

export default function ParentRewardsPage() {
  const [tab, setTab] = useState<"manage" | "wishes">("manage")
  const [rewards, setRewards] = useState<WishItem[]>([])
  const [pending, setPending] = useState<WishItem[]>([])
  const [loading, setLoading] = useState(true)

  // Add reward form
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newPoints, setNewPoints] = useState("")
  const [newCategory, setNewCategory] = useState("小奖")
  const [formError, setFormError] = useState("")

  const parentId = getParentSession()?.id

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [rewardsRes, wishesRes] = await Promise.all([
      fetch(`/api/rewards?parent_id=${parentId}`),
      fetch(`/api/wishlist`),
    ])
    const rewardsData = await rewardsRes.json()
    const wishesData = await wishesRes.json()

    setRewards(rewardsData.rewards || [])
    setPending((wishesData.wishes || []).filter((w: WishItem) => w.status === "pending"))
    setLoading(false)
  }

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!newTitle.trim()) {
      setFormError("请输入奖品名称")
      return
    }
    if (!newPoints || Number(newPoints) <= 0) {
      setFormError("请输入正确的积分")
      return
    }

    const res = await fetch("/api/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        points_cost: Number(newPoints),
        parent_id: parentId,
        category: newCategory,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setFormError(data.error || "添加失败")
      return
    }

    setNewTitle("")
    setNewPoints("")
    setShowForm(false)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这个奖品吗？")) return
    await fetch("/api/rewards", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    loadData()
  }

  const handleApprove = async (id: string, pointsCost: number) => {
    await fetch("/api/wishlist", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "approved", points_cost: pointsCost }),
    })
    loadData()
  }

  const handleFulfill = async (id: string) => {
    await fetch("/api/wishlist", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "fulfilled" }),
    })
    loadData()
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-400 py-12">加载中...</div>
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-4">奖励管理</h1>

      {/* Tab Switch */}
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as "manage" | "wishes")}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer ${
              tab === t.key ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {t.label}
            {t.key === "wishes" && pending.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "manage" ? (
        <>
          {/* Add Reward Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full py-3 bg-blue-500 text-white font-bold rounded-2xl mb-4 cursor-pointer"
          >
            {showForm ? "取消" : "+ 添加奖品"}
          </button>

          {/* Add Form */}
          {showForm && (
            <form onSubmit={handleAddReward} className="card space-y-3 mb-4">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="奖品名称（如：一个冰淇淋）"
                className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">所需积分</label>
                  <input
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value.replace(/\D/g, ""))}
                    type="number"
                    min={1}
                    placeholder="100"
                    className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">档位</label>
                  <div className="flex gap-2">
                    {["小奖", "中奖", "大奖"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCategory(c)}
                        className={`flex-1 py-3 rounded-2xl text-sm font-medium cursor-pointer ${
                          newCategory === c
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {formError && <p className="text-red-500 text-sm">{formError}</p>}
              <button
                type="submit"
                className="w-full py-3 bg-green-500 text-white font-bold rounded-2xl cursor-pointer"
              >
                确认添加
              </button>
            </form>
          )}

          {/* Rewards List */}
          <div className="space-y-3">
            {rewards.length === 0 ? (
              <div className="card text-center text-gray-400 py-8">
                <p>还没有奖品</p>
                <p className="text-sm mt-1">点击上方按钮添加</p>
              </div>
            ) : (
              rewards.map((r) => (
                <div
                  key={r.id}
                  className="card flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-gray-800">{r.title}</h3>
                    <p className="text-sm text-orange-500 font-medium">{r.points_cost} 积分</p>
                  </div>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-red-400 hover:text-red-600 text-sm cursor-pointer"
                  >
                    删除
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* Wish Approval */}
          {!parentId ? (
            <div className="card">
              <p className="text-gray-700 font-medium">请先登录</p>
              <Link href="/parent" className="text-blue-500 text-sm">去登录</Link>
            </div>
          ) : pending.length === 0 ? (
            <div className="card text-center text-gray-400 py-8">暂无待审批心愿</div>
          ) : (
            <div className="space-y-3">
              {pending.map((wish) => (
                <div key={wish.id} className="card">
                  <h3 className="font-bold text-gray-800">{wish.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{wish.description || "无说明"}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      defaultValue={wish.points_cost}
                      type="number"
                      min={1}
                      className="w-24 p-2 border border-gray-200 rounded-xl"
                      id={`points-${wish.id}`}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`points-${wish.id}`) as HTMLInputElement | null
                        const points = input ? Number(input.value) : wish.points_cost
                        handleApprove(wish.id, points)
                      }}
                      className="bg-green-500 text-white px-3 py-2 rounded-xl text-sm cursor-pointer"
                    >
                      审批上架
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
