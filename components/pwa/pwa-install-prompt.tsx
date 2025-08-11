"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Download, Smartphone } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if already installed
      const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      setIsStandalone(isStandaloneMode || isInWebAppiOS)

      // Check for iOS
      const userAgent = window.navigator.userAgent.toLowerCase()
      setIsIOS(/iphone|ipad|ipod/.test(userAgent))

      // Check if user has dismissed the prompt before
      const dismissed = sessionStorage.getItem("pwa-install-dismissed")

      // Listen for the beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)

        // Only show prompt if not already installed and not dismissed
        if (!isStandaloneMode && !isInWebAppiOS && !dismissed) {
          // Show prompt after a delay
          setTimeout(() => {
            setShowPrompt(true)
          }, 3000)
        }
      }

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

      // Listen for app installed event
      const handleAppInstalled = () => {
        setIsInstalled(true)
        setShowPrompt(false)
        setDeferredPrompt(null)
      }

      window.addEventListener("appinstalled", handleAppInstalled)

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        window.removeEventListener("appinstalled", handleAppInstalled)
      }
    }
  }, [isStandalone]) // Depend on isStandalone to re-evaluate if it changes

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        setIsInstalled(true)
      }

      setShowPrompt(false)
      setDeferredPrompt(null)
    } catch (error) {
      console.error("Error during PWA installation:", error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pwa-install-dismissed", "true")
    }
  }

  // If already installed or prompt is not meant to be shown, return null
  if (isStandalone || !showPrompt) {
    return null
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80"
        >
          <Card className="shadow-lg border-2 border-natural-green/20 bg-gradient-to-r from-cream to-white">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-natural-green rounded-lg flex items-center justify-center mr-3">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-olive">Install TazaTokri</h3>
                    <p className="text-sm text-gray-600">Get the app for a better experience</p>
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

              <div className="flex space-x-2">
                <Button
                  onClick={handleInstallClick}
                  className="flex-1 bg-natural-green text-white hover:bg-natural-green/90"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install
                </Button>
                <Button variant="outline" onClick={handleDismiss} size="sm" className="border-gray-300 bg-transparent">
                  Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
