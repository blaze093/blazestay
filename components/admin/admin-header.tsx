"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle, RefreshCw } from "lucide-react"

interface AdminHeaderProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  onRefresh?: () => void
  showRefresh?: boolean
}

export default function AdminHeader({
  title,
  description,
  actionLabel,
  onAction,
  onRefresh,
  showRefresh = false,
}: AdminHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="mt-4 md:mt-0 flex space-x-2">
        {showRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh} className="h-9">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
        {actionLabel && onAction && (
          <Button onClick={onAction} size="sm" className="h-9 bg-dark-olive hover:bg-earthy-brown text-white">
            <PlusCircle className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
