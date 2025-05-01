import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import ProtectedRoute from "@/components/protected-route"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute adminOnly>
      <div className="flex min-h-screen bg-charcoal">
        <div className="fixed h-full">
          <AdminSidebar />
        </div>
        <div className="ml-64 w-[calc(100%-16rem)] pt-0">
          <main>{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
