"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Download, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if running in standalone mode
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches)

    // Check if iOS
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show install prompt after a delay if not already installed
      setTimeout(() => {
        if (!isStandalone) {
          setShowInstallPrompt(true)
        }
      }, 3000)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [isStandalone])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem("pwa-prompt-dismissed", "true")
  }

  // Don't show if already installed, dismissed, or no prompt available
  if (
    isStandalone ||
    sessionStorage.getItem("pwa-prompt-dismissed") ||
    (!deferredPrompt && !isIOS) ||
    !showInstallPrompt
  ) {
    return null
  }

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <Card className="bg-white shadow-lg border-2 border-natural-green">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-natural-green p-2 rounded-full">
                <Smartphone className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm text-natural-green">Install TazaTokri</CardTitle>
                <CardDescription className="text-xs">Get the app experience</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-6 w-6 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-gray-600 mb-3">
            Install TazaTokri app for faster access, offline browsing, and push notifications.
          </p>

          {deferredPrompt ? (
            <Button
              onClick={handleInstallClick}
              className="w-full bg-natural-green hover:bg-natural-green/90 text-white text-sm py-2"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
          ) : isIOS ? (
            <div className="text-xs text-gray-600">
              <p className="mb-2">To install on iOS:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Tap the Share button</li>
                <li>Select "Add to Home Screen"</li>
                <li>Tap "Add"</li>
              </ol>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
