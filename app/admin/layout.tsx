import type React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"

export const metadata: Metadata = {
  title: "TazaTokri Admin Panel",
  description: "Admin panel for TazaTokri - Fresh Farm Products Marketplace",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This is a server component, so we need to check admin status server-side
  // In a real app, you'd use a server-side session or token validation
  // For this example, we'll simulate admin check with a placeholder

  // In production, replace this with proper server-side auth check
  const isAdmin = true // Placeholder for demo

  if (!isAdmin) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
