"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, doc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore"
import type { Order, OrderStatusUpdate } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  RefreshCw,
  FileText,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useMessaging } from "@/lib/messaging-context"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"

export default function SellerOrdersPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { createConversation } = useMessaging()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderNote, setOrderNote] = useState("")
  const [notificationCount, setNotificationCount] = useState(0)
  const prevOrdersRef = useRef<Order[]>([])

  useEffect(() => {
    if (!user) return

    const fetchOrders = async () => {
      try {
        // Get all orders where at least one item has the current seller's ID
        const ordersRef = collection(db, "orders")
        const q = query(ordersRef)

        // Use onSnapshot for real-time updates
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const ordersData = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
              updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            }))
            .filter((order: Order) => order.items.some((item) => item.sellerId === user.uid))
            .sort((a: Order, b: Order) => b.createdAt.getTime() - a.createdAt.getTime()) as Order[]

          // Check for new orders
          if (prevOrdersRef.current.length > 0) {
            const newOrders = ordersData.filter(
              (order) => !prevOrdersRef.current.some((prevOrder) => prevOrder.id === order.id),
            )

            if (newOrders.length > 0) {
              setNotificationCount((prev) => prev + newOrders.length)
              toast({
                title: "New Order Received!",
                description: `You have ${newOrders.length} new order${newOrders.length > 1 ? "s" : ""}`,
              })
            }
          }

          prevOrdersRef.current = ordersData
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!user) return

    try {
      setStatusUpdating(orderId)

      // Get the current order
      const orderRef = doc(db, "orders", orderId)

      // Create status update history
      const statusUpdate: OrderStatusUpdate = {
        status: newStatus,
        timestamp: new Date(),
        updatedBy: user.name,
      }

      // Update the order with new status and add to history
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        statusHistory: [...(orders.find((o) => o.id === orderId)?.statusHistory || []), statusUpdate],
      })

      toast({
        title: "Order Updated",
        description: `Order status changed to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Update Failed",
        description: "Could not update order status",
        variant: "destructive",
      })
    } finally {
      setStatusUpdating(null)
    }
  }

  const handleMessageBuyer = async (order: Order) => {
    try {
      // Create or get conversation
      const conversationId = await createConversation(order.buyerId, order.buyerName)

      // Navigate to messages page
      router.push("/messages")
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast({
        title: "Error",
        description: "Could not start conversation with buyer",
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

  // Filter orders by seller's products
  const filterOrderItems = (order: Order) => {
    return {
      ...order,
      items: order.items.filter((item) => item.sellerId === user?.uid),
    }
  }

  const refreshOrders = () => {
    setIsRefreshing(true)
    // The actual refresh happens automatically via the onSnapshot listener
    setTimeout(() => {
      setIsRefreshing(false)
      setNotificationCount(0)
    }, 1000)
  }

  const openNotesDialog = (order: Order) => {
    setSelectedOrder(order)
    setOrderNote("")
    setNotesDialogOpen(true)
  }

  const addOrderNote = async () => {
    if (!selectedOrder || !orderNote.trim()) return

    try {
      const orderRef = doc(db, "orders", selectedOrder.id)

      // Create note object
      const note = {
        text: orderNote,
        createdBy: user?.name || "Seller",
        createdAt: new Date(),
        isSellerNote: true,
      }

      // Update order with new note
      await updateDoc(orderRef, {
        notes: [...(selectedOrder.notes || []), note],
      })

      toast({
        title: "Note Added",
        description: "Your note has been added to the order",
      })

      setNotesDialogOpen(false)
    } catch (error) {
      console.error("Error adding note:", error)
      toast({
        title: "Error",
        description: "Could not add note to order",
        variant: "destructive",
      })
    }
  }

  // Filter and search orders
  const filteredOrders = orders.filter((order) => {
    // Filter by status
    if (filterStatus !== "all" && order.status !== filterStatus) {
      return false
    }

    // Search by order ID, buyer name, or items
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesOrderId = order.id.toLowerCase().includes(searchLower)
      const matchesBuyerName = order.buyerName.toLowerCase().includes(searchLower)
      const matchesItems = order.items.some((item) => item.productName.toLowerCase().includes(searchLower))

      return matchesOrderId || matchesBuyerName || matchesItems
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
              <h2 className="text-2xl font-bold mb-2">Seller Orders</h2>
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
          <h1 className="text-2xl font-bold text-dark-olive">Manage Orders</h1>
          <p className="text-gray-600">Track and update the status of orders containing your products</p>
        </div>

        <div className="flex items-center mt-4 md:mt-0">
          <Button variant="outline" size="sm" className="relative mr-4" onClick={refreshOrders}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Button>

          <Button variant="default" size="sm" className="farm-button">
            <FileText className="h-4 w-4 mr-2" />
            Export Orders
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
                  <p className="text-sm font-medium text-gray-500">Pending</p>
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
          <CardTitle>Your Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders by ID, customer or product..."
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
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
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
                      : "You haven't received any orders yet"}
                  </p>
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => {
                        const filteredOrder = filterOrderItems(order)
                        const isExpanded = expandedOrder === order.id

                        return (
                          <>
                            <TableRow
                              key={order.id}
                              className={`hover:bg-gray-50 ${order.status === "pending" ? "bg-yellow-50" : ""}`}
                            >
                              <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                              <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Avatar className="h-6 w-6 mr-2">
                                    <AvatarFallback className="text-xs">{order.buyerName.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  {order.buyerName}
                                </div>
                              </TableCell>
                              <TableCell>{filteredOrder.items.length} items</TableCell>
                              <TableCell>
                                ₹
                                {filteredOrder.items
                                  .reduce((sum, item) => sum + item.price * item.quantity, 0)
                                  .toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Badge className={`${getStatusColor(order.status)} border`}>
                                  <span className="flex items-center">
                                    {getStatusIcon(order.status)}
                                    <span className="ml-1 capitalize">{order.status}</span>
                                  </span>
                                </Badge>
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
                                    onClick={() => handleMessageBuyer(order)}
                                    className="text-natural-green hover:text-white hover:bg-natural-green"
                                  >
                                    <MessageCircle className="h-4 w-4" />
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
                                              {filteredOrder.items.map((item, idx) => (
                                                <div
                                                  key={idx}
                                                  className="flex items-center p-3 border rounded-md bg-white"
                                                >
                                                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                                                    <Package className="h-6 w-6 text-gray-500" />
                                                  </div>
                                                  <div className="flex-1">
                                                    <p className="font-medium">{item.productName}</p>
                                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                                      <span>
                                                        {item.quantity} x ₹{item.price}/{item.unit}
                                                      </span>
                                                      <span className="font-medium">
                                                        ₹{(item.price * item.quantity).toFixed(2)}
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>

                                          {/* Customer and Status */}
                                          <div className="space-y-6">
                                            {/* Customer Info */}
                                            <div>
                                              <h4 className="font-medium mb-3">Customer Information</h4>
                                              <Card>
                                                <CardContent className="p-4">
                                                  <div className="space-y-2">
                                                    <div className="flex items-center">
                                                      <Avatar className="h-8 w-8 mr-2">
                                                        <AvatarFallback>{order.buyerName.charAt(0)}</AvatarFallback>
                                                      </Avatar>
                                                      <div>
                                                        <p className="font-medium">{order.buyerName}</p>
                                                        <p className="text-sm text-gray-600">{order.buyerEmail}</p>
                                                      </div>
                                                    </div>
                                                    <Separator />
                                                    <div>
                                                      <p className="text-sm font-medium">Shipping Address:</p>
                                                      <p className="text-sm text-gray-600">
                                                        {order.shippingAddress.street}, {order.shippingAddress.city}
                                                        <br />
                                                        {order.shippingAddress.state}, {order.shippingAddress.pincode}
                                                        <br />
                                                        {order.shippingAddress.country}
                                                      </p>
                                                    </div>
                                                  </div>
                                                </CardContent>
                                              </Card>
                                            </div>

                                            {/* Status Update */}
                                            <div>
                                              <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium">Update Status</h4>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => openNotesDialog(order)}
                                                >
                                                  <FileText className="h-4 w-4 mr-2" />
                                                  Add Note
                                                </Button>
                                              </div>
                                              <div className="flex space-x-2">
                                                <Select
                                                  onValueChange={(value) => updateOrderStatus(order.id, value)}
                                                  defaultValue={order.status}
                                                  disabled={statusUpdating === order.id}
                                                >
                                                  <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select status" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                                    <SelectItem value="packed">Packed</SelectItem>
                                                    <SelectItem value="dispatched">Dispatched</SelectItem>
                                                    <SelectItem value="delivered">Delivered</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>

                                              {/* Status History */}
                                              {order.statusHistory && order.statusHistory.length > 0 && (
                                                <div className="mt-4">
                                                  <p className="text-sm font-medium mb-2">Status History</p>
                                                  <ScrollArea className="h-32 border rounded-md p-2">
                                                    <div className="space-y-2">
                                                      {order.statusHistory.map((update, idx) => (
                                                        <div key={idx} className="flex items-center text-sm">
                                                          <div
                                                            className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(update.status)}`}
                                                          />
                                                          <span className="capitalize">{update.status}</span>
                                                          <span className="mx-2 text-gray-400">•</span>
                                                          <span className="text-gray-600">
                                                            {update.timestamp.toLocaleString()}
                                                          </span>
                                                          {update.updatedBy && (
                                                            <>
                                                              <span className="mx-2 text-gray-400">•</span>
                                                              <span className="text-gray-600">
                                                                by {update.updatedBy}
                                                              </span>
                                                            </>
                                                          )}
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </ScrollArea>
                                                </div>
                                              )}

                                              {/* Order Notes */}
                                              {order.notes && order.notes.length > 0 && (
                                                <div className="mt-4">
                                                  <p className="text-sm font-medium mb-2">Order Notes</p>
                                                  <ScrollArea className="h-32 border rounded-md p-2">
                                                    <div className="space-y-2">
                                                      {order.notes.map((note, idx) => (
                                                        <div key={idx} className="p-2 bg-white rounded border text-sm">
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

            <TabsContent value="pending">
              {/* Similar table but filtered for pending orders */}
              {/* ... */}
            </TabsContent>

            <TabsContent value="processing">
              {/* Similar table but filtered for processing orders */}
              {/* ... */}
            </TabsContent>

            <TabsContent value="completed">
              {/* Similar table but filtered for completed orders */}
              {/* ... */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Note Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Order Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Add a note to order #{selectedOrder?.id.slice(0, 8)}...</p>
              <Textarea
                placeholder="Enter your note here..."
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addOrderNote} className="farm-button">
              <FileText className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
