"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getParentSession, setParentSession, switchKid } from "@/lib/session"

interface KidData {
  id: string
  name: string
  avatar: string
  grade: number | null
  birth_year: number | null
  height: number | null
  weight: number | null
}

function getGradeLabel(grade: number | null): string {
  if (!grade) return "未设置"
  if (grade <= 6) return `小学${grade}年级`
  if (grade <= 9) return `初中${grade - 6}年级`
  return `高中${grade - 9}年级`
}

export default function KidsManagementPage() {
  const router = useRouter()
  const [kids, setKids] = useState<KidData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentKidId, setCurrentKidId] = useState("")

  useEffect(() => {
    const parent = getParentSession()
    if (!parent?.id) {
      router.replace("/parent")
      return
    }
    setCurrentKidId(parent.kid_id || "")
    loadKids(parent.id)
  }, [])

  const loadKids = async (parentId: string) => {
    try {
      const res = await fetch(`/api/kids?parent_id=${parentId}`)
      const data = await res.json()
      setKids(data.kids || [])
    } catch {
      setKids([])
    }
    setLoading(false)
  }

  const handleSwitch = (kidId: string) => {
    switchKid(kidId)
    setCurrentKidId(kidId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 p-4 pb-24">
      <button
        onClick={() => router.push("/parent/dashboard")}
        className="text-gray-400 mb-4 cursor-pointer"
      >
        ← 返回
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">宝贝管理</h1>
        <button
          onClick={() => router.push("/parent/create-kid")}
          className="px-4 py-2 bg-blue-500 text-white text-sm font-bold rounded-xl cursor-pointer"
        >
          + 添加宝贝
        </button>
      </div>

      {kids.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">👶</div>
          <p className="text-gray-500">还没有添加宝贝</p>
          <button
            onClick={() => router.push("/parent/create-kid")}
            className="mt-4 px-6 py-2 bg-blue-500 text-white font-bold rounded-2xl cursor-pointer"
          >
            立即添加
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {kids.map((kid) => (
            <div
              key={kid.id}
              className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-colors ${
                currentKidId === kid.id ? "border-blue-400" : "border-transparent"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{kid.avatar || "🦸‍♂️"}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 text-lg">{kid.name}</h3>
                    {currentKidId === kid.id && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        当前
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{getGradeLabel(kid.grade)}</p>
                  {kid.height && (
                    <p className="text-xs text-gray-400">
                      {kid.height}cm / {kid.weight || "?"}kg
                    </p>
                  )}
                </div>
                {currentKidId !== kid.id && (
                  <button
                    onClick={() => handleSwitch(kid.id)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl cursor-pointer"
                  >
                    切换
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
