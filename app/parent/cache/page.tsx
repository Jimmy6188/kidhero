"use client"

import { useState, useEffect } from "react"
import {
  ChartBar,
  ArrowsClockwise,
  CheckCircle,
  WarningCircle,
  XCircle,
  Spinner,
} from "@phosphor-icons/react"

interface CacheStatus {
  grade: number
  subject: string
  difficulty: number
  count: number
  target: number
  needed: number
  status: "sufficient" | "low" | "empty"
}

interface CacheSummary {
  totalCombinations: number
  sufficient: number
  low: number
  empty: number
  totalQuestions: number
  totalNeeded: number
  targetTotal: number
}

export default function CachePage() {
  const [summary, setSummary] = useState<CacheSummary | null>(null)
  const [details, setDetails] = useState<CacheStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  // 加载缓存状态
  const loadStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/cache-status")
      const data = await res.json()

      if (res.ok) {
        setSummary(data.summary)
        setDetails(data.details)
      } else {
        setMessage({ type: "error", text: data.error })
      }
    } catch {
      setMessage({ type: "error", text: "加载失败" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  // 触发生成
  const handleGenerate = async (
    grade: number,
    subject: string,
    difficulty: number
  ) => {
    const key = `${grade}-${subject}-${difficulty}`
    setGenerating(key)
    setMessage(null)

    try {
      const res = await fetch("/api/admin/generate-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, subject, difficulty, count: 10 }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({
          type: "success",
          text: `成功生成 ${data.generated} 道题目`,
        })
        loadStatus() // 刷新状态
      } else {
        setMessage({ type: "error", text: data.error })
      }
    } catch {
      setMessage({ type: "error", text: "生成失败" })
    } finally {
      setGenerating(null)
    }
  }

  // 一键补满所有不足的组合
  const handleRefillAll = async () => {
    setGenerating("all")
    setMessage(null)

    try {
      const res = await fetch("/api/admin/refill-cache")
      const data = await res.json()

      if (res.ok) {
        setMessage({
          type: "success",
          text: `补充完成，共生成 ${data.generated} 道题目`,
        })
        loadStatus()
      } else {
        setMessage({ type: "error", text: data.error })
      }
    } catch {
      setMessage({ type: "error", text: "补充失败" })
    } finally {
      setGenerating(null)
    }
  }

  // 学科名称映射
  const subjectNames: Record<string, string> = {
    math: "数学",
    chinese: "语文",
    english: "英语",
  }

  // 难度名称映射
  const difficultyNames: Record<number, string> = {
    3: "熟练",
    4: "提升",
    5: "挑战",
  }

  // 状态图标
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "sufficient":
        return <CheckCircle size={20} className="text-green-500" />
      case "low":
        return <WarningCircle size={20} className="text-yellow-500" />
      case "empty":
        return <XCircle size={20} className="text-red-500" />
      default:
        return null
    }
  }

  // 进度条颜色
  const getProgressColor = (count: number, target: number) => {
    const ratio = count / target
    if (ratio >= 1) return "bg-green-500"
    if (ratio >= 0.5) return "bg-yellow-500"
    return "bg-red-500"
  }

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[60vh]">
        <Spinner size={32} className="animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          📊 题目缓存池管理
        </h1>
        <button
          onClick={loadStatus}
          className="p-2 text-gray-500 hover:text-blue-500"
        >
          <ArrowsClockwise size={20} />
        </button>
      </div>

      {/* 提示信息 */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-xl ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 汇总统计 */}
      {summary && (
        <div className="card mb-6">
          <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <ChartBar size={20} />
            整体状态
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-500">
                {summary.totalQuestions}
              </div>
              <div className="text-xs text-gray-500">当前题目数</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-500">
                {summary.targetTotal}
              </div>
              <div className="text-xs text-gray-500">目标题目数</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="p-2 bg-green-50 rounded-lg">
              <div className="font-bold text-green-600">{summary.sufficient}</div>
              <div className="text-xs text-gray-500">充足</div>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <div className="font-bold text-yellow-600">{summary.low}</div>
              <div className="text-xs text-gray-500">不足</div>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <div className="font-bold text-red-600">{summary.empty}</div>
              <div className="text-xs text-gray-500">为空</div>
            </div>
          </div>

          {/* 一键补满按钮 */}
          {summary.totalNeeded > 0 && (
            <button
              onClick={handleRefillAll}
              disabled={generating !== null}
              className="mt-4 w-full py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              {generating === "all" ? (
                <>
                  <Spinner size={16} className="animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <ArrowsClockwise size={16} />
                  一键补满（缺少 {summary.totalNeeded} 道）
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* 详细列表 */}
      <div className="space-y-4">
        {["math", "chinese", "english"].map((subject) => (
          <div key={subject} className="card">
            <h3 className="font-bold text-gray-700 mb-3">
              {subject === "math" && "🔢"}
              {subject === "chinese" && "📖"}
              {subject === "english" && "🅰️"}
              {" "}{subjectNames[subject]}
            </h3>

            <div className="space-y-3">
              {details
                .filter((d) => d.subject === subject)
                .sort((a, b) => a.grade - b.grade || a.difficulty - b.difficulty)
                .map((item) => {
                  const key = `${item.grade}-${item.subject}-${item.difficulty}`
                  const progress = (item.count / item.target) * 100

                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className="w-16 text-sm text-gray-600">
                        {item.grade}年级
                      </div>
                      <div className="w-12 text-sm text-gray-500">
                        {difficultyNames[item.difficulty]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getProgressColor(
                                item.count,
                                item.target
                              )} transition-all`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-12 text-right">
                            {item.count}/{item.target}
                          </span>
                        </div>
                      </div>
                      <StatusIcon status={item.status} />
                      <button
                        onClick={() =>
                          handleGenerate(item.grade, item.subject, item.difficulty)
                        }
                        disabled={generating !== null}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 disabled:opacity-50"
                      >
                        {generating === key ? (
                          <Spinner size={12} className="animate-spin" />
                        ) : (
                          "+10"
                        )}
                      </button>
                    </div>
                  )
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
