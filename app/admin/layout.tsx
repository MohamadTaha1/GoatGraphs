"use client"

import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen bg-jetblack text-offwhite">
          <AdminSidebar />
          <div className="flex-1 overflow-auto bg-jetblack">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Loading...</span>
                </div>
              }
            >
              <main className="p-6 min-h-screen">{children}</main>
            </Suspense>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
