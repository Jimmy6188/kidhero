"use client"

import { useState, useEffect } from "react"
import { getActiveKidId } from "@/lib/session"
import Link from "next/link"

interface SubjectStats {
  total: number
  correct: number
  rate: number
}

interface ReportData {
  total_records: number
  subject_stats: Record<string, SubjectStats>
  weak_points: string[]
  unresolved_errors: number
  weekly_trend: { date: string; correct: number; total: number }[]
}

export default function StudyReportPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  const getKidId = () => getActiveKidId()

  useEffect(() => {
    loadReport()
  }, [])

  const loadReport = async () => {
    if (!getKidId()) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/study/report?kid_id=${getKidId()}`)
      const result = await res.json()
      setData(result)
    } catch {
      setData(null)
    }
    setLoading(false)
  }

  const subjectInfo: Record<string, { name: string; emoji: string }> = {
    math: { name: "数学", emoji: "🧮" },
    chinese: { name: "语文", emoji: "📖" },
    english: { name: "英语", emoji: "🌍" },
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-400 py-12">加载中...</div>
  }

  if (!data) {
    if (!getKidId()) {
      return (
        <div className="p-4 pb-24">
          <div className="card">
            <p className="text-gray-700 font-medium">还没有孩子档案</p>
            <p className="text-sm text-gray-500 mt-2 mb-4">先创建孩子档案，再查看学习报告。</p>
            <Link href="/parent/create-kid" className="btn-primary inline-block">
              去创建
            </Link>
          </div>
        </div>
      )
    }
    return <div className="p-4 text-center text-gray-400 py-12">暂无数据</div>
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-4">📊 学习报告</h1>

      {/* 总览 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-800">{data.total_records}</p>
          <p className="text-xs text-gray-500">总答题数</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-800">{data.unresolved_errors}</p>
          <p className="text-xs text-gray-500">待复习</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-800">
            {data.total_records > 0
              ? Math.round(
                  (Object.values(data.subject_stats).reduce((s, v) => s + v.correct, 0) /
                    Math.max(1, Object.values(data.subject_stats).reduce((s, v) => s + v.total, 0))) *
                    100
                )
              : 0}%
          </p>
          <p className="text-xs text-gray-500">总正确率</p>
        </div>
      </div>

      {/* 学科正确率 */}
      <h2 className="text-lg font-bold text-gray-700 mb-3">📈 学科正确率</h2>
      <div className="space-y-3 mb-6">
        {Object.entries(data.subject_stats).map(([subject, stats]) => {
          const info = subjectInfo[subject] || { name: subject, emoji: "📚" }
          return (
            <div key={subject} className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">
                  {info.emoji} {info.name}
                </span>
                <span className="text-sm text-gray-500">
                  {stats.correct}/{stats.total} 题
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    stats.rate >= 80
                      ? "bg-green-400"
                      : stats.rate >= 60
                        ? "bg-yellow-400"
                        : "bg-red-400"
                  }`}
                  style={{ width: `${stats.rate}%` }}
                />
              </div>
              <p className="text-right text-xs text-gray-400 mt-1">{stats.rate}%</p>
            </div>
          )
        })}
      </div>

      {/* 薄弱知识点 */}
      <h2 className="text-lg font-bold text-gray-700 mb-3">⚠️ 薄弱知识点</h2>
      {data.weak_points.length === 0 ? (
        <div className="card text-center text-gray-400 py-4">
          <p>暂无薄弱知识点 🎉</p>
          <p className="text-xs mt-1">数据足够时会自动分析</p>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {data.weak_points.map((point, i) => (
            <div key={i} className="card flex items-center gap-3">
              <span className="text-yellow-500">⚠️</span>
              <p className="text-sm text-gray-700">{point}</p>
            </div>
          ))}
        </div>
      )}

      {/* 学习建议 */}
      <h2 className="text-lg font-bold text-gray-700 mb-3">💡 学习建议</h2>
      <div className="card">
        <ul className="text-sm text-gray-600 space-y-2">
          {data.weak_points.length > 0 ? (
            data.weak_points.slice(0, 3).map((point, i) => (
              <li key={i}>• 建议加强{point.split(":")[1]?.split("(")[0] || point}的练习</li>
            ))
          ) : (
            <>
              <li>• 保持当前学习节奏，继续加油！</li>
              <li>• 可以尝试提高难度挑战</li>
              <li>• 多利用纠错本巩固知识</li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}
