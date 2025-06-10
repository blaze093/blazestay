"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, User, Settings, Camera, Mail, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    farmName: "",
    farmSize: "",
    experience: "",
    description: "",
    location: "",
  })

  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Initialize form data with user data
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      farmName: (user as any).farmName || "",
      farmSize: (user as any).farmSize || "",
      experience: (user as any).experience || "",
      description: (user as any).description || "",
      location: (user as any).location || "",
    })

    setImagePreview(user.profileImage || "")
  }, [user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError("")

    try {
      let profileImageURL = user.profileImage

      // Upload new profile image if selected
      if (profileImage) {
        profileImageURL = await uploadToCloudinary(profileImage, "profiles")
      }

      // Update user data in Firestore
      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        profileImage: profileImageURL,
        updatedAt: new Date(),
      }

      // Add seller-specific fields if user is a seller
      if (user.role === "seller") {
        updateData.farmName = formData.farmName
        updateData.farmSize = formData.farmSize
        updateData.experience = formData.experience
        updateData.description = formData.description
        updateData.location = formData.location
      }

      await updateDoc(doc(db, "users", user.uid), updateData)

      toast({
        title: "Profile Updated Successfully!",
        description: "Your profile information has been saved.",
      })

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setError(error.message || "Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-olive mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="settings">Account Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="farm-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and {user.role === "seller" ? "farm" : "account"} details
                </CardDescription>
              </CardHeader>

              <CardContent>
                {error && (
                  <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Profile Image */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-4 border-natural-green/20">
                        <AvatarImage src={imagePreview || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-sunny-yellow text-dark-olive text-2xl">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="profileImage"
                        className="absolute bottom-0 right-0 bg-natural-green text-white p-2 rounded-full cursor-pointer hover:bg-green-600 transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                        <input
                          id="profileImage"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-dark-olive">{user.name}</h3>
                      <p className="text-gray-600">{user.email}</p>
                      <Badge variant="outline" className="mt-1">
                        {user.role === "buyer" ? "🛒 Buyer" : "🌾 Farmer"}
                      </Badge>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="farm-input"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="farm-input"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="farm-input"
                      placeholder="Enter your complete address"
                      rows={3}
                    />
                  </div>

                  {/* Seller-specific fields */}
                  {user.role === "seller" && (
                    <>
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-dark-olive mb-4">Farm Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="farmName">Farm Name</Label>
                            <Input
                              id="farmName"
                              name="farmName"
                              type="text"
                              value={formData.farmName}
                              onChange={handleInputChange}
                              className="farm-input"
                              placeholder="Enter your farm name"
                            />
                          </div>

                          <div>
                            <Label htmlFor="location">Farm Location</Label>
                            <Input
                              id="location"
                              name="location"
                              type="text"
                              value={formData.location}
                              onChange={handleInputChange}
                              className="farm-input"
                              placeholder="City, State"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          <div>
                            <Label htmlFor="farmSize">Farm Size</Label>
                            <Input
                              id="farmSize"
                              name="farmSize"
                              type="text"
                              value={formData.farmSize}
                              onChange={handleInputChange}
                              className="farm-input"
                              placeholder="e.g., 5 acres"
                            />
                          </div>

                          <div>
                            <Label htmlFor="experience">Farming Experience</Label>
                            <Input
                              id="experience"
                              name="experience"
                              type="text"
                              value={formData.experience}
                              onChange={handleInputChange}
                              className="farm-input"
                              placeholder="e.g., 10 years"
                            />
                          </div>
                        </div>

                        <div className="mt-6">
                          <Label htmlFor="description">Farm Description</Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="farm-input"
                            placeholder="Tell customers about your farm, what you grow, and your farming practices..."
                            rows={4}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="farm-button">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Profile"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="farm-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>Manage your account preferences and security settings</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-dark-olive">Account Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-natural-green" />
                      <div>
                        <p className="font-medium">Email Address</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-natural-green" />
                      <div>
                        <p className="font-medium">Member Since</p>
                        <p className="text-sm text-gray-600">{user.createdAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-dark-olive mb-4">Security</h3>

                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>

                    <Button variant="outline" className="w-full justify-start">
                      Two-Factor Authentication
                    </Button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>

                  <div className="space-y-4">
                    <Button variant="destructive" className="w-full">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
