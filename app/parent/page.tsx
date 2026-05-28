"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ParentLoginPage() {
  const router = useRouter()
  const [digits, setDigits] = useState<string[]>(["", "", "", ""])
  const [error, setError] = useState("")

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newDigits = [...digits]
    newDigits[index] = value.slice(-1)
    setDigits(newDigits)

    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`)
      nextInput?.focus()
    }

    const pin = newDigits.join("")
    if (pin.length === 4 && !newDigits.includes("")) {
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
        localStorage.setItem("parent_user", JSON.stringify(data.user))
        router.push("/parent/dashboard")
      } else {
        setError("PIN 码错误，请重试")
        setDigits(["", "", "", ""])
        document.getElementById("pin-0")?.focus()
      }
    } catch {
      setError("网络错误，请重试")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-6">
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 text-gray-400 cursor-pointer"
      >
        ← 返回
      </button>
      <div className="text-5xl mb-6">👨‍👩‍👦</div>
      <h1 className="text-2xl font-bold text-gray-700 mb-8">家长登录</h1>

      <div className="flex flex-col items-center gap-4">
        <p className="text-gray-500 text-sm">请输入 4 位 PIN 码</p>
        <div className="flex gap-3">
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
              className="w-14 h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
            />
          ))}
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  )
}