"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getParentSession, setParentSession, setKidSession } from "@/lib/session"

const AVATARS = ["🦸‍♂️", "🧚‍♀️", "🦊", "🐱", "🐰", "🌟", "🐻", "🦋"]

const GRADE_GROUPS = [
  { label: "小学", grades: [1, 2, 3, 4, 5, 6] },
  { label: "初中", grades: [7, 8, 9] },
  { label: "高中", grades: [10, 11, 12] },
]

function getGradeLabel(grade: number): string {
  if (grade <= 6) return `小学${grade}年级`
  if (grade <= 9) return `初中${grade - 6}年级`
  return `高中${grade - 9}年级`
}

export default function CreateKidPage() {
  const router = useRouter()
  const [name, setName] = useState("小超人")
  const [grade, setGrade] = useState(3)
  const [birthYear, setBirthYear] = useState("")
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [avatar, setAvatar] = useState("🦸‍♂️")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("请输入宝贝昵称")
      return
    }

    const parent = getParentSession()
    if (!parent?.id) {
      setError("请先登录家长账号")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/kids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_id: parent.id,
          name: name.trim(),
          grade,
          birth_year: birthYear ? Number(birthYear) : null,
          height: height ? Number(height) : null,
          weight: weight ? Number(weight) : null,
          avatar,
        }),
      })
      const data = await res.json()

      if (data.success) {
        const kid = data.kid
        const kids = parent.kids || []
        setParentSession({
          ...parent,
          kid_id: kid.id,
          kids: [...kids, { id: kid.id, name: kid.name, avatar: kid.avatar }],
        })
        setKidSession({
          id: kid.id,
          name: kid.name,
          role: "kid",
          parent_id: parent.id,
          avatar: kid.avatar,
          grade: kid.grade,
        })
        router.push("/kid/home")
      } else {
        setError(data.error || "添加失败")
      }
    } catch {
      setError("网络错误，请重试")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 p-4">
      <button
        onClick={() => router.back()}
        className="text-gray-400 mb-4 cursor-pointer"
      >
        ← 返回
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">添加宝贝</h1>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
        {/* Avatar Selection */}
        <div>
          <label className="text-sm text-gray-600 mb-2 block">选择头像</label>
          <div className="flex flex-wrap gap-3">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                className={`text-3xl p-2 rounded-2xl transition-all cursor-pointer ${
                  avatar === a
                    ? "bg-blue-100 ring-2 ring-blue-400 scale-110"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">宝贝昵称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Grade */}
        <div>
          <label className="text-sm text-gray-600 mb-2 block">年级</label>
          <div className="space-y-3">
            {GRADE_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-xs text-gray-400 mb-1">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.grades.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                        grade === g
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {g <= 6 ? `${g}年级` : g <= 9 ? `${g - 6}年级` : `${g - 9}年级`}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">当前：{getGradeLabel(grade)}</p>
        </div>

        {/* Birth Year */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">出生年份（选填）</label>
          <input
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="如 2017"
            min={2000}
            max={2025}
            className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Height & Weight */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">身高/cm（选填）</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="如 130"
              min={50}
              max={200}
              step="0.1"
              className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">体重/kg（选填）</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="如 28"
              min={10}
              max={100}
              step="0.1"
              className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? "添加中..." : "添加宝贝"}
        </button>
      </form>
    </div>
  )
}
