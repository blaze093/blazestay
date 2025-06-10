"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User, Product } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  Package,
  Tractor,
  Leaf,
  ShoppingCart,
  MessageSquare,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Farmer extends User {
  farmName?: string
  farmSize?: string
  experience?: string
  description?: string
  location?: string
  isVerified?: boolean
  rating?: number
  totalSales?: number
}

export default function FarmerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const farmerId = params.id as string

  const [farmer, setFarmer] = useState<Farmer | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (farmerId) {
      fetchFarmerData()
    }
  }, [farmerId])

  const fetchFarmerData = async () => {
    try {
      // Fetch farmer details
      const farmerDoc = await getDoc(doc(db, "users", farmerId))

      if (!farmerDoc.exists() || farmerDoc.data().role !== "seller") {
        router.push("/farmers")
        return
      }

      const farmerData = {
        uid: farmerDoc.id,
        ...farmerDoc.data(),
        createdAt: farmerDoc.data().createdAt?.toDate() || new Date(),
      } as Farmer

      setFarmer(farmerData)

      // Fetch farmer's products
      const productsQuery = query(collection(db, "products"), where("sellerId", "==", farmerId))
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
      console.error("Error fetching farmer data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96 md:col-span-2" />
          </div>
        </div>
      </div>
    )
  }

  if (!farmer) return null

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-natural-green"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farmers
          </Button>
        </div>

        {/* Farmer Profile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Farmer Card */}
          <Card className="farm-card">
            <CardHeader className="text-center pb-2">
              <div className="relative mx-auto mb-4">
                <Avatar className="h-32 w-32 mx-auto border-4 border-natural-green">
                  <AvatarImage src={farmer.profileImage || "/placeholder.svg"} alt={farmer.name} />
                  <AvatarFallback className="bg-sunny-yellow text-dark-olive text-3xl">
                    {farmer.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {farmer.isVerified && (
                  <Badge className="absolute bottom-0 right-0 bg-natural-green text-white px-2 py-1">✓ Verified</Badge>
                )}
              </div>
              <CardTitle className="text-2xl text-dark-olive">{farmer.name}</CardTitle>
              <CardDescription className="text-lg">{farmer.farmName || "Local Farmer"}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                  <span className="font-medium">{farmer.rating?.toFixed(1) || "New"}</span>
                </div>
                <span className="mx-2">•</span>
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-1" />
                  <span>{farmer.totalSales || 0} sales</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                {farmer.location && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="h-5 w-5 text-natural-green" />
                    <span>{farmer.location}</span>
                  </div>
                )}
                {farmer.phone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="h-5 w-5 text-natural-green" />
                    <span>{farmer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="h-5 w-5 text-natural-green" />
                  <span>{farmer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="h-5 w-5 text-natural-green" />
                  <span>Joined {farmer.createdAt.toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-4 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-gray-500 text-sm">Farm Size</p>
                  <p className="font-medium">{farmer.farmSize || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Experience</p>
                  <p className="font-medium">{farmer.experience || "Not specified"}</p>
                </div>
              </div>

              <div className="pt-4 flex justify-center space-x-2">
                <Button className="farm-button">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Farmer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Farmer Details */}
          <div className="md:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="about">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Tractor className="mr-2 h-5 w-5" />
                      About {farmer.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {farmer.description ? (
                      <div>
                        <h3 className="font-medium mb-2">Farm Description</h3>
                        <p className="text-gray-600">{farmer.description}</p>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">No farm description available</div>
                    )}

                    <div>
                      <h3 className="font-medium mb-4">Farming Practices</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="bg-green-50 border-green-200">
                          <CardContent className="p-4">
                            <div className="flex items-center mb-2">
                              <Leaf className="h-5 w-5 text-natural-green mr-2" />
                              <h4 className="font-medium">Sustainable Farming</h4>
                            </div>
                            <p className="text-sm text-gray-600">
                              {farmer.isVerified
                                ? "This farmer follows sustainable farming practices to protect the environment and produce healthy food."
                                : "Information about farming practices not verified yet."}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="p-4">
                            <div className="flex items-center mb-2">
                              <Package className="h-5 w-5 text-blue-600 mr-2" />
                              <h4 className="font-medium">Product Quality</h4>
                            </div>
                            <p className="text-sm text-gray-600">
                              {products.some((p) => p.isOrganic)
                                ? "This farmer offers organic products grown without synthetic pesticides or fertilizers."
                                : "This farmer focuses on delivering fresh and quality produce."}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="products">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="mr-2 h-5 w-5" />
                      Products by {farmer.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {products.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-dark-olive mb-2">No Products Listed</h3>
                        <p className="text-gray-600">This farmer hasn't listed any products yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {products.map((product) => (
                          <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex">
                              <div className="w-1/3">
                                <Link href={`/products/${product.id}`}>
                                  <Image
                                    src={product.imageURL || "/placeholder.svg?height=100&width=100"}
                                    alt={product.name}
                                    width={100}
                                    height={100}
                                    className="w-full h-full object-cover"
                                  />
                                </Link>
                              </div>
                              <div className="w-2/3 p-3">
                                <Link href={`/products/${product.id}`}>
                                  <h3 className="font-medium text-dark-olive hover:text-natural-green transition-colors mb-1">
                                    {product.name}
                                    {product.isOrganic && (
                                      <span className="ml-2 text-xs bg-natural-green text-white px-1 py-0.5 rounded">
                                        Organic
                                      </span>
                                    )}
                                  </h3>
                                </Link>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-natural-green font-bold">
                                    ₹{product.price}/{product.unit}
                                  </div>
                                  <div className="flex items-center">
                                    <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                                    <span className="text-xs">{product.rating.toFixed(1)}</span>
                                  </div>
                                </div>
                                <Button size="sm" className="w-full farm-button text-xs">
                                  <ShoppingCart className="mr-1 h-3 w-3" />
                                  Add to Cart
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Featured Products */}
        {products.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-dark-olive mb-6">Featured Products from {farmer.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product) => (
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

                    <Button className="w-full farm-button">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
