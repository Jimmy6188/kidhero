"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  ChartBar,
  ArrowsClockwise,
  CheckCircle,
  WarningCircle,
  XCircle,
  Spinner,
  Lightning,
  Stop,
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

interface RefillProgress {
  status: "idle" | "running" | "completed" | "error" | "stopped"
  total: number
  completed: number
  currentCombo: string
  totalGenerated: number
  results: Array<{
    grade: number
    subject: string
    difficulty: number
    generated: number
    success: boolean
    error?: string
  }>
  startedAt?: string
  completedAt?: string
}

export default function CachePage() {
  const [summary, setSummary] = useState<CacheSummary | null>(null)
  const [details, setDetails] = useState<CacheStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info"
    text: string
  } | null>(null)
  const [progress, setProgress] = useState<RefillProgress | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // 加载缓存状态
  const loadStatus = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
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
      if (showLoading) setLoading(false)
    }
  }, [])

  // 查询补充进度
  const checkProgress = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/refill-cache")
      const data = await res.json()
      setProgress(data)

      // 如果完成了，停止轮询并刷新状态
      if (data.status === "completed" || data.status === "error" || data.status === "idle" || data.status === "stopped") {
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
        setGenerating(null)

        if (data.status === "completed" && data.totalGenerated > 0) {
          setMessage({
            type: "success",
            text: `补充完成！共生成 ${data.totalGenerated} 道题目`,
          })
          loadStatus(false) // 刷新状态
        } else if (data.status === "stopped") {
          setMessage({
            type: "info",
            text: `已停止，已生成 ${data.totalGenerated} 道题目`,
          })
          loadStatus(false) // 刷新状态
        } else if (data.status === "error") {
          setMessage({ type: "error", text: data.currentCombo || "补充失败" })
        }
      }
    } catch {
      // 忽略轮询错误
    }
  }, [loadStatus])

  useEffect(() => {
    loadStatus()
    // 检查是否有正在进行的任务
    checkProgress()

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [loadStatus, checkProgress])

  // 开始轮询进度
  const startPolling = useCallback(() => {
    if (pollingRef.current) return
    checkProgress() // 立即查询一次
    pollingRef.current = setInterval(checkProgress, 1500) // 每1.5秒查询一次
  }, [checkProgress])

  // 停止补充
  const handleStop = useCallback(async () => {
    try {
      await fetch("/api/admin/refill-cache", { method: "DELETE" })
      // 轮询会自动检测到 stopped 状态
    } catch {
      setMessage({ type: "error", text: "停止失败" })
    }
  }, [])

  // 触发单个组合生成
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
        loadStatus(false) // 刷新状态
      } else {
        setMessage({ type: "error", text: data.message || data.error })
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
      const res = await fetch("/api/admin/refill-cache", {
        method: "POST",
      })
      const data = await res.json()

      if (res.ok) {
        // 开始轮询进度
        startPolling()
      } else {
        if (data.progress?.status === "running") {
          // 已经在运行，开始轮询
          startPolling()
        } else {
          setMessage({ type: "error", text: data.message || "启动失败" })
          setGenerating(null)
        }
      }
    } catch {
      setMessage({ type: "error", text: "启动失败" })
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

  // 计算进度百分比
  const progressPercent = progress && progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0

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
          onClick={() => loadStatus()}
          disabled={generating !== null}
          className="p-2 text-gray-500 hover:text-blue-500 disabled:opacity-50"
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
              : message.type === "info"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 实时进度面板 */}
      {generating === "all" && progress && progress.status === "running" && (
        <div className="card mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightning size={20} className="text-blue-500 animate-pulse" />
              <h2 className="font-bold text-blue-700">正在补充题目</h2>
            </div>
            <button
              onClick={handleStop}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
            >
              <Stop size={16} />
              停止
            </button>
          </div>

          {/* 进度条 */}
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{progress.currentCombo}</span>
              <span>{progress.completed}/{progress.total}</span>
            </div>
            <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 统计 */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2 bg-white rounded-lg">
              <div className="text-lg font-bold text-blue-500">{progress.totalGenerated}</div>
              <div className="text-xs text-gray-500">已生成题目</div>
            </div>
            <div className="p-2 bg-white rounded-lg">
              <div className="text-lg font-bold text-green-500">
                {progress.results.filter(r => r.success).length}
              </div>
              <div className="text-xs text-gray-500">成功组合</div>
            </div>
          </div>

          {/* 最近完成的结果 */}
          {progress.results.length > 0 && (
            <div className="mt-3 max-h-32 overflow-y-auto">
              {progress.results.slice(-3).reverse().map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1">
                  {r.success ? (
                    <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-red-500 flex-shrink-0" />
                  )}
                  <span className="text-gray-600">
                    {r.grade}年级{subjectNames[r.subject] || r.subject}
                    {r.success ? ` +${r.generated}` : ` 失败`}
                  </span>
                </div>
              ))}
            </div>
          )}
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
              className="mt-4 w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center gap-2 font-bold"
            >
              {generating === "all" ? (
                <>
                  <Spinner size={18} className="animate-spin" />
                  正在补充中... ({progressPercent}%)
                </>
              ) : (
                <>
                  <Lightning size={18} />
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
                  const itemProgress = (item.count / item.target) * 100
                  const isGeneratingThis = generating === key
                  const isRefilling = generating === "all" && progress?.status === "running"

                  // 检查这个组合是否在最近的结果中
                  const recentResult = progress?.results?.find(
                    r => r.grade === item.grade && r.subject === item.subject && r.difficulty === item.difficulty
                  )

                  return (
                    <div key={key} className={`flex items-center gap-3 ${isGeneratingThis ? 'bg-blue-50 p-2 rounded-lg' : ''}`}>
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
                              style={{ width: `${Math.min(itemProgress, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-12 text-right">
                            {item.count}/{item.target}
                          </span>
                        </div>
                      </div>
                      <StatusIcon status={item.status} />

                      {/* 状态指示 */}
                      {isGeneratingThis ? (
                        <div className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg">
                          <Spinner size={12} className="animate-spin" />
                          生成中
                        </div>
                      ) : isRefilling && recentResult ? (
                        <div className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg ${
                          recentResult.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {recentResult.success ? (
                            <>
                              <CheckCircle size={12} />
                              +{recentResult.generated}
                            </>
                          ) : (
                            <>
                              <XCircle size={12} />
                              失败
                            </>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleGenerate(item.grade, item.subject, item.difficulty)
                          }
                          disabled={generating !== null}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 disabled:opacity-50"
                        >
                          +10
                        </button>
                      )}
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