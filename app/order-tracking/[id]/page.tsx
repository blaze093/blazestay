"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/providers/auth-provider"
import type { Order } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, Truck, CheckCircle, Phone, ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (orderId) {
      fetchOrder()
    }
  }, [user, orderId, router])

  const fetchOrder = async () => {
    try {
      const orderDoc = await getDoc(doc(db, "orders", orderId))

      if (!orderDoc.exists()) {
        router.push("/buyer-dashboard/orders")
        return
      }

      const orderData = {
        id: orderDoc.id,
        ...orderDoc.data(),
        createdAt: orderDoc.data().createdAt?.toDate() || new Date(),
        updatedAt: orderDoc.data().updatedAt?.toDate() || new Date(),
      } as Order

      // Check if user owns this order
      if (orderData.buyerId !== user?.uid) {
        router.push("/buyer-dashboard/orders")
        return
      }

      setOrder(orderData)
    } catch (error) {
      console.error("Error fetching order:", error)
      router.push("/buyer-dashboard/orders")
    } finally {
      setLoading(false)
    }
  }

  const getStatusStep = (status: string) => {
    switch (status) {
      case "pending":
        return 1
      case "confirmed":
        return 2
      case "shipped":
        return 3
      case "delivered":
        return 4
      case "cancelled":
        return 0
      default:
        return 1
    }
  }

  const getEstimatedDelivery = () => {
    if (!order) return ""

    const orderDate = new Date(order.createdAt)
    const deliveryDate = new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000) // Add 2 days

    return deliveryDate.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-cream p-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-96" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    )
  }

  if (!order) return null

  const currentStep = getStatusStep(order.status)

  const trackingSteps = [
    {
      step: 1,
      title: "Order Placed",
      description: "Your order has been received and confirmed",
      icon: CheckCircle,
      completed: currentStep >= 1,
      active: currentStep === 1,
      timestamp: order.createdAt,
    },
    {
      step: 2,
      title: "Processing",
      description: "Your order is being prepared by the farmer",
      icon: Package,
      completed: currentStep >= 2,
      active: currentStep === 2,
      timestamp: currentStep >= 2 ? new Date(order.createdAt.getTime() + 2 * 60 * 60 * 1000) : null,
    },
    {
      step: 3,
      title: "Shipped",
      description: "Your order is on the way to your location",
      icon: Truck,
      completed: currentStep >= 3,
      active: currentStep === 3,
      timestamp: currentStep >= 3 ? new Date(order.createdAt.getTime() + 24 * 60 * 60 * 1000) : null,
    },
    {
      step: 4,
      title: "Delivered",
      description: "Your order has been delivered successfully",
      icon: CheckCircle,
      completed: currentStep >= 4,
      active: currentStep === 4,
      timestamp: currentStep >= 4 ? new Date(order.createdAt.getTime() + 48 * 60 * 60 * 1000) : null,
    },
  ]

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/buyer-dashboard/orders">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-natural-green mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-dark-olive mb-2">Track Your Order</h1>
          <p className="text-gray-600">Order #{order.id.slice(-8).toUpperCase()}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tracking Timeline */}
          <div className="lg:col-span-2">
            <Card className="farm-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order Status</span>
                  <Badge
                    className={`${
                      order.status === "delivered"
                        ? "bg-green-500"
                        : order.status === "cancelled"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                    } text-white`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.status === "cancelled" ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Order Cancelled</h3>
                    <p className="text-gray-600">
                      This order has been cancelled. If you have any questions, please contact support.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {trackingSteps.map((step, index) => (
                      <div key={step.step} className="flex items-start space-x-4">
                        <div className="relative">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              step.completed
                                ? "bg-green-500 text-white"
                                : step.active
                                  ? "bg-yellow-500 text-white"
                                  : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            <step.icon className="h-6 w-6" />
                          </div>
                          {index < trackingSteps.length - 1 && (
                            <div
                              className={`absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-16 ${
                                step.completed ? "bg-green-500" : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`text-lg font-semibold ${
                              step.completed || step.active ? "text-dark-olive" : "text-gray-500"
                            }`}
                          >
                            {step.title}
                          </h3>
                          <p className={`text-sm ${step.completed || step.active ? "text-gray-600" : "text-gray-400"}`}>
                            {step.description}
                          </p>
                          {step.timestamp && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {step.timestamp.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="farm-card mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Order Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 relative">
                      <Image
                        src={item.productImage || "/placeholder.svg"}
                        alt={item.productName}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-dark-olive">{item.productName}</h4>
                      <p className="text-sm text-gray-600">By {item.sellerName}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} {item.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-natural-green">₹{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Details Sidebar */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <Card className="farm-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5" />
                  Delivery Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Estimated Delivery</p>
                  <p className="font-semibold">{getEstimatedDelivery()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Delivery Address</p>
                  <div className="text-sm">
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                    <p>{order.shippingAddress.pincode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="farm-card">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Order Total</span>
                  <span className="font-semibold">₹{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment Method</span>
                  <span>{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment Status</span>
                  <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="farm-card">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Have questions about your order? Our support team is here to help.
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-natural-green" />
                  <span>+91 98765 43210</span>
                </div>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
