"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import type { Order } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  Calendar,
  Share2,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Heart,
} from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export default function OrderConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(true)

  const orderId = params.id as string

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !user) return

      try {
        const orderDoc = await getDoc(doc(db, "orders", orderId))
        if (orderDoc.exists()) {
          const orderData = {
            id: orderDoc.id,
            ...orderDoc.data(),
            createdAt: orderDoc.data().createdAt?.toDate() || new Date(),
            updatedAt: orderDoc.data().updatedAt?.toDate() || new Date(),
          } as Order

          // Verify this order belongs to the current user
          if (orderData.buyerId === user.uid) {
            setOrder(orderData)
          } else {
            router.push("/buyer-dashboard/orders")
          }
        } else {
          router.push("/buyer-dashboard/orders")
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        router.push("/buyer-dashboard/orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, user, router])

  useEffect(() => {
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const getEstimatedDelivery = () => {
    if (!order) return ""
    const deliveryDate = new Date(order.createdAt)
    deliveryDate.setDate(deliveryDate.getDate() + 3) // 3 days from order
    return deliveryDate.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const shareOrder = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My TazaTokri Order",
          text: `I just ordered fresh farm products from TazaTokri! Order #${order?.id.slice(-8).toUpperCase()}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link Copied!",
        description: "Order confirmation link copied to clipboard",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-natural-green mx-auto mb-4"></div>
          <p>Loading your order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-4">
              The order you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => router.push("/buyer-dashboard/orders")} className="farm-button">
              View My Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-natural-green/10 via-cream to-natural-green/5 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-natural-green rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                rotate: 0,
              }}
              animate={{
                y: window.innerHeight + 10,
                rotate: 360,
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto py-8 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Success Header */}
          <Card className="mb-8 bg-gradient-to-r from-natural-green to-natural-green/80 text-white border-0 shadow-2xl">
            <CardContent className="pt-8 pb-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <div className="relative inline-block">
                  <CheckCircle className="h-24 w-24 mx-auto text-white" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="h-8 w-8 text-yellow-300" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Thank You! 🎉</h1>
                <p className="text-xl md:text-2xl mb-2 opacity-90">Your order has been confirmed</p>
                <p className="text-lg opacity-80">Order #{order.id.slice(-8).toUpperCase()}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 flex flex-wrap justify-center gap-4"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => router.push("/buyer-dashboard/orders")}
                  className="bg-white text-natural-green hover:bg-gray-100"
                >
                  <Package className="h-5 w-5 mr-2" />
                  Track Order
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={shareOrder}
                  className="border-white text-white hover:bg-white hover:text-natural-green"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </motion.div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-dark-olive">
                    <Package className="h-6 w-6 mr-2 text-natural-green" />
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium">{order.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium capitalize">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-lg text-natural-green">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <span className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirmed
                      </span>
                    </Badge>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-natural-green" />
                      Estimated Delivery
                    </h4>
                    <p className="text-lg font-semibold text-natural-green">{getEstimatedDelivery()}</p>
                    <p className="text-sm text-gray-600 mt-1">We'll keep you updated on your order progress</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Delivery Information */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-dark-olive">
                    <MapPin className="h-6 w-6 mr-2 text-natural-green" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{order.buyerName}</p>
                    <p className="text-gray-600">{order.shippingAddress.street}</p>
                    <p className="text-gray-600">
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                    <p className="text-gray-600">
                      {order.shippingAddress.pincode}, {order.shippingAddress.country}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-dark-olive">
                  <Heart className="h-6 w-6 mr-2 text-natural-green" />
                  Your Fresh Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="flex items-center p-4 border rounded-lg bg-gradient-to-r from-natural-green/5 to-transparent hover:shadow-md transition-shadow"
                    >
                      <div className="w-16 h-16 bg-natural-green/10 rounded-lg flex items-center justify-center mr-4">
                        <Package className="h-8 w-8 text-natural-green" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{item.productName}</h4>
                        <p className="text-gray-600">From {item.sellerName}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">
                            {item.quantity} x ₹{item.price}/{item.unit}
                          </span>
                          <span className="font-semibold text-natural-green">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-4 text-natural-green border-natural-green hover:bg-natural-green hover:text-white"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message Seller
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-8"
          >
            <Card className="shadow-lg bg-gradient-to-r from-cream to-natural-green/10">
              <CardHeader>
                <CardTitle className="flex items-center text-dark-olive">
                  <ArrowRight className="h-6 w-6 mr-2 text-natural-green" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-natural-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-natural-green" />
                    </div>
                    <h4 className="font-medium mb-2">Order Confirmed</h4>
                    <p className="text-sm text-gray-600">Your order has been received and confirmed</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-natural-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="h-6 w-6 text-natural-green" />
                    </div>
                    <h4 className="font-medium mb-2">Preparing Order</h4>
                    <p className="text-sm text-gray-600">Farmers are preparing your fresh products</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-natural-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Truck className="h-6 w-6 text-natural-green" />
                    </div>
                    <h4 className="font-medium mb-2">On the Way</h4>
                    <p className="text-sm text-gray-600">Your order will be delivered soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="mt-8 text-center space-y-4"
          >
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => router.push("/products")} className="farm-button">
                Continue Shopping
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push("/buyer-dashboard/orders")}>
                View All Orders
              </Button>
            </div>
            <p className="text-gray-600">
              Questions about your order?{" "}
              <Button variant="link" className="text-natural-green p-0">
                Contact Support
              </Button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
