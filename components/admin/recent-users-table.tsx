import { format } from "date-fns"
import type { User } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface RecentUsersTableProps {
  users: User[]
}

export default function RecentUsersTable({ users }: RecentUsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-3 px-2 text-left font-medium">User</th>
            <th className="py-3 px-2 text-left font-medium">Email</th>
            <th className="py-3 px-2 text-left font-medium">Role</th>
            <th className="py-3 px-2 text-left font-medium">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-4 text-center text-muted-foreground">
                No recent users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.uid} className="border-b hover:bg-gray-50">
                <td className="py-3 px-2">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <Link href={`/admin/users/${user.uid}`} className="font-medium hover:underline">
                      {user.name}
                    </Link>
                  </div>
                </td>
                <td className="py-3 px-2">{user.email}</td>
                <td className="py-3 px-2">
                  <Badge
                    className={`font-normal ${
                      user.role === "seller"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                    }`}
                  >
                    {user.role === "seller" ? "Farmer" : "Buyer"}
                  </Badge>
                </td>
                <td className="py-3 px-2">
                  {user.createdAt instanceof Date
                    ? format(user.createdAt, "MMM dd, yyyy")
                    : format(user.createdAt.toDate(), "MMM dd, yyyy")}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
