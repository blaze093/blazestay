"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product, Review } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  MapPin,
  Leaf,
  Calendar,
  Package,
  Truck,
  ShieldCheck,
  MessageSquare,
  ArrowLeft,
  MessageCircle,
  Sprout,
  Phone,
  Zap,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useWishlist } from "@/lib/wishlist-context"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { EnhancedChatInterface } from "@/components/messaging/enhanced-chat-interface"
import { motion } from "framer-motion"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [showChat, setShowChat] = useState(false)

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { addToCart, isInCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (productId) {
      fetchProductData()
    }
  }, [productId])

  const fetchProductData = async () => {
    try {
      // Fetch product details
      const productDoc = await getDoc(doc(db, "products", productId))

      if (!productDoc.exists()) {
        router.push("/products")
        return
      }

      const productData = {
        id: productDoc.id,
        ...productDoc.data(),
        createdAt: productDoc.data().createdAt?.toDate() || new Date(),
        updatedAt: productDoc.data().updatedAt?.toDate() || new Date(),
        harvestDate: productDoc.data().harvestDate?.toDate(),
      } as Product

      setProduct(productData)

      // Fetch related products (same category)
      const relatedQuery = query(collection(db, "products"), where("category", "==", productData.category))
      const relatedSnapshot = await getDocs(relatedQuery)
      const relatedData = relatedSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          harvestDate: doc.data().harvestDate?.toDate(),
        }))
        .filter((item) => item.id !== productId) as Product[]

      setRelatedProducts(relatedData.slice(0, 4))

      // Fetch reviews
      const reviewsQuery = query(collection(db, "reviews"), where("productId", "==", productId))
      const reviewsSnapshot = await getDocs(reviewsQuery)
      const reviewsData = reviewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Review[]

      setReviews(reviewsData)
    } catch (error) {
      console.error("Error fetching product data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && (!product || value <= product.stock)) {
      setQuantity(value)
    }
  }

  const handleMessageFarmer = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to message the farmer",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (user.role !== "buyer") {
      toast({
        title: "Access Denied",
        description: "Only buyers can message farmers",
        variant: "destructive",
      })
      return
    }

    setShowChat(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-96" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-natural-green"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="relative rounded-lg overflow-hidden border-2 border-natural-green/20">
              <Image
                src={product.imageURL || "/placeholder.svg?height=500&width=500"}
                alt={product.name}
                width={500}
                height={500}
                className="w-full h-auto object-cover"
              />
              {product.isOrganic && (
                <Badge className="absolute top-4 left-4 bg-natural-green text-white px-3 py-1">
                  <Leaf className="h-4 w-4 mr-2" /> Organic Certified
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-3xl font-bold text-dark-olive mb-2">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                <span className="font-medium">{product.rating.toFixed(1)}</span>
                <span className="text-gray-500 ml-1">({product.reviewCount} reviews)</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {product.location}
              </div>
            </div>

            <div className="text-3xl font-bold text-natural-green mb-4">
              ₹{product.price}/{product.unit}
            </div>

            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Enhanced Farmer Info Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="mb-6 hover:shadow-lg transition-all duration-300 border-2 border-natural-green/20 bg-gradient-to-r from-cream/50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-4 border-2 border-natural-green/30">
                        <AvatarFallback className="bg-natural-green text-white text-lg font-bold">
                          {product.sellerName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-dark-olive">Sold by {product.sellerName}</p>
                          <Sprout className="h-4 w-4 text-natural-green" />
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-sunny-yellow fill-current" />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">Verified Farmer</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link href={`/farmer/${product.sellerId}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-natural-green/30 hover:bg-natural-green/10"
                        >
                          View Profile
                        </Button>
                      </Link>
                      {/* Eye-catching Message Button */}
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={handleMessageFarmer}
                          className="bg-gradient-to-r from-natural-green to-natural-green/80 hover:from-natural-green/90 hover:to-natural-green/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                          size="sm"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-sunny-yellow/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <MessageCircle className="h-4 w-4 mr-2 relative z-10" />
                          <span className="relative z-10 font-medium">Chat Now</span>
                          <Zap className="h-3 w-3 ml-1 relative z-10 animate-pulse" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>

                  {/* Quick Contact Info */}
                  <div className="mt-4 p-3 bg-natural-green/5 rounded-lg border border-natural-green/20">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-natural-green">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span>Instant Reply</span>
                        </div>
                        <div className="flex items-center text-natural-green">
                          <Phone className="h-4 w-4 mr-1" />
                          <span>Direct Contact</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">Usually responds within 1 hour</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Product Attributes */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-natural-green" />
                <span className="text-gray-600">Stock: </span>
                <span className="font-medium">
                  {product.stock} {product.unit}s available
                </span>
              </div>
              {product.harvestDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-natural-green" />
                  <span className="text-gray-600">Harvested: </span>
                  <span className="font-medium">{product.harvestDate.toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded-md">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="h-10 w-10"
                >
                  -
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="h-10 w-10"
                >
                  +
                </Button>
              </div>
              <Button
                className="flex-1 farm-button"
                onClick={() => {
                  if (!user) {
                    toast({
                      title: "Login Required",
                      description: "Please login to add items to cart",
                      variant: "destructive",
                    })
                    router.push("/login")
                    return
                  }
                  addToCart(product, quantity)
                  toast({
                    title: "Added to Cart",
                    description: `${product.name} has been added to your cart`,
                  })
                }}
                disabled={product.stock === 0 || isInCart(product.id)}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {product.stock === 0 ? "Out of Stock" : isInCart(product.id) ? "In Cart" : "Add to Cart"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => {
                  if (!user) {
                    toast({
                      title: "Login Required",
                      description: "Please login to add items to wishlist",
                      variant: "destructive",
                    })
                    router.push("/login")
                    return
                  }
                  if (isInWishlist(product.id)) {
                    removeFromWishlist(product.id)
                  } else {
                    addToWishlist(product)
                  }
                }}
              >
                <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current text-red-500" : ""}`} />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Delivery Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="h-4 w-4 text-natural-green" />
                <span>Delivery within 24-48 hours</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ShieldCheck className="h-4 w-4 text-natural-green" />
                <span>100% Fresh Guarantee</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="details" className="mb-12">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Product Information</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 border-b pb-2">
                        <span className="text-gray-600">Category</span>
                        <span>{product.category}</span>
                      </div>
                      <div className="grid grid-cols-2 border-b pb-2">
                        <span className="text-gray-600">Organic</span>
                        <span>{product.isOrganic ? "Yes" : "No"}</span>
                      </div>
                      <div className="grid grid-cols-2 border-b pb-2">
                        <span className="text-gray-600">Unit</span>
                        <span>{product.unit}</span>
                      </div>
                      {product.harvestDate && (
                        <div className="grid grid-cols-2 border-b pb-2">
                          <span className="text-gray-600">Harvest Date</span>
                          <span>{product.harvestDate.toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-2 border-b pb-2">
                        <span className="text-gray-600">Location</span>
                        <span>{product.location}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Description</h3>
                    <p className="text-gray-600">{product.description || "No detailed description available."}</p>

                    {product.isOrganic && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center mb-2">
                          <Leaf className="h-5 w-5 text-natural-green mr-2" />
                          <h4 className="font-medium">Organic Certification</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          This product is certified organic, grown without synthetic pesticides or fertilizers,
                          promoting sustainable farming practices and environmental health.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardContent className="p-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-dark-olive mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600 mb-4">Be the first to review this product</p>
                    <Button className="farm-button">Write a Review</Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Customer Reviews</h3>
                      <Button className="farm-button">Write a Review</Button>
                    </div>

                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback>{review.buyerName.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{review.buyerName}</span>
                            </div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="ml-2 text-sm text-gray-500">
                                {review.createdAt.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-1">Delivery Time</h4>
                        <p className="text-gray-600">
                          We deliver within 24-48 hours of order placement to ensure maximum freshness.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Shipping Areas</h4>
                        <p className="text-gray-600">
                          Currently, we deliver to all major cities and surrounding areas. Check your pincode during
                          checkout for availability.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Shipping Fees</h4>
                        <p className="text-gray-600">
                          Free shipping on orders above ₹500. A nominal fee of ₹40 is charged for orders below ₹500.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Returns & Refunds</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-1">Fresh Guarantee</h4>
                        <p className="text-gray-600">
                          If you're not satisfied with the quality of the produce, you can request a refund or
                          replacement within 24 hours of delivery.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Return Process</h4>
                        <p className="text-gray-600">
                          Simply take a photo of the product and contact our customer service. We'll arrange for a
                          replacement or refund.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Refund Policy</h4>
                        <p className="text-gray-600">
                          Refunds are processed within 5-7 business days after the return is approved.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-dark-olive mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="farm-card overflow-hidden hover:shadow-xl transition-all">
                  <div className="relative">
                    <Link href={`/products/${relatedProduct.id}`}>
                      <Image
                        src={relatedProduct.imageURL || "/placeholder.svg?height=200&width=300"}
                        alt={relatedProduct.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                    </Link>
                    {relatedProduct.isOrganic && (
                      <Badge className="absolute top-2 left-2 bg-natural-green text-white">
                        <Leaf className="h-3 w-3 mr-1" /> Organic
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <Link href={`/products/${relatedProduct.id}`}>
                      <h3 className="font-semibold text-dark-olive hover:text-natural-green transition-colors mb-1">
                        {relatedProduct.name}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between mb-2">
                      <div className="text-natural-green font-bold">
                        ₹{relatedProduct.price}/{relatedProduct.unit}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm">{relatedProduct.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <Button className="w-full farm-button">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Interface */}
      {showChat && (
        <EnhancedChatInterface
          sellerId={product.sellerId}
          sellerName={product.sellerName}
          productId={product.id}
          productName={product.name}
          productImage={product.imageURL}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  )
}
