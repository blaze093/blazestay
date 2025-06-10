"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPin, AlertCircle } from "lucide-react"

interface LocationPermissionDialogProps {
  onPermissionGranted: () => void
  onPermissionDenied: () => void
}

export function LocationPermissionDialog({ onPermissionGranted, onPermissionDenied }: LocationPermissionDialogProps) {
  const [open, setOpen] = useState(true)
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied" | "unsupported">("prompt")

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setPermissionState("unsupported")
      return
    }

    // Check if permission is already granted
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          setPermissionState(result.state as "prompt" | "granted" | "denied")

          if (result.state === "granted") {
            onPermissionGranted()
            setOpen(false)
          } else if (result.state === "denied") {
            onPermissionDenied()
            setOpen(false)
          }
        })
        .catch(() => {
          // If permissions API fails, we'll just show the dialog
        })
    }
  }, [onPermissionGranted, onPermissionDenied])

  const handleAllowLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setPermissionState("granted")
        onPermissionGranted()
        setOpen(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        setPermissionState("denied")
        onPermissionDenied()
        setOpen(false)
      },
    )
  }

  const handleDenyLocation = () => {
    setPermissionState("denied")
    onPermissionDenied()
    setOpen(false)
  }

  if (permissionState === "granted") {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="h-5 w-5 text-natural-green mr-2" />
            Enable Location Services
          </DialogTitle>
          <DialogDescription>
            TazaTokri would like to access your location to show you fresh products from nearby farmers.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-start space-x-3">
            <div className="bg-green-50 p-2 rounded-full">
              <MapPin className="h-5 w-5 text-natural-green" />
            </div>
            <div>
              <h4 className="font-medium">Find local fresh produce</h4>
              <p className="text-sm text-gray-500">
                We'll show you products from farmers within 10 km of your location for maximum freshness.
              </p>
            </div>
          </div>

          {permissionState === "unsupported" && (
            <div className="mt-4 p-3 bg-amber-50 rounded-md flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Your browser doesn't support geolocation. You'll see all available products instead.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleDenyLocation}>
            No Thanks
          </Button>
          <Button className="bg-natural-green hover:bg-natural-green/90" onClick={handleAllowLocation}>
            Allow Location Access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
