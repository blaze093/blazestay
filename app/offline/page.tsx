"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WifiOff, RefreshCw, Home } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <WifiOff className="h-8 w-8 text-gray-500" />
          </div>
          <CardTitle className="text-xl text-dark-olive">You're Offline</CardTitle>
          <CardDescription>
            It looks like you're not connected to the internet. Some features may not be available.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Don't worry! You can still browse previously loaded content and your app will sync when you're back online.
          </p>

          <div className="space-y-2">
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-natural-green hover:bg-natural-green/90"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Button>
            </Link>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            <p>Tips for better offline experience:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Browse products while online to cache them</li>
              <li>Your cart items are saved locally</li>
              <li>Messages will sync when reconnected</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
