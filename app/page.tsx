"use client"

import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-green-400 p-6">
      <h1 className="text-4xl font-bold text-white mb-2">🦸 小超人成长记</h1>
      <p className="text-white/80 mb-12 text-lg">你是谁？</p>

      <div className="flex flex-col gap-6 w-full max-w-xs">
        <button
          onClick={() => router.push("/kid")}
          className="bg-yellow-400 hover:bg-yellow-300 text-gray-800 font-bold text-2xl py-8 rounded-3xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3 cursor-pointer"
        >
          <span className="text-4xl">🦸‍♂️</span>
          <span>我是小超人</span>
        </button>

        <button
          onClick={() => router.push("/parent")}
          className="bg-white hover:bg-gray-50 text-gray-700 font-bold text-2xl py-8 rounded-3xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3 cursor-pointer"
        >
          <span className="text-4xl">👨‍👩‍👦</span>
          <span>我是家长</span>
        </button>
      </div>
    </div>
  )
}