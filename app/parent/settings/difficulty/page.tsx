"use client"

import { useState, useEffect } from "react"
import { getParentSession } from "@/lib/session"
import Link from "next/link"
import BackButton from "@/components/shared/BackButton"

export default function DifficultySettingsPage() {
  const [kids, setKids] = useState<{ id: string; name: string; avatar: string }[]>([])
  const [selectedKid, setSelectedKid] = useState<string>("")
  const [mode, setMode] = useState<"auto" | "manual">("auto")
  const [fixedDifficulty, setFixedDifficulty] = useState(3)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const init = () => {
      const parent = getParentSession()
      if (parent?.kids) {
        setKids(parent.kids)
        if (parent.kids.length > 0) {
          setSelectedKid(parent.kids[0].id)
        }
      }
    }
    init()
  }, [])

  useEffect(() => {
    const loadSettings = async () => {
      if (!selectedKid) return
      setLoading(true)
      try {
        const res = await fetch(`/api/settings/difficulty?kid_id=${selectedKid}`)
        const data = await res.json()
        setMode(data.mode || "auto")
        setFixedDifficulty(data.fixed_difficulty || 3)
      } catch (err) {
        console.error("Failed to load settings:", err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [selectedKid])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings/difficulty", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kid_id: selectedKid,
          mode,
          fixed_difficulty: mode === "manual" ? fixedDifficulty : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "保存失败")
        return
      }

      alert("保存成功！")
    } catch (error) {
      alert("保存失败")
    } finally {
      setSaving(false)
    }
  }

  const difficultyLabels = [
    { value: 1, label: "基础巩固", emoji: "⭐", desc: "适合刚入门，建立信心" },
    { value: 2, label: "日常练习", emoji: "⭐⭐", desc: "略低于当前水平，巩固基础" },
    { value: 3, label: "熟练运用", emoji: "⭐⭐⭐", desc: "与当前水平匹配" },
    { value: 4, label: "思维提升", emoji: "⭐⭐⭐⭐", desc: "略高于当前水平，适度挑战" },
    { value: 5, label: "挑战拓展", emoji: "⭐⭐⭐⭐⭐", desc: "高难度，拓展思维" },
  ]

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">📊 出题难度设置</h1>
          <p className="text-sm text-gray-500 mt-1">设置学习出题的难度模式</p>
        </div>
        <BackButton href="/parent/settings" />
      </div>

      {/* 选择孩子 */}
      {kids.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {kids.map(kid => (
            <button
              key={kid.id}
              onClick={() => setSelectedKid(kid.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap cursor-pointer ${
                selectedKid === kid.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <span>{kid.avatar || "👶"}</span>
              <span>{kid.name}</span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : (
        <>
          {/* 难度模式选择 */}
          <div className="space-y-4 mb-8">
            {/* 自动模式 */}
            <div
              className={`card cursor-pointer transition-all ${
                mode === "auto"
                  ? "border-2 border-blue-500 bg-blue-50"
                  : "border-2 border-transparent"
              }`}
              onClick={() => setMode("auto")}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  mode === "auto" ? "border-blue-500" : "border-gray-300"
                }`}>
                  {mode === "auto" && (
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-800">🤖 自动模式（推荐）</p>
                  <p className="text-sm text-gray-500 mt-1">
                    根据孩子最近的答题表现，智能调整难度
                  </p>
                  <div className="mt-2 p-3 bg-gray-50 rounded-xl text-xs text-gray-600">
                    <p>• 正确率 &gt; 85% 且连续答对 5 题 → 自动升级</p>
                    <p>• 正确率 &lt; 50% → 自动降级</p>
                    <p>• 始终保持最适合孩子的难度</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 手动模式 */}
            <div
              className={`card cursor-pointer transition-all ${
                mode === "manual"
                  ? "border-2 border-blue-500 bg-blue-50"
                  : "border-2 border-transparent"
              }`}
              onClick={() => setMode("manual")}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  mode === "manual" ? "border-blue-500" : "border-gray-300"
                }`}>
                  {mode === "manual" && (
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-800">🎯 手动模式</p>
                  <p className="text-sm text-gray-500 mt-1">
                    固定难度，不会根据答题情况自动调整
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 手动难度选择 */}
          {mode === "manual" && (
            <div className="mb-8">
              <h3 className="font-bold text-gray-700 mb-4">选择固定难度</h3>
              <div className="space-y-3">
                {difficultyLabels.map(d => (
                  <div
                    key={d.value}
                    className={`card cursor-pointer transition-all ${
                      fixedDifficulty === d.value
                        ? "border-2 border-orange-500 bg-orange-50"
                        : "border-2 border-transparent"
                    }`}
                    onClick={() => setFixedDifficulty(d.value)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        fixedDifficulty === d.value ? "border-orange-500" : "border-gray-300"
                      }`}>
                        {fixedDifficulty === d.value && (
                          <div className="w-3 h-3 rounded-full bg-orange-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {d.emoji} {d.label}
                        </p>
                        <p className="text-sm text-gray-500">{d.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 保存按钮 */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-blue-500 text-white font-bold text-lg rounded-2xl shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {saving ? "保存中..." : "保存设置"}
          </button>

          {/* 说明 */}
          <div className="card mt-6 bg-yellow-50">
            <h3 className="font-bold text-yellow-800 mb-2">💡 说明</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 每个孩子可以单独设置不同的难度</li>
              <li>• 自动模式会根据答题表现动态调整</li>
              <li>• 手动模式适合有明确学习目标的情况</li>
              <li>• 挑战模式难度 = 设置难度 + 2</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
