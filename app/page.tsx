"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ShoppingCart,
  Heart,
  Star,
  MapPin,
  Truck,
  Shield,
  Users,
  Sprout,
  Settings,
  LogOut,
  Home,
  Package,
  List,
  Plus,
  Search,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/providers/auth-provider"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy, limit, getDocs } from "firebase/firestore"
import type { Product, Category } from "@/lib/types"
import { getUserLocation, calculateDistance, reverseGeocode, extractLocationInfo } from "@/lib/location-utils"
import SplashScreen from "@/components/auth/splash-screen"
import LoginForm from "@/components/auth/login-form"
import SignupForm from "@/components/auth/signup-form"
import ForgotPasswordForm from "@/components/auth/forgot-password-form"
import OTPVerificationForm from "@/components/auth/otp-verification-form"
import { AnimatePresence } from "framer-motion"

type AuthView = "login" | "signup" | "forgot-password" | "otp-verification"

const GOOGLE_MAPS_API_KEY = "AIzaSyACv7Y5LtG_ixVdSyVFnCTZFX6RSo1W9QI"
const MAX_DISTANCE_KM = 50

const bannerData = [
  {
    id: 1,
    image: "/fresh-vegetables-banner.png",
    title: "Fresh Vegetables",
    subtitle: "Farm Fresh Daily",
  },
  {
    id: 2,
    image: "/organic-fruits-banner.png",
    title: "Organic Fruits",
    subtitle: "100% Natural",
  },
  {
    id: 3,
    image: "/dairy-products-banner.png",
    title: "Dairy Products",
    subtitle: "Fresh from Farm",
  },
]

let categories = [
  { name: "Vegetables", icon: "🥬", count: 0 },
  { name: "Fruits", icon: "🍎", count: 0 },
  { name: "Dairy", icon: "🥛", count: 0 },
  { name: "Grains", icon: "🌾", count: 0 },
  { name: "Herbs", icon: "🌿", count: 0 },
  { name: "Spices", icon: "🌶️", count: 0 },
]

const setCategories = (newCategories) => {
  categories = newCategories
}

