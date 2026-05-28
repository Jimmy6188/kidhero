"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const kidNavItems = [
  { href: "/kid", icon: "🏠", label: "首页" },
  { href: "/kid/tasks", icon: "📋", label: "任务" },
  { href: "/kid/study", icon: "📚", label: "学习" },
  { href: "/kid/map", icon: "🗺️", label: "地图" },
  { href: "/kid/mall", icon: "🛒", label: "商城" },
]

const parentNavItems = [
  { href: "/parent/dashboard", icon: "📊", label: "概览" },
  { href: "/parent/tasks", icon: "📋", label: "任务" },
  { href: "/parent/review", icon: "✅", label: "审核" },
  { href: "/parent/rewards", icon: "🎁", label: "奖励" },
  { href: "/parent/study-report", icon: "📈", label: "学习" },
]

export default function Navigation({ role }: { role: "kid" | "parent" }) {
  const pathname = usePathname()
  const items = role === "kid" ? kidNavItems : parentNavItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-1 flex justify-around items-center z-50">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-col items-center py-2 px-3 rounded-xl transition-colors ${
            pathname === item.href ? "text-blue-500 bg-blue-50" : "text-gray-400"
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-xs mt-0.5">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}