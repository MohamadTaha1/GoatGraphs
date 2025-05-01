import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import ProtectedRoute from "@/components/protected-route"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute adminOnly>
      <div className="flex min-h-screen bg-charcoal">
        <AdminSidebar />
        <div className="flex-1 md:ml-64 pt-16 md:pt-0">
          <main className="p-2 md:p-4">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
