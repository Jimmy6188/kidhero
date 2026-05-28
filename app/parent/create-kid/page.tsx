"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { getParentSession, setKidSession, setParentSession } from "@/lib/session"

export default function CreateKidPage() {
  const router = useRouter()
  const [name, setName] = useState("小超人")
  const [grade, setGrade] = useState("3")
  const [birthYear, setBirthYear] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const parent = getParentSession()
    if (!parent?.id) {
      router.replace("/parent")
      return
    }

    setSubmitting(true)
    const res = await fetch("/api/kids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parent_id: parent.id,
        name: name.trim(),
        grade: Number(grade),
        birth_year: birthYear ? Number(birthYear) : null,
      }),
    })
    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) {
      alert(data.error || "创建失败")
      return
    }

    setParentSession({ ...parent, kid_id: data.kid.id })
    setKidSession({
      id: data.kid.id,
      name: data.kid.name,
      role: "kid",
      parent_id: parent.id,
    })
    router.replace("/kid/home")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 p-4">
      <div className="max-w-md mx-auto pt-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">创建孩子档案</h1>
        <p className="text-sm text-gray-500 mb-6">先创建一个孩子账号，后续任务和学习数据都会绑定到这里。</p>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="孩子昵称"
            className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <input
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            type="number"
            min={1}
            max={6}
            placeholder="年级"
            className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <input
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            type="number"
            placeholder="出生年份（可选）"
            className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "创建中..." : "创建并进入孩子主页"}
          </button>
        </form>
      </div>
    </div>
  )
}
