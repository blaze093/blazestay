"use client"

import { useState, useEffect } from "react"
import { collection, query, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, ShoppingCart, Heart, Star, MapPin, Leaf } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useWishlist } from "@/lib/wishlist-context"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/components/ui/use-toast"

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [organicOnly, setOrganicOnly] = useState(false)
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { addToCart, isInCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [products, searchTerm, selectedCategory, priceRange, organicOnly, sortBy])

  const fetchProducts = async () => {
    try {
      const productsQuery = query(collection(db, "products"))
      const productsSnapshot = await getDocs(productsQuery)
      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        harvestDate: doc.data().harvestDate?.toDate(),
      })) as Product[]

      setProducts(productsData)
    } catch (error) {
      console.error("Error fetching products:", error)
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

    // Price range filter
    filtered = filtered.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1])

    // Organic filter
    if (organicOnly) {
      filtered = filtered.filter((product) => product.isOrganic)
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      default:
        break
    }

    setFilteredProducts(filtered)
  }

  const maxPrice = Math.max(...products.map((product) => product.price), 1000)

  if (loading) {
    return (
      <div className="min-h-screen bg-cream p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-12 w-full max-w-md" />
            <Skeleton className="h-12 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-dark-olive mb-2">Fresh Farm Products</h1>
          <p className="text-gray-600">Browse our selection of fresh produce directly from local farmers</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 farm-input"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] farm-input">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="farm-input" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <Card className="mt-4 p-4">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Category Filter */}
                  <div>
                    <h3 className="font-medium mb-2">Category</h3>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="farm-input">
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
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <h3 className="font-medium mb-2">
                      Price Range (₹{priceRange[0]} - ₹{priceRange[1]})
                    </h3>
                    <Slider
                      value={priceRange}
                      min={0}
                      max={maxPrice}
                      step={10}
                      onValueChange={setPriceRange}
                      className="my-4"
                    />
                  </div>

                  {/* Organic Filter */}
                  <div>
                    <h3 className="font-medium mb-2">Product Type</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="organic"
                        checked={organicOnly}
                        onCheckedChange={(checked) => setOrganicOnly(checked as boolean)}
                      />
                      <label
                        htmlFor="organic"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        🌿 Organic Products Only
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("All Categories")
                      setPriceRange([0, maxPrice])
                      setOrganicOnly(false)
                      setSortBy("newest")
                    }}
                  >
                    Reset Filters
                  </Button>
                  <Button onClick={() => setShowFilters(false)}>Apply</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="farm-card text-center py-12">
            <CardContent>
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-dark-olive mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("All Categories")
                  setPriceRange([0, maxPrice])
                  setOrganicOnly(false)
                }}
                className="farm-button"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="farm-card overflow-hidden hover:shadow-xl transition-all">
                <div className="relative">
                  <Link href={`/products/${product.id}`}>
                    <Image
                      src={product.imageURL || "/placeholder.svg?height=200&width=300"}
                      alt={product.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                  </Link>
                  {product.isOrganic && (
                    <Badge className="absolute top-2 left-2 bg-natural-green text-white">
                      <Leaf className="h-3 w-3 mr-1" /> Organic
                    </Badge>
                  )}
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white h-8 w-8"
                    onClick={() => {
                      if (isInWishlist(product.id)) {
                        removeFromWishlist(product.id)
                      } else {
                        addToWishlist(product)
                      }
                    }}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current text-red-500" : ""}`} />
                  </Button>
                </div>

                <CardContent className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-dark-olive hover:text-natural-green transition-colors mb-1">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between mb-2">
                    <div className="text-natural-green font-bold">
                      ₹{product.price}/{product.unit}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm">{product.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <MapPin className="h-3 w-3 mr-1" />
                    {product.location}
                    <span className="mx-2">•</span>
                    <span>By {product.sellerName}</span>
                  </div>

                  <Button
                    className="w-full farm-button"
                    onClick={() => {
                      addToCart(product)
                      toast({
                        title: "Added to Cart",
                        description: `${product.name} has been added to your cart`,
                      })
                    }}
                    disabled={product.stock === 0 || isInCart(product.id)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {product.stock === 0 ? "Out of Stock" : isInCart(product.id) ? "In Cart" : "Add to Cart"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination - Simple version */}
        {filteredProducts.length > 0 && (
          <div className="flex justify-center mt-12">
            <div className="flex space-x-2">
              <Button variant="outline" disabled>
                Previous
              </Button>
              <Button variant="outline" className="bg-natural-green text-white">
                1
              </Button>
              <Button variant="outline" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