export default function HomePage() {
  const router = useRouter()
  const { user, logout } = useAuth() // Added logout from useAuth
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()

  const [currentAuthView, setCurrentAuthView] = useState<AuthView>("login")
  const [showSplash, setShowSplash] = useState(true)
  const [phoneNumber, setPhoneNumber] = useState("")

  const [products, setProducts] = useState<Product[]>([])
  const [nearbyProducts, setNearbyProducts] = useState<Product[]>([])
  const [categoryProducts, setCategoryProducts] = useState<{ [key: string]: Product[] }>({})
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [locationLoading, setLocationLoading] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [userCoordinates, setUserCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
  const [userLocation, setUserLocation] = useState<{ city: string; state: string } | null>(null)
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false)
  const [currentBanner, setCurrentBanner] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const features = [
    {
      icon: Sprout,
      title: "Direct from Farm",
      description: "Fresh produce delivered straight from local farmers to your doorstep",
    },
    {
      icon: Shield,
      title: "Quality Assured",
      description: "All products are quality checked and certified by our expert team",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable delivery within 24-48 hours of ordering",
    },
    {
      icon: Users,
      title: "Support Farmers",
      description: "Help rural farmers get fair prices for their hard work and dedication",
    },
  ]

  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % bannerData.length)
      }, 5000)
      return () => clearInterval(interval)
    } else {
      const timer = setTimeout(() => {
        setShowSplash(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [user])

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        setLocationLoading(true)
        const coords = await getUserLocation()
        setUserCoordinates({
          latitude: coords.latitude,
          longitude: coords.longitude,
        })

        // Get city and state from coordinates
        try {
          const geocodeResult = await reverseGeocode(coords.latitude, coords.longitude, GOOGLE_MAPS_API_KEY)
          const locationInfo = extractLocationInfo(geocodeResult)
          setUserLocation(locationInfo)
        } catch (error) {
          console.error("Error getting location info:", error)
        }
      } catch (error) {
        console.error("Error getting user location:", error)
        if (error instanceof GeolocationPositionError && error.code === error.PERMISSION_DENIED) {
          setLocationPermissionDenied(true)
          setLocationError("Location permission denied. Please enable location services to see nearby products.")
        } else {
          setLocationError("Unable to get your location. Showing all products instead.")
        }
      } finally {
        setLocationLoading(false)
      }
    }

    fetchUserLocation()
  }, [])

  useEffect(() => {
    if (user) {
      const unsubscribeProducts = onSnapshot(
        collection(db, "products"),
        (snapshot) => {
          const productsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[]

          setProducts(productsData)
          setFilteredProducts(productsData)

          // Update category products mapping
          const categoryProductsMap: { [key: string]: Product[] } = {}
          categories.forEach((category) => {
            categoryProductsMap[category.name] = productsData.filter((product) => product.category === category.name)
          })
          setCategoryProducts(categoryProductsMap)

          // Update category counts
          const updatedCategories = categories.map((category) => ({
            ...category,
            count: productsData.filter((product) => product.category === category.name).length,
          }))
          setCategories(updatedCategories)

          // Update suggested products (highest rated)
          const suggested = productsData.sort((a, b) => b.rating - a.rating).slice(0, 8)
          setSuggestedProducts(suggested)

          setLoading(false)
        },
        (error) => {
          console.error("Error fetching products:", error)
          setLoading(false)
        },
      )

      const unsubscribeCategories = onSnapshot(
        collection(db, "categories"),
        (snapshot) => {
          const categoriesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Category[]

          if (categoriesData.length > 0) {
            // Update categories with product counts
            const updatedCategories = categoriesData.map((category) => ({
              ...category,
              count: products.filter((product) => product.category === category.name).length,
            }))
            setCategories(updatedCategories)
          }
        },
        (error) => {
          console.error("Error fetching categories:", error)
        },
      )

      return () => {
        unsubscribeProducts()
        unsubscribeCategories()
      }
    } else {
      fetchProducts()
    }
  }, [user])

  const fetchProducts = async () => {
    try {
      const categoriesSnapshot = await getDocs(collection(db, "categories"))
      const categoriesData = categoriesSnapshot.docs.map((doc) => ({
        name: doc.data().name,
        icon: doc.data().icon,
        count: 0, // Will be updated with actual product count
      }))

      const productsSnapshot = await getDocs(collection(db, "products"))
      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        harvestDate: doc.data().harvestDate?.toDate(),
      })) as Product[]

      const updatedCategories = categoriesData.map((category) => ({
        ...category,
        count: productsData.filter((product) => product.category === category.name).length,
      }))

      setCategories(updatedCategories.length > 0 ? updatedCategories : categories)
      setProducts(productsData)
      setFilteredProducts(productsData)

      if (user) {
        const categoryProductsMap: { [key: string]: Product[] } = {}
        updatedCategories.forEach((category) => {
          categoryProductsMap[category.name] = productsData.filter((product) => product.category === category.name)
        })
        setCategoryProducts(categoryProductsMap)

        const suggestedQuery = query(collection(db, "products"), orderBy("rating", "desc"), limit(6))
        const suggestedSnapshot = await getDocs(suggestedQuery)
        const suggestedData = suggestedSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          harvestDate: doc.data().harvestDate?.toDate(),
        })) as Product[]
        setSuggestedProducts(suggestedData)
      }

      if (!userCoordinates && !locationLoading) {
        // If location is not available and we're done trying, show all products
        setNearbyProducts(productsData)
        setLoading(false)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery.trim() === "") {
      // If no search query, show products based on selected category
      if (selectedCategory === "All") {
        setFilteredProducts(products)
      } else {
        setFilteredProducts(products.filter((product) => product.category === selectedCategory))
      }
    } else {
      // Filter products based on search query
      const searchResults = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredProducts(searchResults)
    }
  }, [searchQuery, products, selectedCategory])

  const filterNearbyProducts = () => {
    if (!userCoordinates) return

    const nearby = products.filter((product) => {
      // Skip products without coordinates
      if (!product.coordinates) return false

      const distance = calculateDistance(
        userCoordinates.latitude,
        userCoordinates.longitude,
        product.coordinates.latitude,
        product.coordinates.longitude,
      )

      return distance <= MAX_DISTANCE_KM
    })

    setNearbyProducts(nearby)
    setLoading(false)
  }

  const handleAddToCart = (product: Product) => {
    addToCart(product)
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    })
  }

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast({
        title: "Removed from Wishlist",
        description: `${product.name} has been removed from your wishlist`,
      })
    } else {
      addToWishlist(product)
      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been added to your wishlist`,
      })
    }
  }

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName)
    setSearchQuery("") // Clear search when category is selected
  }

  const handleAuthViewChange = (view: AuthView, phone?: string) => {
    if (phone) setPhoneNumber(phone)
    setCurrentAuthView(view)
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })
      router.push("/") // Redirect to home page after logout
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!user && showSplash) {
    return <SplashScreen />
  }

  if (user) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="sticky top-0 z-50 bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left - Greeting */}
              <div className="flex items-center">
                <h1 className="text-lg font-semibold text-dark-olive">Hi, {user.name.split(" ")[0]}</h1>
              </div>

              {/* Center - Navigation Items */}
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href="/"
                  className="flex items-center space-x-1 text-gray-600 hover:text-dark-olive transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span className="text-sm font-medium">Home</span>
                </Link>
                {user.role === "buyer" && (
                  <>
                    <Link
                      href="/buyer-dashboard/wishlist"
                      className="flex items-center space-x-1 text-gray-600 hover:text-dark-olive transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                      <span className="text-sm font-medium">Wishlist</span>
                    </Link>
                    <Link
                      href="/cart"
                      className="flex items-center space-x-1 text-gray-600 hover:text-dark-olive transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span className="text-sm font-medium">Cart</span>
                    </Link>
                    <Link
                      href="/buyer-dashboard/orders"
                      className="flex items-center space-x-1 text-gray-600 hover:text-dark-olive transition-colors"
                    >
                      <Package className="h-4 w-4" />
                      <span className="text-sm font-medium">Orders</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Right - Profile and Location */}
              <div className="flex items-center space-x-4">
                {/* Location */}
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {locationLoading ? (
                    <span>Getting location...</span>
                  ) : userLocation ? (
                    <span>
                      {userLocation.city}, {userLocation.state}
                    </span>
                  ) : (
                    <span>Location unavailable</span>
                  )}
                </div>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-natural-green text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    {user.role === "buyer" ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/buyer-dashboard/wishlist" className="flex items-center">
                            <Heart className="mr-2 h-4 w-4" />
                            Wishlist
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/" className="flex items-center">
                            <Home className="mr-2 h-4 w-4" />
                            Home
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/buyer-dashboard/orders" className="flex items-center">
                            <Package className="mr-2 h-4 w-4" />
                            Orders
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/seller-dashboard/products" className="flex items-center">
                            <List className="mr-2 h-4 w-4" />
                            My Products
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/seller-dashboard/add-product" className="flex items-center">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/seller-dashboard/orders" className="flex items-center">
                            <Package className="mr-2 h-4 w-4" />
                            Orders
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      {" "}
                      {/* Fixed onClick handler */}
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <section className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for fresh vegetables, fruits, dairy products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-natural-green focus:border-natural-green text-sm"
                />
              </div>
            </div>

            {/* Banner Carousel */}
            <div className="relative overflow-hidden rounded-lg">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentBanner * 100}%)` }}
              >
                {bannerData.map((banner) => (
                  <div key={banner.id} className="w-full flex-shrink-0">
                    <div className="relative h-48 bg-gradient-to-r from-natural-green to-green-600">
                      <Image
                        src={banner.image || "/placeholder.svg"}
                        alt={banner.title}
                        fill
                        className="object-cover mix-blend-overlay"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="text-center text-white">
                          <h2 className="text-3xl font-bold mb-2">{banner.title}</h2>
                          <p className="text-lg">{banner.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Banner indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {bannerData.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full ${index === currentBanner ? "bg-white" : "bg-white/50"}`}
                    onClick={() => setCurrentBanner(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-dark-olive mb-6">Shop by Category</h2>

            {/* Category filter tabs */}
            <div className="flex overflow-x-auto scrollbar-hide mb-6 pb-2">
              <div className="flex space-x-2 min-w-max">
                <Button
                  variant={selectedCategory === "All" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryClick("All")}
                  className="whitespace-nowrap"
                >
                  All Products
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.name}
                    variant={selectedCategory === category.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryClick(category.name)}
                    className="whitespace-nowrap"
                  >
                    {category.icon} {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
              {categories.map((category) => (
                <div key={category.name} onClick={() => handleCategoryClick(category.name)}>
                  <Card className="farm-card text-center hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="text-3xl mb-2">{category.icon}</div>
                      <h3 className="font-semibold text-sm text-dark-olive">{category.name}</h3>
                      <p className="text-xs text-gray-500">{category.count} items</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-dark-olive">
                  {searchQuery.trim() !== ""
                    ? `Search Results for "${searchQuery}" (${filteredProducts.length} products)`
                    : `${selectedCategory} (${filteredProducts.length} products)`}
                </h3>
                {searchQuery.trim() !== "" && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-sm text-gray-500 hover:text-dark-olive flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Clear Search
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="farm-card overflow-hidden">
                    <div className="relative">
                      <Image
                        src={product.imageURL || "/placeholder.svg?height=150&width=200"}
                        alt={product.name}
                        width={200}
                        height={150}
                        className="w-full h-36 object-cover"
                      />
                      {product.isOrganic && (
                        <Badge className="absolute top-2 left-2 bg-natural-green text-white text-xs">🌿 Organic</Badge>
                      )}
                      {user.role === "buyer" && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white h-8 w-8"
                          onClick={() => handleWishlistToggle(product)}
                        >
                          <Heart className={`h-3 w-3 ${isInWishlist(product.id) ? "fill-current text-red-500" : ""}`} />
                        </Button>
                      )}
                    </div>

                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm text-dark-olive truncate">{product.name}</h4>
                        <div className="text-right">
                          <p className="text-lg font-bold text-natural-green">₹{product.price}</p>
                          <p className="text-xs text-gray-500">per {product.unit}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-xs text-gray-600">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">{product.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                          <span className="text-xs font-medium">{product.rating}</span>
                        </div>
                      </div>

                      {user.role === "buyer" && (
                        <Button
                          size="sm"
                          className="w-full farm-button text-xs"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="mr-1 h-3 w-3" />
                          Add to Cart
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-dark-olive mb-6">Suggested for You</h2>
            <Link href="/products">
              <Button variant="outline">View All Products</Button>
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedProducts.map((product) => (
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
                      <Badge className="absolute top-2 left-2 bg-natural-green text-white">🌿 Organic</Badge>
                    )}
                    {user.role === "buyer" && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={() => handleWishlistToggle(product)}
                      >
                        <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current text-red-500" : ""}`} />
                      </Button>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-dark-olive">{product.name}</CardTitle>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-natural-green">₹{product.price}</p>
                        <p className="text-sm text-gray-500">per {product.unit}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {product.location}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">By {product.sellerName}</p>

                    {user.role === "buyer" && (
                      <Button className="w-full farm-button" onClick={() => handleAddToCart(product)}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs with Premium Motion */}
        <motion.div
          className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-r from-green-300/20 via-emerald-300/30 to-teal-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.4, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
            x: [0, 50, -30, 0],
            y: [0, -40, 20, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/3 -right-32 w-80 h-80 bg-gradient-to-l from-emerald-400/25 via-green-300/20 to-teal-400/15 rounded-full blur-2xl"
          animate={{
            scale: [1.2, 1, 1.5, 1.2],
            rotate: [360, 270, 180, 90, 0],
            x: [0, -60, 40, 0],
            y: [0, 30, -50, 0],
          }}
          transition={{
            duration: 30,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 5,
          }}
        />
        <motion.div
          className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-gradient-to-t from-teal-300/20 via-emerald-200/25 to-green-300/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.6, 1.1, 1],
            rotate: [0, -120, -240, -360],
            x: [0, 80, -60, 0],
            y: [0, -70, 40, 0],
          }}
          transition={{
            duration: 35,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 10,
          }}
        />

        {/* Floating Particle System */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute top-20 left-10 text-5xl filter drop-shadow-lg"
        animate={{
          y: [0, -30, 0],
          rotate: [0, 15, -15, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        🥕
      </motion.div>
      <motion.div
        className="absolute top-40 right-20 text-4xl filter drop-shadow-lg"
        animate={{
          y: [0, -25, 0],
          rotate: [0, -20, 20, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 5.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1.5,
        }}
      >
        🥬
      </motion.div>
      <motion.div
        className="absolute bottom-40 left-20 text-4xl filter drop-shadow-lg"
        animate={{
          y: [0, -35, 0],
          rotate: [0, 25, -25, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 7,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 3,
        }}
      >
        🍅
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-10 text-5xl filter drop-shadow-lg"
        animate={{
          y: [0, -28, 0],
          rotate: [0, -18, 18, 0],
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 4.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
      >
        🥒
      </motion.div>
      <motion.div
        className="absolute top-1/2 left-5 text-3xl filter drop-shadow-lg"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 12, -12, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 4,
        }}
      >
        🌽
      </motion.div>
      <motion.div
        className="absolute top-1/3 right-5 text-3xl filter drop-shadow-lg"
        animate={{
          y: [0, -22, 0],
          rotate: [0, -14, 14, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        🥦
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="w-full max-w-md relative z-10"
      >
        <AnimatePresence mode="wait">
          {currentAuthView === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <LoginForm onViewChange={handleAuthViewChange} />
            </motion.div>
          )}
          {currentAuthView === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: -100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <SignupForm onViewChange={handleAuthViewChange} />
            </motion.div>
          )}
          {currentAuthView === "forgot-password" && (
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0, x: -100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <ForgotPasswordForm onViewChange={handleAuthViewChange} />
            </motion.div>
          )}
          {currentAuthView === "otp-verification" && (
            <motion.div
              key="otp-verification"
              initial={{ opacity: 0, x: -100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <OTPVerificationForm phoneNumber={phoneNumber} onViewChange={handleAuthViewChange} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
