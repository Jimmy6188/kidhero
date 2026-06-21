"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { setParentSession } from "@/lib/session"
import BackButton from "@/components/shared/BackButton"

const RELATIONSHIPS = ["爸爸", "妈妈", "爷爷", "奶奶", "外公", "外婆", "其他"]

export default function ParentPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "register">("login")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 overflow-auto">
      <div className="mb-6">
        <BackButton href="/" />
      </div>

      <div className="flex flex-col items-center">
        <div className="text-5xl mb-4">👨‍👩‍👦</div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode("login")}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-colors cursor-pointer ${
              mode === "login" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            登录
          </button>
          <button
            onClick={() => setMode("register")}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-colors cursor-pointer ${
              mode === "register" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            注册
          </button>
        </div>

        {mode === "login" ? <LoginForm /> : <RegisterForm />}

        {/* 底部安全距离 */}
        <div className="h-8"></div>
      </div>
    </div>
  )
}

function LoginForm() {
  const router = useRouter()
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [error, setError] = useState("")

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newDigits = [...digits]
    newDigits[index] = value.slice(-1)
    setDigits(newDigits)

    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`)
      nextInput?.focus()
    }

    const pin = newDigits.join("")
    if (pin.length === 6 && !newDigits.includes("")) {
      handleVerify(pin)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerify = async (pin: string) => {
    try {
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin_code: pin }),
      })
      const data = await res.json()

      if (data.success) {
        setParentSession(data.user)
        router.push("/parent/dashboard")
      } else {
        setError("PIN 码错误，请重试")
        setDigits(["", "", "", "", "", ""])
        document.getElementById("pin-0")?.focus()
      }
    } catch {
      setError("网络错误，请重试")
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-gray-500 text-sm">请输入 6 位 PIN 码</p>
      <div className="flex gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            id={`pin-${index}`}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-11 h-14 text-center text-xl font-bold bg-gray-50 border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all caret-blue-500"
          />
        ))}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}

function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [relationship, setRelationship] = useState("妈妈")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [joinMode, setJoinMode] = useState<"create" | "join">("create")
  const [inviteCode, setInviteCode] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("请输入姓名")
      return
    }
    if (pin.length !== 6) {
      setError("PIN 码需要 6 位数字")
      return
    }
    if (pin !== confirmPin) {
      setError("两次输入的 PIN 码不一致")
      return
    }
    if (joinMode === "join" && !inviteCode.trim()) {
      setError("请输入邀请码")
      return
    }

    setLoading(true)
    try {
      // 先注册
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), relationship, pin_code: pin }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || "注册失败")
        setLoading(false)
        return
      }

      // 如果是加入家庭，调用邀请码 API
      if (joinMode === "join" && inviteCode.trim()) {
        const joinRes = await fetch("/api/family/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invite_code: inviteCode.trim().toUpperCase(),
            user_id: data.user.id,
          }),
        })
        const joinData = await joinRes.json()

        if (!joinData.success) {
          setError(joinData.error || "邀请码无效")
          setLoading(false)
          return
        }

        // 更新 session 中的孩子列表
        data.user.kids = joinData.kids
        data.user.family_id = joinData.family_id
      }

      setParentSession(data.user)
      router.push("/parent/dashboard")
    } catch {
      setError("网络错误，请重试")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
      {/* 选择注册模式 */}
      <div>
        <label className="text-sm text-gray-600 mb-2 block">注册方式</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setJoinMode("create")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
              joinMode === "create"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            创建新家庭
          </button>
          <button
            type="button"
            onClick={() => setJoinMode("join")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
              joinMode === "join"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            加入已有家庭
          </button>
        </div>
      </div>

      {/* 加入家庭时显示邀请码输入 */}
      {joinMode === "join" && (
        <div>
          <label className="text-sm text-gray-600 mb-1 block">家庭邀请码</label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="请输入 6 位邀请码"
            maxLength={6}
            className="w-full p-3 bg-gray-50 border-2 border-green-300 rounded-2xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all uppercase tracking-widest text-center font-bold text-lg"
          />
          <p className="text-xs text-gray-400 mt-1">
            请向家庭中的其他家长获取邀请码
          </p>
        </div>
      )}

      <div>
        <label className="text-sm text-gray-600 mb-1 block">您的姓名</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="请输入姓名"
          className="w-full p-3 bg-gray-50 border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all caret-blue-500"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600 mb-1 block">与孩子的关系</label>
        <div className="flex flex-wrap gap-2">
          {RELATIONSHIPS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRelationship(r)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                relationship === r
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-600 mb-1 block">设置 6 位 PIN 码</label>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          placeholder="请输入 PIN 码"
          className="w-full p-3 bg-gray-50 border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all caret-blue-500"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600 mb-1 block">确认 PIN 码</label>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={6}
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
          placeholder="请再次输入 PIN 码"
          className="w-full p-3 bg-gray-50 border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all caret-blue-500"
        />
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 font-bold rounded-2xl transition-colors disabled:opacity-50 cursor-pointer ${
          joinMode === "join"
            ? "bg-green-500 hover:bg-green-600 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {loading ? "注册中..." : joinMode === "join" ? "加入家庭" : "创建家庭"}
      </button>
    </form>
  )
}
