"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Smartphone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OTPVerificationFormProps {
  phoneNumber: string
  onViewChange: (view: "login" | "signup" | "forgot-password" | "otp-verification") => void
}

export default function OTPVerificationForm({ phoneNumber, onViewChange }: OTPVerificationFormProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState("")
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      setError("Please enter the complete OTP")
      setLoading(false)
      return
    }

    // Simulate OTP verification (in real app, you'd verify with Firebase)
    setTimeout(() => {
      if (otpCode === "123456") {
        toast({
          title: "Phone Verified!",
          description: "Your phone number has been successfully verified.",
        })
        router.push("/")
      } else {
        setError("Invalid OTP. Please try again.")
      }
      setLoading(false)
    }, 2000)
  }

  const handleResendOtp = async () => {
    setResendLoading(true)
    setError("")

    // Simulate resending OTP
    setTimeout(() => {
      setResendLoading(false)
      setTimeLeft(60)
      setCanResend(false)
      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your phone.",
      })
    }, 2000)
  }

  return (
    <Card className="backdrop-blur-md bg-white/90 border-0 shadow-2xl">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center mb-4">
          <button
            onClick={() => onViewChange("login")}
            className="absolute left-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <Smartphone className="w-8 h-8 text-white" />
            </motion.div>
          </motion.div>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-800">Verify Phone</CardTitle>
        <p className="text-gray-600">
          Enter the 6-digit code sent to <br />
          <strong>{phoneNumber}</strong>
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <form onSubmit={handleVerifyOtp} className="space-y-6">
          {/* OTP Input */}
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg"
                />
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>
          </motion.div>
        </form>

        {/* Resend OTP */}
        <div className="text-center">
          {!canResend ? (
            <p className="text-gray-600 text-sm">
              Resend OTP in <span className="font-semibold text-purple-600">{timeLeft}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
                  Resending...
                </>
              ) : (
                "Resend OTP"
              )}
            </button>
          )}
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Wrong number?{" "}
            <button
              type="button"
              onClick={() => onViewChange("login")}
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              Change phone number
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
