"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sprout, Users, ShoppingCart, Star, Truck, Shield, Heart, MapPin, Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"
import { collection, query, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/providers/auth-provider"
import type { Product } from "@/lib/types"
import { getUserLocation, calculateDistance, reverseGeocode, extractLocationInfo } from "@/lib/location-utils"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const GOOGLE_MAPS_API_KEY = "AIzaSyACv7Y5LtG_ixVdSyVFnCTZFX6RSo1W9QI"
const MAX_DISTANCE_KM = 10

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [nearbyProducts, setNearbyProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [locationLoading, setLocationLoading] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [userCoordinates, setUserCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
  const [userLocation, setUserLocation] = useState<{ city: string; state: string } | null>(null)
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false)

  const { user } = useAuth()
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()

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
    fetchProducts()
  }, [])

  useEffect(() => {
    if (products.length > 0 && userCoordinates) {
      filterNearbyProducts()
    } else if (products.length > 0 && locationError) {
      // If location error, show all products
      setNearbyProducts(products)
      setLoading(false)
    }
  }, [products, userCoordinates, locationError])

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

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-natural-green to-green-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Fresh Produce
              <span className="block text-sunny-yellow">Farm to Table</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
              Connect directly with local farmers and get the freshest vegetables, fruits, and dairy products delivered
              to your home
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-sunny-yellow text-dark-olive hover:bg-earthy-orange text-lg px-8 py-3">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Shop Now
                </Button>
              </Link>
              <Link href="/signup-seller">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-natural-green text-lg px-8 py-3"
                >
                  <Sprout className="mr-2 h-5 w-5" />
                  Join as Farmer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Location-based Products Section */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            {locationLoading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-natural-green animate-spin mb-2" />
                <h2 className="text-3xl md:text-4xl font-bold text-dark-olive">Finding Fresh Products Near You</h2>
                <p className="text-lg text-gray-600 mt-2">Please wait while we locate fresh produce in your area...</p>
              </div>
            ) : userLocation ? (
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-dark-olive mb-2">
                  Fresh Products Near {userLocation.city}
                </h2>
                <p className="text-lg text-gray-600">
                  Showing fresh farm products within {MAX_DISTANCE_KM} km of your location
                </p>
              </div>
            ) : (
              <h2 className="text-3xl md:text-4xl font-bold text-dark-olive mb-2">Featured Products</h2>
            )}
          </div>

          {locationPermissionDenied && (
            <Alert className="mb-8 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Location access denied</AlertTitle>
              <AlertDescription className="text-amber-700">
                Enable location services to see products near you. We're showing all available products instead.
              </AlertDescription>
            </Alert>
          )}

          {!loading && nearbyProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
                <MapPin className="h-16 w-16 text-natural-green mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-dark-olive mb-2">No Fresh Products Found Nearby</h3>
                <p className="text-gray-600 mb-6">
                  Sorry, we couldn't find any fresh products within {MAX_DISTANCE_KM} km of your location right now.
                </p>
                <Link href="/products">
                  <Button size="lg" className="bg-natural-green hover:bg-natural-green/90 text-white">
                    View All Products
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {!loading && nearbyProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {nearbyProducts.slice(0, 6).map((product) => (
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
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => handleWishlistToggle(product)}
                    >
                      <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current text-red-500" : ""}`} />
                    </Button>
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

                    <Button className="w-full farm-button" onClick={() => handleAddToCart(product)}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && nearbyProducts.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/products">
                <Button size="lg" className="farm-button">
                  View All Products
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-olive mb-4">Why Choose FreshKart?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We bridge the gap between farmers and consumers, ensuring fresh produce and fair prices for everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="farm-card text-center">
                <CardHeader>
                  <div className="mx-auto bg-natural-green/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <feature.icon className="h-8 w-8 text-natural-green" />
                  </div>
                  <CardTitle className="text-dark-olive">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-natural-green text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-green-100">Happy Farmers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">2000+</div>
              <div className="text-green-100">Satisfied Customers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <div className="text-green-100">Cities Served</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">99%</div>
              <div className="text-green-100">Fresh Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-olive mb-6">Ready to Get Fresh?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of customers who trust FreshKart for their daily fresh produce needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup-buyer">
              <Button size="lg" className="farm-button">
                Start Shopping
              </Button>
            </Link>
            <Link href="/signup-seller">
              <Button
                size="lg"
                variant="outline"
                className="border-natural-green text-natural-green hover:bg-natural-green hover:text-white"
              >
                Become a Seller
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
