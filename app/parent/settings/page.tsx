"use client"

import Link from "next/link"
import { ChartLineUp, Robot, CaretRight } from "@phosphor-icons/react"

export default function SettingsPage() {
  return (
    <div className="p-4 pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-6">⚙️ 设置</h1>

      <div className="space-y-3">
        <Link
          href="/parent/settings/difficulty"
          className="card block hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <ChartLineUp size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">出题难度</p>
                <p className="text-sm text-gray-500">设置学习出题的难度模式</p>
              </div>
            </div>
            <CaretRight size={16} className="text-gray-400" />
          </div>
        </Link>

        <Link
          href="/parent/settings/llm"
          className="card block hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Robot size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">AI 模型配置</p>
                <p className="text-sm text-gray-500">管理题目生成使用的 AI 模型</p>
              </div>
            </div>
            <CaretRight size={16} className="text-gray-400" />
          </div>
        </Link>
      </div>
    </div>
  )
}
