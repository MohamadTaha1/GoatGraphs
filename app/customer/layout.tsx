import type React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import ProtectedRoute from "@/components/protected-route"

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ProtectedRoute requiredRole="customer">
      <div className="flex min-h-screen flex-col">
        <Header />
        {/* Added pt-24 to create space below the fixed header */}
        <main className="flex-1 pt-24">{children}</main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
