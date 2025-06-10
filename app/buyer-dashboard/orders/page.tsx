"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import type { Order } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Search,
  Filter,
  Bell,
  RefreshCw,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { useMessaging } from "@/lib/messaging-context"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"

export default function BuyerOrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { createConversation } = useMessaging()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasStatusUpdates, setHasStatusUpdates] = useState(false)
  const [lastViewedStatuses, setLastViewedStatuses] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (!user) return

    const fetchOrders = async () => {
      try {
        // Get all orders for the current buyer
        const ordersRef = collection(db, "orders")
        const q = query(ordersRef, where("buyerId", "==", user.uid))

        // Use onSnapshot for real-time updates
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const ordersData = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
              updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            }))
            .sort((a: Order, b: Order) => b.createdAt.getTime() - a.createdAt.getTime()) as Order[]

          // Check for status updates
          if (orders.length > 0) {
            const statusChanges = ordersData.filter((newOrder) => {
              const oldOrder = orders.find((o) => o.id === newOrder.id)
              return oldOrder && oldOrder.status !== newOrder.status
            })

            if (statusChanges.length > 0) {
              setHasStatusUpdates(true)

              // Show toast for status updates
              statusChanges.forEach((order) => {
                toast({
                  title: "Order Status Updated",
                  description: `Order #${order.id.slice(-8).toUpperCase()} is now ${order.status}`,
                })
              })
            }
          }

          setOrders(ordersData)
          setLoading(false)
        })

        return unsubscribe
      } catch (error) {
        console.error("Error fetching orders:", error)
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, toast])

  const handleMessageSeller = async (sellerId: string, sellerName: string) => {
    try {
      // Create or get conversation
      const conversationId = await createConversation(sellerId, sellerName)

      // Navigate to messages page
      router.push("/messages")
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast({
        title: "Error",
        description: "Could not start conversation with seller",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "packed":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "dispatched":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "packed":
        return <Package className="h-4 w-4" />
      case "dispatched":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusProgress = (status: string) => {
    const statusOrder = ["pending", "confirmed", "packed", "dispatched", "delivered"]
    const currentIndex = statusOrder.indexOf(status)
    return ((currentIndex + 1) / statusOrder.length) * 100
  }

  const refreshOrders = () => {
    setIsRefreshing(true)
    setHasStatusUpdates(false)
    // The actual refresh happens automatically via the onSnapshot listener
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  // Filter and search orders
  const filteredOrders = orders.filter((order) => {
    // Filter by status
    if (filterStatus !== "all" && order.status !== filterStatus) {
      return false
    }

    // Search by order ID or items
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesOrderId = order.id.toLowerCase().includes(searchLower)
      const matchesItems = order.items.some(
        (item) =>
          item.productName.toLowerCase().includes(searchLower) || item.sellerName.toLowerCase().includes(searchLower),
      )

      return matchesOrderId || matchesItems
    }

    return true
  })

  // Calculate statistics
  const totalOrders = orders.length
  const pendingOrders = orders.filter((order) => ["pending", "confirmed"].includes(order.status)).length
  const inTransitOrders = orders.filter((order) => ["packed", "dispatched"].includes(order.status)).length
  const deliveredOrders = orders.filter((order) => order.status === "delivered").length

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="h-12 w-12 text-natural-green mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your Orders</h2>
              <p className="text-gray-600 mb-4">Please log in to view your orders</p>
              <Button className="farm-button">Login</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-olive">Your Orders</h1>
          <p className="text-gray-600">Track your orders and get real-time updates</p>
        </div>

        <div className="flex items-center mt-4 md:mt-0">
          <Button variant="outline" size="sm" className="relative mr-4" onClick={refreshOrders}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
            {hasStatusUpdates && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                <Bell className="h-3 w-3" />
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                </div>
                <div className="p-3 bg-natural-green/10 rounded-full">
                  <Package className="h-6 w-6 text-natural-green" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Processing</p>
                  <p className="text-2xl font-bold">{pendingOrders}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">In Transit</p>
                  <p className="text-2xl font-bold">{inTransitOrders}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Delivered</p>
                  <p className="text-2xl font-bold">{deliveredOrders}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Orders Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders by ID, product or seller..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center">
              <Filter className="h-4 w-4 text-gray-400 mr-2" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="packed">Packed</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {loading ? (
                <div className="text-center py-8">
                  <p>Loading orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-dark-olive mb-2">No Orders Found</h3>
                  <p className="text-gray-600">
                    {searchTerm || filterStatus !== "all"
                      ? "Try adjusting your search or filters"
                      : "You haven't placed any orders yet"}
                  </p>
                  <Button className="farm-button mt-4" onClick={() => router.push("/products")}>
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => {
                        const isExpanded = expandedOrder === order.id
                        const progress = getStatusProgress(order.status)

                        return (
                          <>
                            <TableRow
                              key={order.id}
                              className={`hover:bg-gray-50 ${
                                hasStatusUpdates && lastViewedStatuses[order.id] !== order.status ? "bg-blue-50" : ""
                              }`}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  #{order.id.slice(-8).toUpperCase()}
                                  {hasStatusUpdates && lastViewedStatuses[order.id] !== order.status && (
                                    <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                              <TableCell>{order.items.length} items</TableCell>
                              <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge className={`${getStatusColor(order.status)} border`}>
                                  <span className="flex items-center">
                                    {getStatusIcon(order.status)}
                                    <span className="ml-1 capitalize">{order.status}</span>
                                  </span>
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-natural-green h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="h-4 w-4 mr-1" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 mr-1" />
                                    )}
                                    {isExpanded ? "Hide" : "View"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/order-tracking/${order.id}`)}
                                    className="text-natural-green hover:text-white hover:bg-natural-green"
                                  >
                                    <Truck className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>

                            {/* Expanded Order Details */}
                            <AnimatePresence>
                              {isExpanded && (
                                <TableRow>
                                  <TableCell colSpan={7} className="bg-gray-50 p-0">
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          {/* Order Items */}
                                          <div>
                                            <h4 className="font-medium mb-3">Order Items</h4>
                                            <div className="space-y-3">
                                              {order.items.map((item, idx) => (
                                                <div
                                                  key={idx}
                                                  className="flex items-center p-3 border rounded-md bg-white"
                                                >
                                                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                                                    <Package className="h-6 w-6 text-gray-500" />
                                                  </div>
                                                  <div className="flex-1">
                                                    <p className="font-medium">{item.productName}</p>
                                                    <p className="text-sm text-gray-600">By {item.sellerName}</p>
                                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                                      <span>
                                                        {item.quantity} x ₹{item.price}/{item.unit}
                                                      </span>
                                                      <span className="font-medium">
                                                        ₹{(item.price * item.quantity).toFixed(2)}
                                                      </span>
                                                    </div>
                                                  </div>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleMessageSeller(item.sellerId, item.sellerName)}
                                                    className="ml-2"
                                                  >
                                                    <MessageCircle className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              ))}
                                            </div>
                                          </div>

                                          {/* Order Timeline */}
                                          <div>
                                            <h4 className="font-medium mb-3">Order Timeline</h4>
                                            <div className="space-y-4">
                                              {/* Order Placed */}
                                              <div className="flex items-center space-x-4">
                                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                  <CheckCircle className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                  <p className="font-medium">Order Placed</p>
                                                  <p className="text-sm text-gray-600">
                                                    {order.createdAt.toLocaleString()}
                                                  </p>
                                                </div>
                                              </div>

                                              <div className="w-0.5 h-6 bg-gray-200 ml-4"></div>

                                              {/* Status History */}
                                              {order.statusHistory && order.statusHistory.length > 0 ? (
                                                order.statusHistory.map((update, idx) => (
                                                  <div key={idx}>
                                                    <div className="flex items-center space-x-4">
                                                      <div
                                                        className={`w-8 h-8 ${getStatusColor(update.status)} rounded-full flex items-center justify-center`}
                                                      >
                                                        {getStatusIcon(update.status)}
                                                      </div>
                                                      <div className="flex-1">
                                                        <p className="font-medium capitalize">{update.status}</p>
                                                        <p className="text-sm text-gray-600">
                                                          {update.timestamp.toLocaleString()}
                                                        </p>
                                                        {update.updatedBy && (
                                                          <p className="text-xs text-gray-500">
                                                            Updated by {update.updatedBy}
                                                          </p>
                                                        )}
                                                      </div>
                                                    </div>
                                                    {idx < order.statusHistory.length - 1 && (
                                                      <div className="w-0.5 h-6 bg-gray-200 ml-4"></div>
                                                    )}
                                                  </div>
                                                ))
                                              ) : (
                                                <div className="flex items-center space-x-4">
                                                  <div
                                                    className={`w-8 h-8 ${getStatusColor(order.status)} rounded-full flex items-center justify-center`}
                                                  >
                                                    {getStatusIcon(order.status)}
                                                  </div>
                                                  <div className="flex-1">
                                                    <p className="font-medium capitalize">{order.status}</p>
                                                    <p className="text-sm text-gray-600">
                                                      {order.updatedAt.toLocaleString()}
                                                    </p>
                                                  </div>
                                                </div>
                                              )}
                                            </div>

                                            {/* Shipping Address */}
                                            <div className="mt-6">
                                              <h4 className="font-medium mb-2">Shipping Address</h4>
                                              <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                                                <p>{order.shippingAddress.street}</p>
                                                <p>
                                                  {order.shippingAddress.city}, {order.shippingAddress.state}
                                                </p>
                                                <p>
                                                  {order.shippingAddress.pincode}, {order.shippingAddress.country}
                                                </p>
                                              </div>
                                            </div>

                                            {/* Order Notes */}
                                            {order.notes && order.notes.length > 0 && (
                                              <div className="mt-6">
                                                <h4 className="font-medium mb-2">Order Notes</h4>
                                                <ScrollArea className="h-32 border rounded-md p-2 bg-white">
                                                  <div className="space-y-2">
                                                    {order.notes.map((note, idx) => (
                                                      <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                                                        <div className="flex justify-between items-center mb-1">
                                                          <span className="font-medium">{note.createdBy}</span>
                                                          <span className="text-xs text-gray-500">
                                                            {note.createdAt.toLocaleString()}
                                                          </span>
                                                        </div>
                                                        <p>{note.text}</p>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </ScrollArea>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </AnimatePresence>
                          </>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="active">
              {/* Similar table but filtered for active orders */}
              {/* ... */}
            </TabsContent>

            <TabsContent value="delivered">
              {/* Similar table but filtered for delivered orders */}
              {/* ... */}
            </TabsContent>

            <TabsContent value="cancelled">
              {/* Similar table but filtered for cancelled orders */}
              {/* ... */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
