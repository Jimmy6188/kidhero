import Navigation from "@/components/shared/Navigation"

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <Navigation role="parent" />
    </div>
  )
}