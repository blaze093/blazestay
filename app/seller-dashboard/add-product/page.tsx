"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Upload, MapPin, X, ImageIcon, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { geocodeAddress } from "@/lib/location-utils"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const GOOGLE_MAPS_API_KEY = "AIzaSyACv7Y5LtG_ixVdSyVFnCTZFX6RSo1W9QI"

const categories = [
  "Vegetables",
  "Fruits",
  "Grains & Cereals",
  "Dairy Products",
  "Herbs & Spices",
  "Pulses & Legumes",
  "Nuts & Seeds",
  "Organic Products",
]

const units = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "piece", label: "Piece" },
  { value: "dozen", label: "Dozen" },
  { value: "bundle", label: "Bundle" },
  { value: "liter", label: "Liter (L)" },
  { value: "ml", label: "Milliliter (ml)" },
  { value: "box", label: "Box" },
  { value: "bag", label: "Bag" },
]

export default function AddProductPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    unit: "kg",
    isOrganic: false,
    harvestDate: "",
    location: "",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [geocodingError, setGeocodingError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (user.role !== "seller") {
      router.push("/")
    }
  }, [user, router])

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!formData.name.trim()) errors.name = "Product name is required"
    if (!formData.description.trim()) errors.description = "Description is required"
    if (!formData.price || Number.parseFloat(formData.price) <= 0) errors.price = "Valid price is required"
    if (!formData.category) errors.category = "Category is required"
    if (!formData.stock || Number.parseInt(formData.stock) <= 0) errors.stock = "Valid stock quantity is required"
    if (!formData.location.trim()) errors.location = "Location is required"
    if (!imageFile) errors.image = "Product image is required"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user selects
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Clear previous upload error
      setUploadError(null)

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image file",
          variant: "destructive",
        })
        return
      }

      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))

      // Clear image error
      if (formErrors.image) {
        setFormErrors((prev) => ({ ...prev, image: "" }))
      }
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setUploadError(null)
    // Reset file input
    const fileInput = document.getElementById("image-upload") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setGeocodingError(null)
    setUploadError(null)

    try {
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to add a product",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Upload image to Cloudinary via our API route
      setUploadingImage(true)
      let imageURL = ""

      try {
        imageURL = await uploadToCloudinary(imageFile!, "products")
        setUploadingImage(false)

        toast({
          title: "Image Uploaded",
          description: "Product image uploaded successfully",
        })
      } catch (error) {
        setUploadingImage(false)
        console.error("Error uploading image:", error)

        const errorMessage = error instanceof Error ? error.message : "Failed to upload image"
        setUploadError(errorMessage)

        toast({
          title: "Upload Failed",
          description: errorMessage,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Get coordinates from location
      let coordinates = null
      try {
        const geocodeResult = await geocodeAddress(formData.location, GOOGLE_MAPS_API_KEY)
        coordinates = {
          latitude: geocodeResult.lat,
          longitude: geocodeResult.lng,
        }
      } catch (error) {
        console.error("Error geocoding address:", error)
        setGeocodingError(
          "Could not find coordinates for this location. The product will be added without location data.",
        )
        // Continue without coordinates
      }

      // Add product to Firestore
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number.parseFloat(formData.price),
        category: formData.category,
        imageURL,
        sellerId: user.uid,
        sellerName: user.name,
        sellerEmail: user.email,
        stock: Number.parseInt(formData.stock),
        unit: formData.unit,
        isOrganic: formData.isOrganic,
        harvestDate: formData.harvestDate ? new Date(formData.harvestDate) : null,
        location: formData.location.trim(),
        coordinates: coordinates,
        rating: 0,
        reviewCount: 0,
        totalSold: 0,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "products"), productData)

      toast({
        title: "Success! 🎉",
        description: "Product added successfully and is now live",
      })

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        unit: "kg",
        isOrganic: false,
        harvestDate: "",
        location: "",
      })
      setImageFile(null)
      setImagePreview(null)
      setFormErrors({})
      setUploadError(null)

      // Navigate to products page after a short delay
      setTimeout(() => {
        router.push("/seller-dashboard/products")
      }, 2000)
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setUploadingImage(false)
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-natural-green" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-natural-green/5 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="farm-card shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-dark-olive flex items-center justify-center">
                <ImageIcon className="mr-3 h-8 w-8 text-natural-green" />
                Add New Product
              </CardTitle>
              <CardDescription className="text-lg">
                List your fresh farm products for customers to purchase
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Upload Error</AlertTitle>
                  <AlertDescription>
                    {uploadError}
                    <Button variant="outline" size="sm" className="ml-2 mt-2" onClick={() => setUploadError(null)}>
                      Dismiss
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                  {/* Product Image */}
                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-lg font-semibold">
                      Product Image *
                    </Label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-natural-green/30 rounded-lg p-8 bg-gradient-to-br from-natural-green/5 to-transparent hover:border-natural-green/50 transition-colors">
                      <AnimatePresence mode="wait">
                        {imagePreview ? (
                          <motion.div
                            key="preview"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative w-full max-w-md"
                          >
                            <img
                              src={imagePreview || "/placeholder.svg"}
                              alt="Preview"
                              className="w-full h-64 object-cover rounded-lg shadow-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={removeImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1">
                              <span className="text-sm font-medium text-natural-green flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Image Ready
                              </span>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="upload"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-center"
                          >
                            <Upload className="mx-auto h-16 w-16 text-natural-green/60 mb-4" />
                            <div className="mb-4">
                              <Label
                                htmlFor="image-upload"
                                className="cursor-pointer bg-natural-green hover:bg-natural-green/90 text-white px-6 py-3 rounded-md font-semibold transition-colors inline-flex items-center"
                              >
                                <Upload className="h-5 w-5 mr-2" />
                                Choose Image
                              </Label>
                              <Input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                              />
                            </div>
                            <p className="text-sm text-gray-500">
                              PNG, JPG, GIF up to 5MB
                              <br />
                              Recommended: 800x600px or higher
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {formErrors.image && <p className="text-red-500 text-sm mt-1">{formErrors.image}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Product Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-lg font-semibold">
                          Product Name *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Fresh Organic Tomatoes"
                          required
                          className={`farm-input text-lg ${formErrors.name ? "border-red-500" : ""}`}
                        />
                        {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                      </div>

                      {/* Price and Unit */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price" className="text-lg font-semibold">
                            Price (₹) *
                          </Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                            className={`farm-input text-lg ${formErrors.price ? "border-red-500" : ""}`}
                          />
                          {formErrors.price && <p className="text-red-500 text-sm">{formErrors.price}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unit" className="text-lg font-semibold">
                            Unit *
                          </Label>
                          <Select
                            value={formData.unit}
                            onValueChange={(value) => handleSelectChange("unit", value)}
                            required
                          >
                            <SelectTrigger className="farm-input text-lg">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Category and Stock */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-lg font-semibold">
                            Category *
                          </Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => handleSelectChange("category", value)}
                            required
                          >
                            <SelectTrigger
                              className={`farm-input text-lg ${formErrors.category ? "border-red-500" : ""}`}
                            >
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.category && <p className="text-red-500 text-sm">{formErrors.category}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stock" className="text-lg font-semibold">
                            Stock Quantity *
                          </Label>
                          <Input
                            id="stock"
                            name="stock"
                            type="number"
                            value={formData.stock}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            required
                            className={`farm-input text-lg ${formErrors.stock ? "border-red-500" : ""}`}
                          />
                          {formErrors.stock && <p className="text-red-500 text-sm">{formErrors.stock}</p>}
                        </div>
                      </div>

                      {/* Organic Switch */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-natural-green/5">
                          <div>
                            <Label htmlFor="isOrganic" className="text-lg font-semibold">
                              Organic Product
                            </Label>
                            <p className="text-sm text-gray-600">Mark if your product is certified organic</p>
                          </div>
                          <Switch
                            id="isOrganic"
                            checked={formData.isOrganic}
                            onCheckedChange={(checked) => handleSwitchChange("isOrganic", checked)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-lg font-semibold">
                          Description *
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Describe your product in detail..."
                          required
                          className={`farm-input min-h-[120px] text-lg ${formErrors.description ? "border-red-500" : ""}`}
                        />
                        {formErrors.description && <p className="text-red-500 text-sm">{formErrors.description}</p>}
                      </div>

                      {/* Location */}
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-lg font-semibold">
                          Farm Location *
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-natural-green h-5 w-5" />
                          <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. Gurugram, Haryana, India"
                            required
                            className={`farm-input pl-12 text-lg ${formErrors.location ? "border-red-500" : ""}`}
                          />
                        </div>
                        <p className="text-sm text-gray-600">
                          Enter your farm's location to help customers find local products
                        </p>
                        {formErrors.location && <p className="text-red-500 text-sm">{formErrors.location}</p>}
                        {geocodingError && <p className="text-amber-600 text-sm">{geocodingError}</p>}
                      </div>

                      {/* Harvest Date */}
                      <div className="space-y-2">
                        <Label htmlFor="harvestDate" className="text-lg font-semibold">
                          Harvest Date
                        </Label>
                        <Input
                          id="harvestDate"
                          name="harvestDate"
                          type="date"
                          value={formData.harvestDate}
                          onChange={handleChange}
                          className="farm-input text-lg"
                        />
                        <p className="text-sm text-gray-600">When was this product harvested? (Optional)</p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <CardFooter className="px-0 pt-8">
                    <Button
                      type="submit"
                      className="w-full farm-button text-lg py-6"
                      disabled={loading || uploadingImage}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {uploadingImage ? "Uploading Image..." : "Adding Product..."}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Add Product to Store
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
