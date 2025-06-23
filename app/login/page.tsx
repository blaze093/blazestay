"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Sprout, ShoppingCart, Tractor } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("buyer")
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Get user role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        const userRole = userData.role

        // Check if the selected tab matches the user's role
        if (userRole !== activeTab) {
          setError(`This account is registered as a ${userRole}. Please select the correct login type.`)
          setLoading(false)
          return
        }

        toast({
          title: "Login Successful!",
          description: `Welcome back, ${userData.name}!`,
        })

        // Redirect based on role
        if (userRole === "buyer") {
          router.push("/buyer-dashboard")
        } else if (userRole === "seller") {
          router.push("/seller-dashboard")
        }
      } else {
        setError("User data not found. Please contact support.")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Failed to login. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-natural-green p-3 rounded-full">
              <Sprout className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-dark-olive">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your FreshKart account</p>
        </div>

        <Card className="farm-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-dark-olive">Login</CardTitle>
            <CardDescription className="text-center">Choose your account type and sign in</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="buyer" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Buyer
                </TabsTrigger>
                <TabsTrigger value="seller" className="flex items-center gap-2">
                  <Tractor className="h-4 w-4" />
                  Farmer
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buyer">
                <div className="text-center mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <ShoppingCart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-blue-800">Login as a Buyer to purchase fresh produce</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="seller">
                <div className="text-center mb-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <Tractor className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-800">Login as a Farmer to sell your produce</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="farm-input"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="farm-input"
                  placeholder="Enter your password"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full farm-button">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">Don't have an account?</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link href="/signup-buyer" className="flex-1">
                  <Button variant="outline" className="w-full text-sm">
                    Sign up as Buyer
                  </Button>
                </Link>
                <Link href="/signup-seller" className="flex-1">
                  <Button variant="outline" className="w-full text-sm">
                    Sign up as Farmer
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link href="/forgot-password" className="text-sm text-natural-green hover:underline">
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
