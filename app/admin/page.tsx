"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, ShoppingBasket, ClipboardList, TrendingUp } from "lucide-react"
import type { User, Product, Order } from "@/lib/types"
import AdminHeader from "@/components/admin/admin-header"
import RecentOrdersTable from "@/components/admin/recent-orders-table"
import RecentUsersTable from "@/components/admin/recent-users-table"
import AdminMetricCard from "@/components/admin/admin-metric-card"
import AdminChart from "@/components/admin/admin-chart"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    newUsers: 0,
    newOrders: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch users count
        const usersSnapshot = await getDocs(collection(db, "users"))
        const totalUsers = usersSnapshot.size

        // Fetch products count
        const productsSnapshot = await getDocs(collection(db, "products"))
        const totalProducts = productsSnapshot.size
        const products = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]

        // Fetch orders
        const ordersSnapshot = await getDocs(collection(db, "orders"))
        const orders = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[]

        const totalOrders = orders.length
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)

        // Get recent users
        const recentUsersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5))
        const recentUsersSnapshot = await getDocs(recentUsersQuery)
        const recentUsersData = recentUsersSnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as User[]

        // Get recent orders
        const recentOrdersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5))
        const recentOrdersSnapshot = await getDocs(recentOrdersQuery)
        const recentOrdersData = recentOrdersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[]

        // Calculate other stats
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const newUsers = usersSnapshot.docs.filter((doc) => doc.data().createdAt?.toDate() > thirtyDaysAgo).length

        const newOrders = orders.filter((order) => order.createdAt?.toDate() > thirtyDaysAgo).length

        const pendingOrders = orders.filter(
          (order) => order.status === "pending" || order.status === "confirmed",
        ).length

        const lowStockProducts = products.filter((product) => product.stock < 10).length

        setStats({
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue,
          newUsers,
          newOrders,
          pendingOrders,
          lowStockProducts,
        })

        setRecentOrders(recentOrdersData)
        setRecentUsers(recentUsersData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminHeader title="Dashboard" description="Overview of your marketplace" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminMetricCard
          title="Total Users"
          value={stats.totalUsers}
          description={`+${stats.newUsers} new users`}
          icon={<Users className="h-6 w-6" />}
          trend={stats.newUsers > 0 ? "up" : "neutral"}
          trendValue={`${((stats.newUsers / stats.totalUsers) * 100).toFixed(1)}%`}
        />

        <AdminMetricCard
          title="Total Products"
          value={stats.totalProducts}
          description={`${stats.lowStockProducts} low stock`}
          icon={<ShoppingBasket className="h-6 w-6" />}
          trend="neutral"
        />

        <AdminMetricCard
          title="Total Orders"
          value={stats.totalOrders}
          description={`${stats.pendingOrders} pending`}
          icon={<ClipboardList className="h-6 w-6" />}
          trend={stats.newOrders > 0 ? "up" : "neutral"}
          trendValue={`+${stats.newOrders}`}
        />

        <AdminMetricCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          description="All time earnings"
          icon={<TrendingUp className="h-6 w-6" />}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales performance</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Key metrics comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="orders">
              <TabsList className="mb-4">
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
              </TabsList>
              <TabsContent value="orders">
                <AdminChart type="bar" />
              </TabsContent>
              <TabsContent value="users">
                <AdminChart type="line" />
              </TabsContent>
              <TabsContent value="revenue">
                <AdminChart type="area" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 5 orders across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable orders={recentOrders} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest 5 users who joined</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentUsersTable users={recentUsers} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
