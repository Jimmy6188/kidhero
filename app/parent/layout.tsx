import Navigation from "@/components/shared/Navigation"

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {children}
      <Navigation role="parent" />
    </div>
  )
}