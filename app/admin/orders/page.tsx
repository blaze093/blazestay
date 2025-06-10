"use client"

import { useState, useEffect } from "react"
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Order } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MoreHorizontal,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Printer,
  MessageSquare,
  CheckCircle,
  XCircle,
  Package,
  Truck,
} from "lucide-react"
import { format } from "date-fns"
import AdminHeader from "@/components/admin/admin-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [pageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  const fetchOrders = async (
    searchTerm = "",
    status: string | null = null,
    startAfterDoc: QueryDocumentSnapshot<DocumentData> | null = null,
  ) => {
    setLoading(true)
    try {
      const ordersQuery = collection(db, "orders")
      const constraints = []

      if (status) {
        constraints.push(where("status", "==", status))
      }

      constraints.push(orderBy("createdAt", "desc"))
      constraints.push(limit(pageSize))

      if (startAfterDoc) {
        constraints.push(startAfter(startAfterDoc))
      }

      const q = query(ordersQuery, ...constraints)
      const querySnapshot = await getDocs(q)

      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[]

      // Filter by search term client-side (for simplicity)
      // In a production app, you'd want to do this server-side
      const filteredOrders = searchTerm
        ? ordersData.filter(
            (order) =>
              order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
              order.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : ordersData

      setOrders(filteredOrders)

      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
      } else {
        setLastVisible(null)
      }

      // Get total count for pagination
      // In a real app, you'd use a more efficient method
      const totalSnapshot = await getDocs(collection(db, "orders"))
      setTotalOrders(totalSnapshot.size)
      setTotalPages(Math.ceil(totalSnapshot.size / pageSize))
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(searchTerm, statusFilter)
  }, [statusFilter])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchOrders(searchTerm, statusFilter)
  }

  const handleNextPage = () => {
    if (lastVisible && currentPage < totalPages) {
      fetchOrders(searchTerm, statusFilter, lastVisible)
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      // This is a simplified approach - in a real app you'd need to store previous page cursors
      setCurrentPage((prev) => prev - 1)
      // For simplicity, we'll just go back to page 1 and then forward
      fetchOrders(searchTerm, statusFilter)
    }
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? null : value)
    setCurrentPage(1)
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId)
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date(),
      })

      // Update local state
      setOrders(
        orders.map((order) => (order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date() } : order)),
      )

      toast({
        title: "Order updated",
        description: `Order status changed to ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "confirmed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "packed":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100"
      case "dispatched":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "delivered":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Orders Management"
        description="Manage all orders on the platform"
        showRefresh
        onRefresh={() => fetchOrders(searchTerm, statusFilter)}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID or customer..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>

            <div className="flex gap-2">
              <Select onValueChange={handleStatusFilterChange} defaultValue="all">
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Most Recent</DropdownMenuItem>
                  <DropdownMenuItem>Oldest First</DropdownMenuItem>
                  <DropdownMenuItem>Highest Value</DropdownMenuItem>
                  <DropdownMenuItem>Lowest Value</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Total</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Payment</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td colSpan={7} className="py-4">
                        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted-foreground">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <Link href={`/admin/orders/${order.id}`} className="font-medium text-blue-600 hover:underline">
                          #{order.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <Link href={`/admin/users/${order.buyerId}`} className="hover:underline">
                            {order.buyerName}
                          </Link>
                          <p className="text-xs text-muted-foreground">{order.buyerEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {order.createdAt instanceof Date
                          ? format(order.createdAt, "MMM dd, yyyy")
                          : format(order.createdAt.toDate(), "MMM dd, yyyy")}
                      </td>
                      <td className="py-4 px-4">₹{order.totalAmount.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <Badge className={`font-normal ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{order.paymentMethod}</Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="h-4 w-4 mr-2" />
                              Print Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Contact Customer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem
                                    onClick={() => updateOrderStatus(order.id, "confirmed")}
                                    disabled={order.status === "confirmed"}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                                    Confirm Order
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateOrderStatus(order.id, "packed")}
                                    disabled={order.status === "packed" || order.status === "pending"}
                                  >
                                    <Package className="h-4 w-4 mr-2 text-indigo-600" />
                                    Mark as Packed
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateOrderStatus(order.id, "dispatched")}
                                    disabled={
                                      order.status === "dispatched" ||
                                      order.status === "pending" ||
                                      order.status === "confirmed"
                                    }
                                  >
                                    <Truck className="h-4 w-4 mr-2 text-purple-600" />
                                    Mark as Dispatched
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateOrderStatus(order.id, "delivered")}
                                    disabled={
                                      order.status === "delivered" ||
                                      order.status === "pending" ||
                                      order.status === "confirmed" ||
                                      order.status === "packed"
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    Mark as Delivered
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => updateOrderStatus(order.id, "cancelled")}
                                    disabled={order.status === "cancelled" || order.status === "delivered"}
                                    className="text-red-600"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel Order
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {orders.length} of {totalOrders} orders
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || !lastVisible}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
