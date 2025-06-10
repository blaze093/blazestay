"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminHeader from "@/components/admin/admin-header"
import AdminChart from "@/components/admin/admin-chart"
import AdminMetricCard from "@/components/admin/admin-metric-card"
import { TrendingUp, Users, ShoppingBasket, ClipboardList, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days")

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <AdminHeader title="Analytics" description="Track your marketplace performance" />
        <div className="mt-4 md:mt-0">
          <Select defaultValue="30days" onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminMetricCard
          title="Total Revenue"
          value="₹45,231"
          description="+12% from last month"
          icon={<TrendingUp className="h-6 w-6" />}
          trend="up"
          trendValue="+12%"
        />

        <AdminMetricCard
          title="Total Users"
          value="1,234"
          description="+18 new users"
          icon={<Users className="h-6 w-6" />}
          trend="up"
          trendValue="+8%"
        />

        <AdminMetricCard
          title="Total Products"
          value="356"
          description="12 low stock"
          icon={<ShoppingBasket className="h-6 w-6" />}
          trend="neutral"
        />

        <AdminMetricCard
          title="Total Orders"
          value="892"
          description="24 pending"
          icon={<ClipboardList className="h-6 w-6" />}
          trend="up"
          trendValue="+15%"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Monthly revenue performance</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminChart height={350} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Product category distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminChart type="bar" height={300} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminChart type="area" height={300} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="sellers">Top Sellers</TabsTrigger>
          <TabsTrigger value="locations">Top Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Products with the highest sales volume</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Product</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-left py-3 px-4 font-medium">Sales</th>
                    <th className="text-left py-3 px-4 font-medium">Revenue</th>
                    <th className="text-left py-3 px-4 font-medium">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded bg-gray-200 mr-3"></div>
                        <span>Organic Tomatoes</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">Vegetables</td>
                    <td className="py-3 px-4">245 units</td>
                    <td className="py-3 px-4">₹12,250</td>
                    <td className="py-3 px-4">8.5%</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded bg-gray-200 mr-3"></div>
                        <span>Fresh Apples</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">Fruits</td>
                    <td className="py-3 px-4">198 units</td>
                    <td className="py-3 px-4">₹9,900</td>
                    <td className="py-3 px-4">7.2%</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded bg-gray-200 mr-3"></div>
                        <span>Organic Milk</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">Dairy</td>
                    <td className="py-3 px-4">156 units</td>
                    <td className="py-3 px-4">₹7,800</td>
                    <td className="py-3 px-4">6.8%</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded bg-gray-200 mr-3"></div>
                        <span>Brown Rice</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">Grains</td>
                    <td className="py-3 px-4">132 units</td>
                    <td className="py-3 px-4">₹6,600</td>
                    <td className="py-3 px-4">5.9%</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded bg-gray-200 mr-3"></div>
                        <span>Fresh Spinach</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">Vegetables</td>
                    <td className="py-3 px-4">124 units</td>
                    <td className="py-3 px-4">₹3,720</td>
                    <td className="py-3 px-4">5.5%</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sellers">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Sellers</CardTitle>
              <CardDescription>Farmers with the highest sales volume</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Seller</th>
                    <th className="text-left py-3 px-4 font-medium">Products</th>
                    <th className="text-left py-3 px-4 font-medium">Orders</th>
                    <th className="text-left py-3 px-4 font-medium">Revenue</th>
                    <th className="text-left py-3 px-4 font-medium">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                        <span>Rajesh Kumar</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">24</td>
                    <td className="py-3 px-4">156</td>
                    <td className="py-3 px-4">₹78,500</td>
                    <td className="py-3 px-4">4.9/5</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                        <span>Priya Singh</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">18</td>
                    <td className="py-3 px-4">132</td>
                    <td className="py-3 px-4">₹65,200</td>
                    <td className="py-3 px-4">4.8/5</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                        <span>Amit Patel</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">15</td>
                    <td className="py-3 px-4">98</td>
                    <td className="py-3 px-4">₹49,000</td>
                    <td className="py-3 px-4">4.7/5</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                        <span>Sunita Sharma</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">12</td>
                    <td className="py-3 px-4">87</td>
                    <td className="py-3 px-4">₹43,500</td>
                    <td className="py-3 px-4">4.6/5</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                        <span>Vijay Reddy</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">10</td>
                    <td className="py-3 px-4">76</td>
                    <td className="py-3 px-4">₹38,000</td>
                    <td className="py-3 px-4">4.5/5</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>Top Locations</CardTitle>
              <CardDescription>Areas with the highest order volume</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Location</th>
                    <th className="text-left py-3 px-4 font-medium">Users</th>
                    <th className="text-left py-3 px-4 font-medium">Orders</th>
                    <th className="text-left py-3 px-4 font-medium">Revenue</th>
                    <th className="text-left py-3 px-4 font-medium">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>Bangalore</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">456</td>
                    <td className="py-3 px-4">324</td>
                    <td className="py-3 px-4">₹162,000</td>
                    <td className="py-3 px-4 text-green-600">+15%</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>Mumbai</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">387</td>
                    <td className="py-3 px-4">276</td>
                    <td className="py-3 px-4">₹138,000</td>
                    <td className="py-3 px-4 text-green-600">+12%</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>Delhi</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">342</td>
                    <td className="py-3 px-4">245</td>
                    <td className="py-3 px-4">₹122,500</td>
                    <td className="py-3 px-4 text-green-600">+9%</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>Hyderabad</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">298</td>
                    <td className="py-3 px-4">213</td>
                    <td className="py-3 px-4">₹106,500</td>
                    <td className="py-3 px-4 text-green-600">+11%</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>Chennai</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">256</td>
                    <td className="py-3 px-4">187</td>
                    <td className="py-3 px-4">₹93,500</td>
                    <td className="py-3 px-4 text-green-600">+8%</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
