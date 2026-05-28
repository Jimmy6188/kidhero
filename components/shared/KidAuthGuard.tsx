"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getKidSession } from "@/lib/session"

export default function KidAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Allow /kid page itself (selection page) without session
    if (pathname === "/kid") {
      setChecked(true)
      return
    }

    const session = getKidSession()
    if (!session?.id) {
      router.replace("/kid")
      return
    }
    setChecked(true)
  }, [pathname])

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-green-50">
        <p className="text-gray-400">加载中...</p>
      </div>
    )
  }

  return <>{children}</>
}
