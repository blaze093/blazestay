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
  deleteDoc,
  doc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product } from "@/lib/types"
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
  Trash2,
  Edit,
  Eye,
  AlertTriangle,
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
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [pageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()

  const fetchProducts = async (
    searchTerm = "",
    category: string | null = null,
    startAfterDoc: QueryDocumentSnapshot<DocumentData> | null = null,
  ) => {
    setLoading(true)
    try {
      const productsQuery = collection(db, "products")
      const constraints = []

      if (category) {
        constraints.push(where("category", "==", category))
      }

      constraints.push(orderBy("createdAt", "desc"))
      constraints.push(limit(pageSize))

      if (startAfterDoc) {
        constraints.push(startAfter(startAfterDoc))
      }

      const q = query(productsQuery, ...constraints)
      const querySnapshot = await getDocs(q)

      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[]

      // Filter by search term client-side (for simplicity)
      // In a production app, you'd want to do this server-side
      const filteredProducts = searchTerm
        ? productsData.filter(
            (product) =>
              product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : productsData

      setProducts(filteredProducts)

      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
      } else {
        setLastVisible(null)
      }

      // Get total count for pagination
      // In a real app, you'd use a more efficient method
      const totalSnapshot = await getDocs(collection(db, "products"))
      setTotalProducts(totalSnapshot.size)
      setTotalPages(Math.ceil(totalSnapshot.size / pageSize))
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(searchTerm, categoryFilter)
  }, [categoryFilter])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchProducts(searchTerm, categoryFilter)
  }

  const handleNextPage = () => {
    if (lastVisible && currentPage < totalPages) {
      fetchProducts(searchTerm, categoryFilter, lastVisible)
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      // This is a simplified approach - in a real app you'd need to store previous page cursors
      setCurrentPage((prev) => prev - 1)
      // For simplicity, we'll just go back to page 1 and then forward
      fetchProducts(searchTerm, categoryFilter)
    }
  }

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value === "all" ? null : value)
    setCurrentPage(1)
  }

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return

    try {
      await deleteDoc(doc(db, "products", deleteProductId))

      // Update local state
      setProducts(products.filter((product) => product.id !== deleteProductId))
      setTotalProducts((prev) => prev - 1)
      setTotalPages(Math.ceil((totalProducts - 1) / pageSize))

      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteProductId(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const confirmDelete = (productId: string) => {
    setDeleteProductId(productId)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Products Management"
        description="Manage all products on the platform"
        actionLabel="Add Product"
        onAction={() => {}}
        showRefresh
        onRefresh={() => fetchProducts(searchTerm, categoryFilter)}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>

            <div className="flex gap-2">
              <Select onValueChange={handleCategoryFilterChange} defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="grains">Grains</SelectItem>
                  <SelectItem value="herbs">Herbs</SelectItem>
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
                  <DropdownMenuItem>Recently Added</DropdownMenuItem>
                  <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                  <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                  <DropdownMenuItem>Alphabetical (A-Z)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Product</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Price</th>
                  <th className="text-left py-3 px-4 font-medium">Stock</th>
                  <th className="text-left py-3 px-4 font-medium">Seller</th>
                  <th className="text-left py-3 px-4 font-medium">Added</th>
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
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted-foreground">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded bg-gray-200 mr-3 overflow-hidden">
                            <img
                              src={product.imageURL || "/placeholder.svg"}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <Link href={`/admin/products/${product.id}`} className="font-medium hover:underline">
                              {product.name}
                            </Link>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{product.category}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        ₹{product.price.toFixed(2)}/{product.unit}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          {product.stock < 10 ? <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" /> : null}
                          <span className={product.stock < 10 ? "text-amber-500" : ""}>
                            {product.stock} {product.unit}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Link href={`/admin/users/${product.sellerId}`} className="hover:underline">
                          {product.sellerName}
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        {product.createdAt instanceof Date
                          ? format(product.createdAt, "MMM dd, yyyy")
                          : format(product.createdAt.toDate(), "MMM dd, yyyy")}
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
                              <Link href={`/products/${product.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Product
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/products/${product.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Product
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => confirmDelete(product.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Product
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
              Showing {products.length} of {totalProducts} products
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product and remove it from the marketplace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
