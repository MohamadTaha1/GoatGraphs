import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import ProtectedRoute from "@/components/protected-route"
import { AdminHeader } from "@/components/admin/admin-header"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute adminOnly>
      <div className="flex min-h-screen bg-gradient-to-br from-jetblack to-charcoal">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 overflow-auto">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
          <footer className="py-4 px-6 text-center text-sm text-gold-500/60">
            <p>© {new Date().getFullYear()} Authentic Memorabilia Admin Panel</p>
          </footer>
        </div>
      </div>
    </ProtectedRoute>
  )
}
