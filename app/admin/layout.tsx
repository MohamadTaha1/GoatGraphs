import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminAuthProvider } from "@/components/admin/admin-auth-provider"
import ProtectedRoute from "@/components/protected-route"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <ProtectedRoute adminOnly>
        <div className="flex min-h-screen bg-charcoal">
          <AdminSidebar />
          <div className="flex-1 md:ml-64 pt-16 md:pt-0">
            <main className="p-4 md:p-8">{children}</main>
          </div>
        </div>
      </ProtectedRoute>
    </AdminAuthProvider>
  )
}
