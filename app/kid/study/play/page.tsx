"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getKidSession } from "@/lib/session"
import BackButton from "@/components/shared/BackButton"
import { ArrowRight } from "@phosphor-icons/react"

interface Question {
  id: string
  type: "choice" | "fill"
  content: {
    stem: string
    options?: string[]
  }
  knowledge_point: string
  difficulty: number
}

interface AnswerResult {
  is_correct: boolean
  correct_answer: number | string
  explanation: string
  points_earned: number
  knowledge_point: string
}

export default function StudyPlayPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const actionRef = useRef<HTMLDivElement>(null)

  const mode = searchParams.get("mode") || "daily"
  const subject = searchParams.get("subject") || "math"

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null)
  const [fillInput, setFillInput] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [score, setScore] = useState({ correct: 0, total: 0, points: 0 })
  const [tipIndex, setTipIndex] = useState(0)

  // 学习小贴士
  const tips = [
    "💡 数学小知识：任何数乘以 0 都等于 0 哦！",
    "📖 古诗接床前明月光的下一句是？疑是地上霜。",
    "🔤 英语单词 apple 是苹果，banana 是香蕉！",
    "🧮 乘法口诀：七八五十六，八八六十四！",
    "📝 写字小技巧：先横后竖，先撇后捺。",
    "🌟 成语故事：画蛇添足告诉我们不要多此一举。",
    "🎯 数学窍门：检查答案可以用反向验证法！",
    "📚 阅读理解：先读题目再读文章，找关键信息。",
    "🌍 English: Cat is 猫, Dog is 狗, Bird is 鸟！",
    "🧠 脑筋急转弯：什么东西越洗越脏？答案：水。",
    "✏️ 作文开头很重要，好的开头能吸引读者。",
    "🔢 分数小知识：1/2 就是一半的意思。",
    "🎋 古诗《悯农》：谁知盘中餐，粒粒皆辛苦。",
    "💡 学习小贴士：每天坚持练习，积少成多！",
    "🎮 学习也可以很有趣，像玩游戏一样闯关！",
  ]

  useEffect(() => {
    let isMounted = true

    const startSession = async () => {
      const kid = getKidSession()
      if (!kid?.id) {
        if (isMounted) router.push("/kid")
        return
      }

      try {
        const res = await fetch("/api/study/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kid_id: kid.id,
            subject,
            mode,
          }),
        })

        if (!res.ok) throw new Error("Failed to start session")

        const data = await res.json()

        // 只有组件还在挂载状态才更新
        if (isMounted) {
          setQuestions(data.questions)
          setSessionId(data.session_id)
        }
      } catch (error) {
        console.error("Failed to start study session:", error)
        if (isMounted) {
          alert("加载题目失败，请重试")
          router.push("/kid/study")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    startSession()

    return () => {
      isMounted = false
    }
  }, [router, subject, mode])

  // 定期更换小贴士
  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length)
    }, 5000) // 每 5 秒更换
    return () => clearInterval(interval)
  }, [loading, tips.length])

  const currentQuestion = questions[currentIndex]

  const handleSelectAnswer = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
  }

  const handleSubmit = async () => {
    if (submitting) return

    const kid = getKidSession()
    if (!kid?.id || !currentQuestion) return

    // 填空题检查输入
    if (currentQuestion.type === "fill" && !fillInput.trim()) {
      return
    }

    setSubmitting(true)

    try {
      const userAnswer =
        currentQuestion.type === "choice" ? selectedAnswer : fillInput.trim()

      const res = await fetch("/api/study/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kid_id: kid.id,
          question_id: currentQuestion.id,
          session_id: sessionId,
          subject,
          user_answer: userAnswer,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setResult(data)
      setShowResult(true)

      // 自动滚动到操作按钮
      setTimeout(() => {
        actionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 100)

      // 更新分数
      setScore((prev) => ({
        correct: prev.correct + (data.is_correct ? 1 : 0),
        total: prev.total + 1,
        points: prev.points + data.points_earned,
      }))
    } catch (error) {
      console.error("Failed to submit answer:", error)
      alert(`提交失败: ${error instanceof Error ? error.message : "未知错误"}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setFillInput("")
      setShowResult(false)
      setResult(null)

      // 滚动到顶部看新题目
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleFinish = () => {
    // 跳转到结果页面
    const params = new URLSearchParams({
      correct: score.correct.toString(),
      total: score.total.toString(),
      points: score.points.toString(),
      subject,
      mode,
    })
    router.push(`/kid/study/result?${params.toString()}`)
  }

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="text-5xl mb-6 animate-bounce">📚</div>
        <p className="text-lg font-bold text-gray-700 mb-2">正在准备题目...</p>
        <p className="text-sm text-gray-500 mb-8">AI 正在为你量身定制练习题</p>

        {/* 学习小贴士 */}
        <div className="w-full max-w-sm">
          <div className="card bg-yellow-50 border-yellow-200">
            <div className="text-xs text-yellow-600 mb-2 font-medium">✨ 学习小知识</div>
            <p className="text-sm text-gray-700 leading-relaxed min-h-[60px] flex items-center">
              {tips[tipIndex]}
            </p>
          </div>
        </div>

        {/* 加载进度提示 */}
        <div className="mt-8 text-xs text-gray-400">
          首次出题需要一些时间，请耐心等待...
        </div>
      </div>
    )
  }

  // 没有题目
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-5xl mb-4">📚</div>
        <p className="text-gray-700 font-bold mb-2">暂无可用题目</p>
        <p className="text-gray-500 text-center mb-4">
          题目需要通过 AI 生成，请家长先配置 AI 模型
        </p>
        <div className="card bg-yellow-50 border-yellow-200 w-full max-w-xs mb-6">
          <p className="text-sm text-yellow-800 font-medium mb-2">⚙️ 配置步骤：</p>
          <ol className="text-xs text-yellow-700 space-y-1 list-decimal list-inside">
            <li>家长登录后进入「系统设置」</li>
            <li>点击「AI 模型配置」</li>
            <li>添加一个 AI 模型（如 DeepSeek、小米 MiMo）</li>
            <li>测试连接成功后保存</li>
          </ol>
        </div>
        <div className="space-y-3 w-full max-w-xs">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-blue-500 text-white font-bold rounded-2xl cursor-pointer"
          >
            🔄 重新尝试
          </button>
          <button
            onClick={() => router.push("/kid/study")}
            className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl cursor-pointer"
          >
            返回学习中心
          </button>
        </div>
      </div>
    )
  }

  // 答题完成
  if (currentIndex >= questions.length) {
    handleFinish()
    return null
  }

  const subjectNames: Record<string, string> = {
    math: "数学",
    chinese: "语文",
    english: "英语",
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      {/* 顶部进度 */}
      <div className="flex items-center justify-between mb-6">
        <BackButton label="退出" href="/kid/study" />
        <div className="text-sm text-gray-500">
          {subjectNames[subject]} · {mode === "review" ? "错题复习" : "每日挑战"}
        </div>
        <div className="text-sm font-bold text-blue-500">
          {score.correct}/{score.total}
        </div>
      </div>

      {/* 进度条 */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* 题号和难度 */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">
          第 {currentIndex + 1}/{questions.length} 题
        </span>
        <span className="text-sm text-orange-500">
          {"⭐".repeat(currentQuestion.difficulty)}
        </span>
      </div>

      {/* 题目 */}
      <div className="card mb-6">
        <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
          {currentQuestion.content.stem}
        </p>
      </div>

      {/* 选项 */}
      {currentQuestion.type === "choice" && currentQuestion.content.options && (
        <div className="space-y-3 mb-6">
          {currentQuestion.content.options.map((option, index) => {
            let bgClass = "bg-white hover:bg-blue-50"
            if (showResult && result) {
              const correctAnswer = typeof result.correct_answer === 'object' && result.correct_answer !== null
                ? (result.correct_answer as Record<string, unknown>).correct
                : result.correct_answer
              if (index === correctAnswer) {
                bgClass = "bg-green-100 border-green-500"
              } else if (index === selectedAnswer && !result.is_correct) {
                bgClass = "bg-red-100 border-red-500"
              }
            } else if (index === selectedAnswer) {
              bgClass = "bg-blue-100 border-blue-500"
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={showResult}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${bgClass}`}
              >
                <span className="font-bold text-gray-500 mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="text-gray-800">{option}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* 填空题输入 */}
      {currentQuestion.type === "fill" && (
        <div className="mb-6">
          <input
            type="text"
            value={fillInput}
            onChange={(e) => setFillInput(e.target.value)}
            disabled={showResult}
            placeholder="输入你的答案..."
            className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 text-lg"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !showResult) {
                handleSubmit()
              }
            }}
          />
        </div>
      )}

      {/* 答案解析 */}
      {showResult && result && (
        <div
          className={`card mb-6 ${
            result.is_correct
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{result.is_correct ? "✅" : "❌"}</span>
            <span
              className={`font-bold ${
                result.is_correct ? "text-green-700" : "text-red-700"
              }`}
            >
              {result.is_correct ? "回答正确！" : "回答错误"}
            </span>
            <span className="text-sm text-orange-500 ml-auto">
              +{result.points_earned} 积分
            </span>
          </div>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {result.explanation}
          </div>
        </div>
      )}

      {/* 操作按钮 - 跟随在内容后面 */}
      <div ref={actionRef} className="mt-6">
        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={
              submitting ||
              (currentQuestion.type === "choice" && selectedAnswer === null) ||
              (currentQuestion.type === "fill" && !fillInput.trim())
            }
            className="w-full py-4 bg-blue-500 text-white font-bold text-lg rounded-2xl shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "提交中..." : "确认答案"}
          </button>
        ) : (
          <button
            onClick={
              currentIndex < questions.length - 1 ? handleNext : handleFinish
            }
            className="w-full py-4 bg-green-500 text-white font-bold text-lg rounded-2xl shadow-lg cursor-pointer"
          >
            {currentIndex < questions.length - 1 ? (
              <span className="flex items-center justify-center gap-2">
                下一题 <ArrowRight size={18} />
              </span>
            ) : "查看成绩"}
          </button>
        )}
      </div>
    </div>
  )
}
