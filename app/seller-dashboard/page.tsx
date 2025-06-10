"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product, Order } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, Plus, TrendingUp, Star, Clock, Eye, ShoppingCart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function SellerDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (user && user.role !== "seller") {
      router.push("/buyer-dashboard")
      return
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, authLoading, router])

  const fetchDashboardData = async () => {
    try {
      // Fetch seller's products (simple query without composite index)
      const productsQuery = query(collection(db, "products"), where("sellerId", "==", user!.uid))
      const productsSnapshot = await getDocs(productsQuery)
      const allProducts = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        harvestDate: doc.data().harvestDate?.toDate(),
      })) as Product[]

      // Sort by createdAt in JavaScript instead of Firestore
      const products = allProducts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10)
      setProducts(products)

      // Fetch recent orders (simple query)
      const ordersQuery = query(collection(db, "orders"))
      const ordersSnapshot = await getDocs(ordersQuery)
      const allOrders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Order[]

      // Filter and sort orders in JavaScript
      const sellerOrders = allOrders
        .filter((order) => order.items.some((item) => item.sellerId === user!.uid))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 20)

      setRecentOrders(sellerOrders)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-cream p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const totalRevenue = recentOrders.reduce((sum, order) => {
    const sellerItems = order.items.filter((item) => item.sellerId === user.uid)
    return sum + sellerItems.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0)
  }, 0)

  const totalProducts = products.length
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0)
  const averageRating =
    products.length > 0 ? products.reduce((sum, product) => sum + product.rating, 0) / products.length : 0

  const stats = [
    {
      title: "Total Products",
      value: totalProducts.toString(),
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      title: "Total Stock",
      value: totalStock.toString(),
      icon: Eye,
      color: "bg-orange-500",
    },
    {
      title: "Average Rating",
      value: averageRating.toFixed(1),
      icon: Star,
      color: "bg-yellow-500",
    },
  ]

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-olive mb-2">Welcome back, {user.name}! 🌾</h1>
          <p className="text-gray-600">Manage your products and track your sales performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="farm-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-dark-olive">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card className="farm-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-dark-olive">Recent Orders</CardTitle>
                  <CardDescription>Orders containing your products</CardDescription>
                </div>
                <Link href="/seller-dashboard/orders">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No orders yet</p>
                  <Link href="/seller-dashboard/add-product">
                    <Button className="farm-button">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Product
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.slice(0, 3).map((order) => {
                    const sellerItems = order.items.filter((item) => item.sellerId === user.uid)
                    const sellerTotal = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

                    return (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-dark-olive">Order #{order.id.slice(-6)}</p>
                          <p className="text-sm text-gray-600">
                            {sellerItems.length} items • ₹{sellerTotal}
                          </p>
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">{order.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge
                          variant={order.status === "delivered" ? "default" : "secondary"}
                          className={order.status === "delivered" ? "bg-green-500" : ""}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Products */}
          <Card className="farm-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-dark-olive">My Products</CardTitle>
                  <CardDescription>Your latest listings</CardDescription>
                </div>
                <Link href="/seller-dashboard/products">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No products listed yet</p>
                  <Link href="/seller-dashboard/add-product">
                    <Button className="farm-button">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="relative mb-2">
                        <Image
                          src={product.imageURL || "/placeholder.svg?height=100&width=100"}
                          alt={product.name}
                          width={100}
                          height={80}
                          className="w-full h-20 object-cover rounded"
                        />
                        {product.isOrganic && (
                          <Badge className="absolute top-1 left-1 bg-natural-green text-white text-xs">🌿</Badge>
                        )}
                        <Badge
                          className={`absolute top-1 right-1 text-xs ${
                            product.stock > 10 ? "bg-green-500" : product.stock > 0 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                        >
                          {product.stock} left
                        </Badge>
                      </div>
                      <h4 className="font-medium text-dark-olive text-sm mb-1">{product.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-natural-green font-bold text-sm">
                          ₹{product.price}/{product.unit}
                        </span>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                          <span className="text-xs">{product.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{product.reviewCount} reviews</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-dark-olive mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/seller-dashboard/add-product">
              <Card className="farm-card hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Plus className="h-8 w-8 text-natural-green mx-auto mb-3" />
                  <h3 className="font-medium text-dark-olive mb-2">Add New Product</h3>
                  <p className="text-sm text-gray-600">List a new product for sale</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/seller-dashboard/products">
              <Card className="farm-card hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Package className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-medium text-dark-olive mb-2">Manage Products</h3>
                  <p className="text-sm text-gray-600">Edit and update your listings</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/seller-dashboard/orders">
              <Card className="farm-card hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <ShoppingCart className="h-8 w-8 text-earthy-orange mx-auto mb-3" />
                  <h3 className="font-medium text-dark-olive mb-2">View Orders</h3>
                  <p className="text-sm text-gray-600">Track and manage your sales</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
