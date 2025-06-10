"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useWishlist } from "@/lib/wishlist-context"
import { useCart } from "@/lib/cart-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, ShoppingCart, Star, MapPin, ArrowLeft, Leaf, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export default function WishlistPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { wishlistItems, removeFromWishlist, loading } = useWishlist()
  const { addToCart, isInCart } = useCart()

  if (!user) {
    router.push("/login")
    return null
  }

  if (user.role !== "buyer") {
    router.push("/seller-dashboard")
    return null
  }

  const handleAddToCart = (product: any) => {
    addToCart(product)
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/buyer-dashboard">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-natural-green mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-dark-olive mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            Your saved products ({wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"})
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="farm-card text-center py-12">
            <CardContent>
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-dark-olive mb-2">Your wishlist is empty</h3>
              <p className="text-gray-600 mb-6">Save products you love to buy them later</p>
              <Link href="/products">
                <Button className="farm-button">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <Card key={product.id} className="farm-card overflow-hidden hover:shadow-xl transition-all">
                <div className="relative">
                  <Link href={`/products/${product.id}`}>
                    <Image
                      src={product.imageURL || "/placeholder.svg?height=200&width=300"}
                      alt={product.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                  </Link>
                  {product.isOrganic && (
                    <Badge className="absolute top-2 left-2 bg-natural-green text-white">
                      <Leaf className="h-3 w-3 mr-1" /> Organic
                    </Badge>
                  )}
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => removeFromWishlist(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {product.stock <= 5 && product.stock > 0 && (
                    <Badge className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs">
                      Only {product.stock} left!
                    </Badge>
                  )}
                  {product.stock === 0 && (
                    <Badge className="absolute bottom-2 left-2 bg-red-500 text-white text-xs">Out of Stock</Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-dark-olive hover:text-natural-green transition-colors mb-1">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between mb-2">
                    <div className="text-natural-green font-bold">
                      ₹{product.price}/{product.unit}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm">{product.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <MapPin className="h-3 w-3 mr-1" />
                    {product.location}
                    <span className="mx-2">•</span>
                    <span>By {product.sellerName}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      className="flex-1 farm-button"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0 || isInCart(product.id)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {product.stock === 0 ? "Out of Stock" : isInCart(product.id) ? "In Cart" : "Add to Cart"}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => removeFromWishlist(product.id)}
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
