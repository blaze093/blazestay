"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { uploadToCloudinary } from "@/lib/cloudinary"
import type { Product } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Package, Plus, Edit, Trash2, Search, Star, Eye, Upload, Loader2, ArrowLeft, Leaf } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

const categories = [
  "All Categories",
  "Vegetables",
  "Fruits",
  "Grains & Cereals",
  "Dairy Products",
  "Herbs & Spices",
  "Pulses & Legumes",
  "Nuts & Seeds",
  "Organic Products",
]

const units = ["kg", "gram", "piece", "dozen", "liter", "bunch", "packet"]

export default function SellerProductsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    unit: "",
    location: "",
    isOrganic: false,
    harvestDate: "",
  })
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string>("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "seller") {
      router.push("/buyer-dashboard")
      return
    }

    fetchProducts()
  }, [user, router])

  useEffect(() => {
    applyFilters()
  }, [products, searchTerm, selectedCategory])

  const fetchProducts = async () => {
    if (!user) return

    try {
      const productsQuery = query(collection(db, "products"), where("sellerId", "==", user.uid))
      const productsSnapshot = await getDocs(productsQuery)
      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        harvestDate: doc.data().harvestDate?.toDate(),
      })) as Product[]

      // Sort by creation date (newest first)
      const sortedProducts = productsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      setProducts(sortedProducts)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...products]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      unit: product.unit,
      location: product.location,
      isOrganic: product.isOrganic,
      harvestDate: product.harvestDate ? product.harvestDate.toISOString().split("T")[0] : "",
    })
    setEditImagePreview(product.imageURL)
    setEditImageFile(null)
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSelectChange = (name: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct || !user) return

    setEditLoading(true)

    try {
      let imageURL = editingProduct.imageURL

      // Upload new image if selected
      if (editImageFile) {
        imageURL = await uploadToCloudinary(editImageFile, "products")
      }

      // Update product data
      const updateData = {
        name: editFormData.name,
        description: editFormData.description,
        price: Number.parseFloat(editFormData.price),
        category: editFormData.category,
        stock: Number.parseInt(editFormData.stock),
        unit: editFormData.unit,
        location: editFormData.location,
        isOrganic: editFormData.isOrganic,
        harvestDate: editFormData.harvestDate ? new Date(editFormData.harvestDate) : null,
        imageURL,
        updatedAt: new Date(),
      }

      await updateDoc(doc(db, "products", editingProduct.id), updateData)

      // Update local state
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id ? { ...p, ...updateData, harvestDate: updateData.harvestDate } : p,
        ),
      )

      setEditingProduct(null)
      toast({
        title: "Product Updated",
        description: "Your product has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    setDeleteLoading(productId)

    try {
      await deleteDoc(doc(db, "products", productId))

      // Update local state
      setProducts(products.filter((p) => p.id !== productId))

      toast({
        title: "Product Deleted",
        description: "Your product has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(null)
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-cream p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-12 w-full max-w-md" />
            <Skeleton className="h-12 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/seller-dashboard">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-natural-green mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-dark-olive mb-2">My Products</h1>
              <p className="text-gray-600">Manage your product listings</p>
            </div>
            <Link href="/seller-dashboard/add-product">
              <Button className="farm-button">
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search your products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 farm-input"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px] farm-input">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="farm-card text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-dark-olive mb-2">
                {products.length === 0 ? "No products listed yet" : "No products found"}
              </h3>
              <p className="text-gray-600 mb-6">
                {products.length === 0
                  ? "Start by adding your first product to reach customers"
                  : "Try adjusting your search or filter criteria"}
              </p>
              {products.length === 0 && (
                <Link href="/seller-dashboard/add-product">
                  <Button className="farm-button">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Product
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="farm-card overflow-hidden">
                  <div className="relative">
                    <Image
                      src={product.imageURL || "/placeholder.svg?height=200&width=300"}
                      alt={product.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    {product.isOrganic && (
                      <Badge className="absolute top-2 left-2 bg-natural-green text-white">
                        <Leaf className="h-3 w-3 mr-1" /> Organic
                      </Badge>
                    )}
                    <Badge
                      className={`absolute top-2 right-2 text-xs ${
                        product.stock > 10 ? "bg-green-500" : product.stock > 0 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                    >
                      {product.stock} left
                    </Badge>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-dark-olive mb-1">{product.name}</h3>

                    <div className="flex items-center justify-between mb-2">
                      <div className="text-natural-green font-bold">
                        ₹{product.price}/{product.unit}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm">{product.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-3">
                      {product.reviewCount} reviews • Created {product.createdAt.toLocaleDateString()}
                    </p>

                    <div className="flex space-x-2">
                      <Link href={`/products/${product.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                            <DialogDescription>Update your product information and pricing</DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            {/* Product Image */}
                            <div>
                              <Label htmlFor="editImage">Product Image</Label>
                              <div className="mt-2">
                                <div className="flex items-center justify-center w-full">
                                  <label
                                    htmlFor="editImage"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                                  >
                                    {editImagePreview ? (
                                      <img
                                        src={editImagePreview || "/placeholder.svg"}
                                        alt="Preview"
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    ) : (
                                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-6 h-6 mb-2 text-gray-500" />
                                        <p className="text-xs text-gray-500">Click to change image</p>
                                      </div>
                                    )}
                                    <input
                                      id="editImage"
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={handleEditImageChange}
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="editName">Product Name</Label>
                                <Input
                                  id="editName"
                                  name="name"
                                  value={editFormData.name}
                                  onChange={handleEditInputChange}
                                  className="farm-input"
                                />
                              </div>
                              <div>
                                <Label htmlFor="editCategory">Category</Label>
                                <Select
                                  value={editFormData.category}
                                  onValueChange={(value) => handleEditSelectChange("category", value)}
                                >
                                  <SelectTrigger className="farm-input">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.slice(1).map((category) => (
                                      <SelectItem key={category} value={category}>
                                        {category}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Description */}
                            <div>
                              <Label htmlFor="editDescription">Description</Label>
                              <Textarea
                                id="editDescription"
                                name="description"
                                value={editFormData.description}
                                onChange={handleEditInputChange}
                                className="farm-input"
                                rows={3}
                              />
                            </div>

                            {/* Price and Stock */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor="editPrice">Price (₹)</Label>
                                <Input
                                  id="editPrice"
                                  name="price"
                                  type="number"
                                  step="0.01"
                                  value={editFormData.price}
                                  onChange={handleEditInputChange}
                                  className="farm-input"
                                />
                              </div>
                              <div>
                                <Label htmlFor="editUnit">Unit</Label>
                                <Select
                                  value={editFormData.unit}
                                  onValueChange={(value) => handleEditSelectChange("unit", value)}
                                >
                                  <SelectTrigger className="farm-input">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {units.map((unit) => (
                                      <SelectItem key={unit} value={unit}>
                                        {unit}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="editStock">Stock</Label>
                                <Input
                                  id="editStock"
                                  name="stock"
                                  type="number"
                                  value={editFormData.stock}
                                  onChange={handleEditInputChange}
                                  className="farm-input"
                                />
                              </div>
                            </div>

                            {/* Location and Harvest Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="editLocation">Location</Label>
                                <Input
                                  id="editLocation"
                                  name="location"
                                  value={editFormData.location}
                                  onChange={handleEditInputChange}
                                  className="farm-input"
                                />
                              </div>
                              <div>
                                <Label htmlFor="editHarvestDate">Harvest Date</Label>
                                <Input
                                  id="editHarvestDate"
                                  name="harvestDate"
                                  type="date"
                                  value={editFormData.harvestDate}
                                  onChange={handleEditInputChange}
                                  className="farm-input"
                                />
                              </div>
                            </div>

                            {/* Organic Checkbox */}
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="editIsOrganic"
                                checked={editFormData.isOrganic}
                                onCheckedChange={(checked) =>
                                  setEditFormData((prev) => ({ ...prev, isOrganic: checked as boolean }))
                                }
                              />
                              <Label htmlFor="editIsOrganic" className="text-sm">
                                🌿 This is an organic product
                              </Label>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingProduct(null)} disabled={editLoading}>
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateProduct} disabled={editLoading} className="farm-button">
                              {editLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                "Update Product"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            disabled={deleteLoading === product.id}
                          >
                            {deleteLoading === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{product.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProduct(product.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
