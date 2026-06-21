"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "@phosphor-icons/react"

interface BackButtonProps {
  label?: string
  href?: string
  onClick?: () => void
  variant?: "default" | "white"
}

export default function BackButton({
  label = "返回",
  href,
  onClick,
  variant = "default"
}: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  const baseClasses = "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
  const variantClasses = variant === "white"
    ? "text-white/70 hover:text-white hover:bg-white/10"
    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      <ArrowLeft size={18} weight="bold" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
