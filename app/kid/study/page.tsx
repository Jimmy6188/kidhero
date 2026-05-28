"use client"

export default function StudyPage() {
  return (
    <div className="p-4 pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-4">📚 学习中心</h1>

      <div className="space-y-4">
        <a href="/kid/study/daily" className="card block hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="text-4xl">⚔️</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">日常闯关</h3>
              <p className="text-sm text-gray-500">每天 10 题，打怪升级</p>
            </div>
            <div className="text-gray-400">→</div>
          </div>
        </a>

        <a href="/kid/study/errors" className="card block hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="text-4xl">📖</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">纠错本</h3>
              <p className="text-sm text-gray-500">复习错题，巩固知识</p>
            </div>
            <div className="text-gray-400">→</div>
          </div>
        </a>

        <a href="/kid/study/challenge" className="card block hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🏆</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">周末挑战赛</h3>
              <p className="text-sm text-gray-500">限时挑战，额外勋章</p>
            </div>
            <div className="text-gray-400">→</div>
          </div>
        </a>
      </div>
    </div>
  )
}