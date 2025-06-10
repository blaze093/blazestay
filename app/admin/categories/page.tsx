"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Search, PlusCircle, Trash2, Edit, Eye, ImageIcon } from "lucide-react"
import AdminHeader from "@/components/admin/admin-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
  description: string
  imageUrl: string
  productCount: number
  isActive: boolean
}

export default function CategoriesPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Vegetables",
      description: "Fresh farm vegetables directly from farmers",
      imageUrl: "/placeholder.svg",
      productCount: 124,
      isActive: true,
    },
    {
      id: "2",
      name: "Fruits",
      description: "Seasonal and exotic fruits from local farms",
      imageUrl: "/placeholder.svg",
      productCount: 98,
      isActive: true,
    },
    {
      id: "3",
      name: "Dairy",
      description: "Fresh milk, cheese, and other dairy products",
      imageUrl: "/placeholder.svg",
      productCount: 56,
      isActive: true,
    },
    {
      id: "4",
      name: "Grains",
      description: "Rice, wheat, and other grains from local farmers",
      imageUrl: "/placeholder.svg",
      productCount: 42,
      isActive: true,
    },
    {
      id: "5",
      name: "Herbs",
      description: "Fresh and dried herbs for cooking and medicinal use",
      imageUrl: "/placeholder.svg",
      productCount: 35,
      isActive: true,
    },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    imageUrl: "/placeholder.svg",
  })

  const filteredCategories = searchTerm
    ? categories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : categories

  const handleSearch = () => {
    // Already filtering in the filteredCategories variable
  }

  const handleAddCategory = () => {
    if (!newCategory.name) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      })
      return
    }

    const newCategoryWithId: Category = {
      id: Date.now().toString(),
      name: newCategory.name,
      description: newCategory.description,
      imageUrl: newCategory.imageUrl,
      productCount: 0,
      isActive: true,
    }

    setCategories([...categories, newCategoryWithId])
    setNewCategory({
      name: "",
      description: "",
      imageUrl: "/placeholder.svg",
    })
    setIsAddDialogOpen(false)

    toast({
      title: "Category added",
      description: `${newCategory.name} has been added successfully.`,
    })
  }

  const handleEditCategory = () => {
    if (!currentCategory) return

    if (!currentCategory.name) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      })
      return
    }

    setCategories(categories.map((cat) => (cat.id === currentCategory.id ? currentCategory : cat)))
    setIsEditDialogOpen(false)

    toast({
      title: "Category updated",
      description: `${currentCategory.name} has been updated successfully.`,
    })
  }

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id))

    toast({
      title: "Category deleted",
      description: "The category has been deleted successfully.",
    })
  }

  const openEditDialog = (category: Category) => {
    setCurrentCategory(category)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Categories Management"
        description="Manage product categories"
        actionLabel="Add Category"
        onAction={() => setIsAddDialogOpen(true)}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-left py-3 px-4 font-medium">Products</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded bg-gray-200 mr-3 overflow-hidden">
                            <img
                              src={category.imageUrl || "/placeholder.svg"}
                              alt={category.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="truncate max-w-[300px]">{category.description}</p>
                      </td>
                      <td className="py-4 px-4">{category.productCount}</td>
                      <td className="py-4 px-4">
                        <Badge
                          className={
                            category.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                          }
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
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
                            <DropdownMenuItem onClick={() => openEditDialog(category)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Products
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Category
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
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new product category for your marketplace.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder="e.g., Vegetables, Fruits, etc."
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this category..."
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Category Image</Label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded border bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={newCategory.imageUrl || "/placeholder.svg"}
                    alt="Category preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <Button variant="outline" className="flex-1">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} className="bg-dark-olive hover:bg-earthy-brown">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the details of this category.</DialogDescription>
          </DialogHeader>

          {currentCategory && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  value={currentCategory.name}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={currentCategory.description}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image">Category Image</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded border bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={currentCategory.imageUrl || "/placeholder.svg"}
                      alt="Category preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <Button variant="outline" className="flex-1">
                    <Image className="h-4 w-4 mr-2" />
                    Change Image
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory} className="bg-dark-olive hover:bg-earthy-brown">
              <Edit className="h-4 w-4 mr-2" />
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
