import Navigation from "@/components/shared/Navigation"

export default function KidLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      {children}
      <Navigation role="kid" />
    </div>
  )
}