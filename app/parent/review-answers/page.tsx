"use client"

import { useState, useEffect } from "react"
import { getParentSession } from "@/lib/session"
import Link from "next/link"
import BackButton from "@/components/shared/BackButton"

interface AnswerRecord {
  id: string
  is_correct: boolean
  answered_at: string
  question_cache?: {
    id: string
    subject: string
    type: string
    content: { stem?: string; options?: string[] }
    answer: { correct?: number | string }
    explanation: string
    knowledge_point: string
  }
}

export default function ReviewAnswersPage() {
  const [records, setRecords] = useState<AnswerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedKid, setSelectedKid] = useState<string>("")
  const [kids, setKids] = useState<{ id: string; name: string }[]>([])
  const [showDetail, setShowDetail] = useState<AnswerRecord | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const loadInitialData = () => {
      const parent = getParentSession()
      if (parent?.kids) {
        setKids(parent.kids.map(k => ({ id: k.id, name: k.name })))
        if (parent.kids.length > 0) {
          setSelectedKid(parent.kids[0].id)
        }
      }
    }
    loadInitialData()
  }, [])

  useEffect(() => {
    const loadRecords = async () => {
      if (!selectedKid) return
      setLoading(true)
      try {
        const res = await fetch(`/api/study/review?kid_id=${selectedKid}&limit=100`)
        const data = await res.json()
        setRecords(data.records || [])
      } catch (err) {
        console.error("Failed to load records:", err)
      } finally {
        setLoading(false)
      }
    }
    loadRecords()
  }, [selectedKid])

  const handleToggleResult = async (record: AnswerRecord) => {
    if (updating) return
    setUpdating(record.id)

    try {
      const res = await fetch("/api/study/review", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          record_id: record.id,
          is_correct: !record.is_correct,
          kid_id: selectedKid,
          knowledge_point: record.question_cache?.knowledge_point,
        }),
      })

      if (!res.ok) throw new Error("Failed to update")

      // 更新本地状态
      setRecords(prev =>
        prev.map(r =>
          r.id === record.id ? { ...r, is_correct: !r.is_correct } : r
        )
      )
      setShowDetail(null)
    } catch (error) {
      alert("更新失败")
    } finally {
      setUpdating(null)
    }
  }

  const subjectEmoji = (s?: string) =>
    s === "math" ? "🧮" : s === "chinese" ? "📖" : s === "english" ? "🌍" : "❓"
  const subjectName = (s?: string) =>
    s === "math" ? "数学" : s === "chinese" ? "语文" : s === "english" ? "英语" : "未知"

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "刚刚"
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString("zh-CN")
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">📝 答题审核</h1>
          <p className="text-sm text-gray-500 mt-1">查看答题记录，手动修正错判</p>
        </div>
        <BackButton href="/parent/dashboard" />
      </div>

      {/* 选择孩子 */}
      {kids.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {kids.map(kid => (
            <button
              key={kid.id}
              onClick={() => setSelectedKid(kid.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap cursor-pointer ${
                selectedKid === kid.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {kid.name}
            </button>
          ))}
        </div>
      )}

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-500">{records.length}</div>
          <div className="text-xs text-gray-500">总题数</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-500">
            {records.filter(r => r.is_correct).length}
          </div>
          <div className="text-xs text-gray-500">答对</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-500">
            {records.filter(r => !r.is_correct).length}
          </div>
          <div className="text-xs text-gray-500">答错</div>
        </div>
      </div>

      {/* 答题记录列表 */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p>暂无答题记录</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(record => (
            <div
              key={record.id}
              className={`card cursor-pointer hover:shadow-md transition-shadow ${
                !record.is_correct ? "border-l-4 border-l-red-400" : ""
              }`}
              onClick={() => setShowDetail(record)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xl">
                    {record.is_correct ? "✅" : "❌"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {subjectEmoji(record.question_cache?.subject)}{" "}
                        {subjectName(record.question_cache?.subject)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(record.answered_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {record.question_cache?.content?.stem || "题目内容"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    handleToggleResult(record)
                  }}
                  disabled={updating === record.id}
                  className={`px-3 py-1 rounded-full text-xs cursor-pointer ${
                    record.is_correct
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-green-100 text-green-600 hover:bg-green-200"
                  }`}
                >
                  {updating === record.id
                    ? "..."
                    : record.is_correct
                    ? "改为错"
                    : "改为对"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 详情弹窗 */}
      {showDetail && showDetail.question_cache && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                {showDetail.is_correct ? "✅ 答对" : "❌ 答错"}
              </h2>
              <button
                onClick={() => setShowDetail(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 题目 */}
            <div className="card mb-4">
              <p className="text-gray-800">
                {showDetail.question_cache.content.stem}
              </p>
              {showDetail.question_cache.content.options && (
                <div className="mt-3 space-y-2">
                  {showDetail.question_cache.content.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg text-sm ${
                        i === showDetail.question_cache?.answer?.correct
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}. {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 解析 */}
            <div className="card bg-blue-50 mb-4">
              <p className="text-xs text-blue-600 font-bold mb-1">📖 解析</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {showDetail.question_cache.explanation}
              </p>
            </div>

            {/* 操作按钮 */}
            <button
              onClick={() => handleToggleResult(showDetail)}
              disabled={updating === showDetail.id}
              className={`w-full py-3 font-bold rounded-2xl cursor-pointer ${
                showDetail.is_correct
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              {showDetail.is_correct ? "改为答错" : "改为答对"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
