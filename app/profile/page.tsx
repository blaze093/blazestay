"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { doc, updateDoc, collection, addDoc, getDocs, deleteDoc, query, where } from "firebase/firestore"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { User, Camera, Mail, Calendar, MapPin, Plus, Edit, Trash2, Lock, Shield, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Address } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"

export default function ProfilePage() {
  const { user, logout } = useAuth()
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
    email: "",
    dateOfBirth: "",
  })

  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressLoading, setAddressLoading] = useState(false)
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressForm, setAddressForm] = useState<Omit<Address, "id" | "createdAt" | "updatedAt">>({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    landmark: "",
    isDefault: false,
  })

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
      email: user.email || "",
      dateOfBirth: (user as any).dateOfBirth || "",
    })

    setImagePreview(user.profileImage || "")

    loadAddresses()
  }, [user, router])

  const loadAddresses = async () => {
    if (!user) return

    setAddressLoading(true)
    try {
      const addressesQuery = query(collection(db, "addresses"), where("userId", "==", user.uid))
      const addressesSnapshot = await getDocs(addressesQuery)
      const addressesList = addressesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Address[]

      setAddresses(addressesList.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)))
    } catch (error) {
      console.error("Error loading addresses:", error)
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      })
    } finally {
      setAddressLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddressFormChange = (field: keyof typeof addressForm, value: string | boolean) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }))
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

  const handleSaveAddress = async () => {
    if (!user) return

    // Validate required fields
    if (
      !addressForm.fullName ||
      !addressForm.phone ||
      !addressForm.street ||
      !addressForm.city ||
      !addressForm.state ||
      !addressForm.pincode
    ) {
      toast({
        title: "Incomplete Address",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setAddressLoading(true)
    try {
      const addressData = {
        ...addressForm,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      if (editingAddress) {
        // Update existing address
        await updateDoc(doc(db, "addresses", editingAddress.id!), {
          ...addressForm,
          updatedAt: new Date(),
        })
        toast({
          title: "Address Updated",
          description: "Your address has been updated successfully",
        })
      } else {
        // Add new address
        await addDoc(collection(db, "addresses"), addressData)
        toast({
          title: "Address Added",
          description: "Your new address has been saved successfully",
        })
      }

      // Reset form and reload addresses
      setAddressForm({
        fullName: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        landmark: "",
        isDefault: false,
      })
      setEditingAddress(null)
      setShowAddressDialog(false)
      loadAddresses()
    } catch (error) {
      console.error("Error saving address:", error)
      toast({
        title: "Error",
        description: "Failed to save address. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAddressLoading(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!addressId) return

    try {
      await deleteDoc(doc(db, "addresses", addressId))
      toast({
        title: "Address Deleted",
        description: "Address has been removed successfully",
      })
      loadAddresses()
    } catch (error) {
      console.error("Error deleting address:", error)
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      })
    }
  }

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!user) return

    try {
      // Remove default from all addresses
      const batch = addresses.map((addr) => updateDoc(doc(db, "addresses", addr.id!), { isDefault: false }))
      await Promise.all(batch)

      // Set new default
      await updateDoc(doc(db, "addresses", addressId), { isDefault: true })

      toast({
        title: "Default Address Updated",
        description: "Your default address has been updated",
      })
      loadAddresses()
    } catch (error) {
      console.error("Error setting default address:", error)
      toast({
        title: "Error",
        description: "Failed to update default address",
        variant: "destructive",
      })
    }
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setAddressForm({
      fullName: address.fullName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
      landmark: address.landmark || "",
      isDefault: address.isDefault || false,
    })
    setShowAddressDialog(true)
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

      setFormData({
        name: updateData.name,
        phone: updateData.phone,
        address: updateData.address,
        farmName: updateData.farmName || "",
        farmSize: updateData.farmSize || "",
        experience: updateData.experience || "",
        description: updateData.description || "",
        location: updateData.location || "",
        email: user.email,
        dateOfBirth: formData.dateOfBirth,
      })

      // Clear profile image selection after successful upload
      if (profileImage) {
        setProfileImage(null)
        setImagePreview(profileImageURL || "")
      }

      toast({
        title: "Profile Updated Successfully!",
        description: "Your profile information has been saved.",
      })
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setError(error.message || "Failed to update profile. Please try again.")
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunny-yellow/10 to-natural-green/10 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-olive mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <Card className="farm-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information, addresses, and account settings</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Personal Information Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-dark-olive border-b pb-2">Personal Details</h3>

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
                      value={formData.name}
                      onChange={handleInputChange}
                      className="farm-input"
                      required
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
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="farm-input"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="farm-input"
                    />
                  </div>
                </div>

                {/* Seller-specific fields */}
                {user.role === "seller" && (
                  <div className="space-y-4 border-t pt-6">
                    <h4 className="text-lg font-medium text-dark-olive">Farm Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="farmName">Farm Name</Label>
                        <Input
                          id="farmName"
                          name="farmName"
                          value={formData.farmName}
                          onChange={handleInputChange}
                          className="farm-input"
                          placeholder="Enter your farm name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="farmSize">Farm Size (acres)</Label>
                        <Input
                          id="farmSize"
                          name="farmSize"
                          type="number"
                          value={formData.farmSize}
                          onChange={handleInputChange}
                          className="farm-input"
                          placeholder="Enter farm size"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="farmDescription">Farm Description</Label>
                        <Textarea
                          id="farmDescription"
                          name="farmDescription"
                          value={formData.farmDescription}
                          onChange={handleInputChange}
                          className="farm-input"
                          placeholder="Describe your farm and farming practices"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button type="submit" className="farm-button" disabled={loading}>
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </div>

            {/* Address Management Section */}
            <div className="space-y-6 border-t pt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-dark-olive">Address Management</h3>
                <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                  <DialogTrigger asChild>
                    <Button
                      className="farm-button"
                      onClick={() => {
                        setEditingAddress(null)
                        setAddressForm({
                          fullName: user.name || "",
                          phone: user.phone || "",
                          street: "",
                          city: "",
                          state: "",
                          pincode: "",
                          country: "India",
                          landmark: "",
                          isDefault: addresses.length === 0,
                        })
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
                      <DialogDescription>
                        {editingAddress ? "Update your address details" : "Add a new delivery address to your account"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="addressFullName">Full Name</Label>
                          <Input
                            id="addressFullName"
                            value={addressForm.fullName}
                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                            className="farm-input"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="addressPhone">Phone Number</Label>
                          <Input
                            id="addressPhone"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            className="farm-input"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="street">Street Address</Label>
                        <Textarea
                          id="street"
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          className="farm-input"
                          placeholder="House/Flat No., Building Name, Street"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            className="farm-input"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            className="farm-input"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pincode">PIN Code</Label>
                          <Input
                            id="pincode"
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                            className="farm-input"
                            pattern="[0-9]{6}"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={addressForm.country}
                            onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                            className="farm-input"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="landmark">Landmark (Optional)</Label>
                        <Input
                          id="landmark"
                          value={addressForm.landmark}
                          onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                          className="farm-input"
                          placeholder="Nearby landmark for easy identification"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isDefault"
                          checked={addressForm.isDefault}
                          onCheckedChange={(checked) => setAddressForm({ ...addressForm, isDefault: !!checked })}
                        />
                        <Label htmlFor="isDefault">Set as default address</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddressDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveAddress} className="farm-button" disabled={addressLoading}>
                        {addressLoading ? "Saving..." : editingAddress ? "Update Address" : "Add Address"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Address List */}
              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No addresses saved yet</p>
                    <p className="text-sm">Add your first address to get started</p>
                  </div>
                ) : (
                  addresses.map((address) => (
                    <Card key={address.id} className={`p-4 ${address.isDefault ? "ring-2 ring-natural-green" : ""}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-dark-olive">{address.fullName}</h4>
                            {address.isDefault && (
                              <Badge variant="secondary" className="bg-natural-green text-white">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{address.phone}</p>
                          <p className="text-sm text-gray-700">
                            {address.street}, {address.city}, {address.state} - {address.pincode}
                          </p>
                          {address.landmark && <p className="text-sm text-gray-600">Near: {address.landmark}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingAddress(address)
                              setAddressForm(address)
                              setShowAddressDialog(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Account Settings Section */}
            <div className="space-y-6 border-t pt-8">
              <h3 className="text-xl font-semibold text-dark-olive">Account Settings</h3>

              {/* Account Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-dark-olive">Account Information</h4>
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
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-dark-olive">Security</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Lock className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Shield className="mr-2 h-4 w-4" />
                    Two-Factor Authentication
                  </Button>
                </div>
              </div>

              {/* Logout */}
              <div className="space-y-4">
                <Button
                  onClick={logout}
                  variant="outline"
                  className="w-full justify-start bg-transparent text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>

              {/* Danger Zone */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h4>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
