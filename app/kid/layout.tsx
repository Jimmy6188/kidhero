import Navigation from "@/components/shared/Navigation"
import KidAuthGuard from "@/components/shared/KidAuthGuard"

export default function KidLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <KidAuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
        {children}
        <Navigation role="kid" />
      </div>
    </KidAuthGuard>
  )
}
