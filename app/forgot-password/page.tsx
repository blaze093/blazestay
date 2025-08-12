"use client"

import { useState } from "react"
import ForgotPasswordForm from "@/components/auth/forgot-password-form"
import SplashScreen from "@/components/auth/splash-screen"

export default function ForgotPasswordPage() {
  const [showSplash, setShowSplash] = useState(true)

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs with complex motion */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-full blur-3xl animate-[float_20s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-gradient-to-br from-teal-400/25 to-cyan-500/25 rounded-full blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]" />
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-full blur-3xl animate-[float_30s_ease-in-out_infinite]" />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-green-400/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <ForgotPasswordForm
            onViewChange={(view) => {
              if (view === "login") {
                window.location.href = "/auth"
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
