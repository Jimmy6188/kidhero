"use client"

import { useEffect, useState } from "react"
import GrowthChart from "@/components/parent/GrowthChart"
import { GrowthRecord } from "@/lib/types"
import { getActiveKidId } from "@/lib/session"
import Link from "next/link"

export default function GrowthPage() {
  const [records, setRecords] = useState<GrowthRecord[]>([])
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)

  const getKidId = () => getActiveKidId()

  const loadRecords = async () => {
    setLoading(true)
    const res = await fetch(`/api/growth?kid_id=${getKidId()}`)
    const data = await res.json()
    setRecords(data.records || [])
    setLoading(false)
  }

  useEffect(() => {
    loadRecords()
  }, [])

  const handleAdd = async () => {
    if (!height || !weight) return
    if (!getKidId()) return

    const res = await fetch("/api/growth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kid_id: getKidId(),
        height: Number(height),
        weight: Number(weight),
        note: note || null,
        recorded_at: new Date().toISOString(),
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      alert(data.error || "保存失败")
      return
    }

    setRecords((prev) => [...prev, data.record])
    setHeight("")
    setWeight("")
    setNote("")
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-4">成长数据</h1>

      {!getKidId() ? (
        <div className="card">
          <p className="text-gray-700 font-medium">还没有孩子档案</p>
          <p className="text-sm text-gray-500 mt-2 mb-4">先创建孩子档案，再记录成长数据。</p>
          <Link href="/parent/create-kid" className="btn-primary inline-block">
            去创建
          </Link>
        </div>
      ) : null}

      <div className="card mb-5 space-y-3 mt-6">
        <div className="grid grid-cols-2 gap-3">
          <input
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="身高 cm"
            type="number"
            className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="体重 kg"
            type="number"
            className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="备注，例如：换牙、长高了"
          className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button onClick={handleAdd} className="btn-primary w-full">
          添加记录
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">加载中...</div>
      ) : (
        <div className="space-y-4">
          <GrowthChart records={records} type="height" />
          <GrowthChart records={records} type="weight" />
        </div>
      )}
    </div>
  )
}
