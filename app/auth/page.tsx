"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import LoginForm from "@/components/auth/login-form"
import SignupForm from "@/components/auth/signup-form"
import ForgotPasswordForm from "@/components/auth/forgot-password-form"
import OTPVerificationForm from "@/components/auth/otp-verification-form"
import SplashScreen from "@/components/auth/splash-screen"

type AuthView = "login" | "signup" | "forgot-password" | "otp-verification"

export default function AuthPage() {
  const [currentView, setCurrentView] = useState<AuthView>("login")
  const [showSplash, setShowSplash] = useState(true)
  const [phoneNumber, setPhoneNumber] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleViewChange = (view: AuthView, phone?: string) => {
    if (phone) setPhoneNumber(phone)
    setCurrentView(view)
  }

  if (showSplash) {
    return <SplashScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-10 -left-10 w-40 h-40 bg-green-200/30 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-1/4 -right-20 w-60 h-60 bg-emerald-200/20 rounded-full"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-20 left-1/4 w-80 h-80 bg-teal-200/20 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 30,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      {/* Floating Vegetables */}
      <motion.div
        className="absolute top-20 left-10 text-4xl"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        🥕
      </motion.div>
      <motion.div
        className="absolute top-40 right-20 text-3xl"
        animate={{
          y: [0, -15, 0],
          rotate: [0, -10, 10, 0],
        }}
        transition={{
          duration: 3.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        🥬
      </motion.div>
      <motion.div
        className="absolute bottom-40 left-20 text-3xl"
        animate={{
          y: [0, -25, 0],
          rotate: [0, 15, -15, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
      >
        🍅
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-10 text-4xl"
        animate={{
          y: [0, -20, 0],
          rotate: [0, -15, 15, 0],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        🥒
      </motion.div>

      {/* Main Auth Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <AnimatePresence mode="wait">
          {currentView === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <LoginForm onViewChange={handleViewChange} />
            </motion.div>
          )}
          {currentView === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <SignupForm onViewChange={handleViewChange} />
            </motion.div>
          )}
          {currentView === "forgot-password" && (
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <ForgotPasswordForm onViewChange={handleViewChange} />
            </motion.div>
          )}
          {currentView === "otp-verification" && (
            <motion.div
              key="otp-verification"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <OTPVerificationForm phoneNumber={phoneNumber} onViewChange={handleViewChange} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
