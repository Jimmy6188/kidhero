"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getKidSession, setKidSession } from "@/lib/session"

interface KidInfo {
  id: string
  name: string
  avatar: string
  grade: number | null
}

export default function KidEntryPage() {
  const router = useRouter()
  const [kids, setKids] = useState<KidInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [hasParents, setHasParents] = useState(true)
  const [hasKids, setHasKids] = useState(true)

  useEffect(() => {
    const existing = getKidSession()
    if (existing?.id) {
      router.replace("/kid/home")
      return
    }
    loadKids()
  }, [])

  const loadKids = async () => {
    try {
      const res = await fetch("/api/kids/all")
      const data = await res.json()
      setKids(data.kids || [])
      setHasParents(data.hasParents ?? true)
      setHasKids(data.hasKids ?? true)
    } catch {
      setKids([])
    }
    setLoading(false)
  }

  const selectKid = (kid: KidInfo) => {
    setKidSession({
      id: kid.id,
      name: kid.name,
      role: "kid",
      avatar: kid.avatar,
      grade: kid.grade || undefined,
    })
    router.push("/kid/home")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-green-400 p-6">
        <div className="text-5xl mb-4 animate-bounce">🦸‍♂️</div>
        <p className="text-white/80">加载中...</p>
      </div>
    )
  }

  if (kids.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-green-400 p-6">
        <button
          onClick={() => router.push("/")}
          className="absolute top-6 left-6 text-white/60 cursor-pointer"
        >
          ← 返回
        </button>
        <div className="text-6xl mb-4">{hasParents ? "👶" : "👨‍👩‍👦"}</div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {hasParents ? "还没有添加宝贝" : "还没有家长注册"}
        </h1>
        <p className="text-white/70 text-center mb-6">
          {hasParents
            ? "请家长登录后在后台添加宝贝信息"
            : "请先让家长注册账号并添加宝贝信息"}
        </p>
        <button
          onClick={() => router.push("/parent")}
          className="px-8 py-3 bg-white text-blue-500 font-bold rounded-2xl shadow-lg cursor-pointer"
        >
          {hasParents ? "去家长登录" : "去家长注册"}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-green-400 p-6">
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 text-white/60 cursor-pointer"
      >
        ← 返回
      </button>

      <h1 className="text-3xl font-bold text-white mb-2">🦸 小超人成长记</h1>
      <p className="text-white/70 mb-8">选择你是谁？</p>

      <div className="w-full max-w-sm space-y-3">
        {kids.map((kid) => (
          <button
            key={kid.id}
            onClick={() => selectKid(kid)}
            className="w-full flex items-center gap-4 bg-white/90 hover:bg-white rounded-2xl p-4 shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <span className="text-4xl">{kid.avatar || "🦸‍♂️"}</span>
            <div className="text-left flex-1">
              <p className="font-bold text-gray-800 text-lg">{kid.name}</p>
              {kid.grade && (
                <p className="text-sm text-gray-500">
                  {getGradeLabel(kid.grade)}
                </p>
              )}
            </div>
            <span className="text-gray-400">→</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function getGradeLabel(grade: number): string {
  if (grade <= 6) return `小学${grade}年级`
  if (grade <= 9) return `初中${grade - 6}年级`
  return `高中${grade - 9}年级`
}
