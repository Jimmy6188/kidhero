"use client"

import { useEffect, useState } from "react"

interface Particle {
  id: number
  x: number
  y: number
  emoji: string
  size: number
  delay: number
  duration: number
}

export default function CelebrationEffect() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const emojis = ["⭐", "🎉", "✨", "💫", "🎊", "🌟", "💎", "🪙"]
    const newParticles: Particle[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      size: 20 + Math.random() * 20,
      delay: Math.random() * 0.8,
      duration: 1.5 + Math.random() * 1.5,
    }))
    setParticles(newParticles)

    const timer = setTimeout(() => setParticles([]), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            fontSize: `${p.size}px`,
            animation: `fall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        >
          {p.emoji}
        </div>
      ))}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}