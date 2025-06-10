import { format } from "date-fns"
import type { Order } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface RecentOrdersTableProps {
  orders: Order[]
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-3 px-2 text-left font-medium">Order ID</th>
            <th className="py-3 px-2 text-left font-medium">Customer</th>
            <th className="py-3 px-2 text-left font-medium">Date</th>
            <th className="py-3 px-2 text-left font-medium">Amount</th>
            <th className="py-3 px-2 text-left font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-4 text-center text-muted-foreground">
                No recent orders found
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-2">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-blue-600 hover:underline">
                    #{order.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="py-3 px-2">{order.buyerName}</td>
                <td className="py-3 px-2">
                  {order.createdAt instanceof Date
                    ? format(order.createdAt, "MMM dd, yyyy")
                    : format(order.createdAt.toDate(), "MMM dd, yyyy")}
                </td>
                <td className="py-3 px-2">₹{order.totalAmount.toLocaleString()}</td>
                <td className="py-3 px-2">
                  <Badge className={`font-normal ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
