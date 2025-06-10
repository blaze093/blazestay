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
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Search, Filter, ChevronLeft, ChevronRight, Trash2, Edit, UserCheck, UserX } from "lucide-react"
import { format } from "date-fns"
import AdminHeader from "@/components/admin/admin-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [pageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchUsers = async (
    searchTerm = "",
    role: string | null = null,
    startAfterDoc: QueryDocumentSnapshot<DocumentData> | null = null,
  ) => {
    setLoading(true)
    try {
      const usersQuery = collection(db, "users")
      const constraints = []

      if (role) {
        constraints.push(where("role", "==", role))
      }

      constraints.push(orderBy("createdAt", "desc"))
      constraints.push(limit(pageSize))

      if (startAfterDoc) {
        constraints.push(startAfter(startAfterDoc))
      }

      const q = query(usersQuery, ...constraints)
      const querySnapshot = await getDocs(q)

      const usersData = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as User[]

      // Filter by search term client-side (for simplicity)
      // In a production app, you'd want to do this server-side
      const filteredUsers = searchTerm
        ? usersData.filter(
            (user) =>
              user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : usersData

      setUsers(filteredUsers)

      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
      } else {
        setLastVisible(null)
      }

      // Get total count for pagination
      // In a real app, you'd use a more efficient method
      const totalSnapshot = await getDocs(collection(db, "users"))
      setTotalUsers(totalSnapshot.size)
      setTotalPages(Math.ceil(totalSnapshot.size / pageSize))
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(searchTerm, roleFilter)
  }, [roleFilter])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchUsers(searchTerm, roleFilter)
  }

  const handleNextPage = () => {
    if (lastVisible && currentPage < totalPages) {
      fetchUsers(searchTerm, roleFilter, lastVisible)
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      // This is a simplified approach - in a real app you'd need to store previous page cursors
      setCurrentPage((prev) => prev - 1)
      // For simplicity, we'll just go back to page 1 and then forward
      fetchUsers(searchTerm, roleFilter)
    }
  }

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value === "all" ? null : value)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Users Management"
        description="Manage all users and farmers on the platform"
        actionLabel="Add User"
        onAction={() => {}}
        showRefresh
        onRefresh={() => fetchUsers(searchTerm, roleFilter)}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>

            <div className="flex gap-2">
              <Select onValueChange={handleRoleFilterChange} defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="buyer">Buyers</SelectItem>
                  <SelectItem value="seller">Farmers</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Recently Added</DropdownMenuItem>
                  <DropdownMenuItem>Alphabetical (A-Z)</DropdownMenuItem>
                  <DropdownMenuItem>Alphabetical (Z-A)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Joined</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td colSpan={6} className="py-4">
                        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.uid} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <Link href={`/admin/users/${user.uid}`} className="font-medium hover:underline">
                              {user.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">{user.phone || "No phone"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">{user.email}</td>
                      <td className="py-4 px-4">
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
                      <td className="py-4 px-4">
                        {user.createdAt instanceof Date
                          ? format(user.createdAt, "MMM dd, yyyy")
                          : format(user.createdAt.toDate(), "MMM dd, yyyy")}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div
                            className={`h-2 w-2 rounded-full mr-2 ${user.isOnline ? "bg-green-500" : "bg-gray-300"}`}
                          ></div>
                          <span>{user.isOnline ? "Online" : "Offline"}</span>
                        </div>
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
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Verify User
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserX className="h-4 w-4 mr-2" />
                              Suspend User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
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
              Showing {users.length} of {totalUsers} users
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
