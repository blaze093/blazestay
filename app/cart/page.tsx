"use client"

import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Address } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Leaf,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart()

  const [orderLoading, setOrderLoading] = useState(false)
  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  })
  const [paymentMethod, setPaymentMethod] = useState("cod")

  if (!user) {
    router.push("/login")
    return null
  }

  if (user.role !== "buyer") {
    router.push("/seller-dashboard")
    return null
  }

  const handleAddressChange = (field: keyof Address, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }))
  }

  const calculateSubtotal = () => {
    return getCartTotal()
  }

  const calculateShipping = () => {
    const subtotal = calculateSubtotal()
    return subtotal >= 500 ? 0 : 40
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping()
  }

  const handlePlaceOrder = async () => {
    if (!user || cartItems.length === 0) return

    // Validate shipping address
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      toast({
        title: "Incomplete Address",
        description: "Please fill in all shipping address fields",
        variant: "destructive",
      })
      return
    }

    setOrderLoading(true)

    try {
      // Create order data
      const orderData = {
        buyerId: user.uid,
        buyerName: user.name,
        buyerEmail: user.email,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.imageURL,
          sellerId: item.product.sellerId,
          sellerName: item.product.sellerName,
          quantity: item.quantity,
          price: item.product.price,
          unit: item.product.unit,
        })),
        totalAmount: calculateTotal(),
        status: "pending",
        shippingAddress,
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Add order to Firestore
      const orderRef = await addDoc(collection(db, "orders"), orderData)

      // Clear cart
      clearCart()

      toast({
        title: "Order Placed Successfully!",
        description: `Your order for ₹${calculateTotal()} has been placed. Order ID: ${orderRef.id.slice(-8).toUpperCase()}`,
      })

      router.push(`/order-confirmation/${orderRef.id}`)
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setOrderLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-natural-green mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-dark-olive mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your items and proceed to checkout</p>
        </div>

        {cartItems.length === 0 ? (
          <Card className="farm-card text-center py-12">
            <CardContent>
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-dark-olive mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Add some fresh produce to get started</p>
              <Link href="/products">
                <Button className="farm-button">Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card className="farm-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Cart Items ({cartItems.length})
                    </div>
                    <Button variant="outline" size="sm" onClick={clearCart}>
                      Clear Cart
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="relative w-20 h-20">
                        <Image
                          src={item.product.imageURL || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded"
                        />
                        {item.product.isOrganic && (
                          <Badge className="absolute -top-2 -right-2 bg-natural-green text-white text-xs">
                            <Leaf className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>

                      <div className="flex-1">
                        <Link href={`/products/${item.product.id}`}>
                          <h3 className="font-medium text-dark-olive hover:text-natural-green transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600">By {item.product.sellerName}</p>
                        <div className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">{item.product.location}</span>
                        </div>
                        <div className="text-natural-green font-bold mt-1">
                          ₹{item.product.price}/{item.product.unit}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-dark-olive">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 mt-1"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Checkout */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card className="farm-card">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{calculateShipping() === 0 ? "Free" : `₹${calculateShipping()}`}</span>
                  </div>
                  {calculateShipping() === 0 && (
                    <div className="text-sm text-natural-green">🎉 Free shipping on orders above ₹500</div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Checkout Form */}
              <Card className="farm-card">
                <CardHeader>
                  <CardTitle>Checkout</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="address" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="address">
                        <MapPin className="h-4 w-4 mr-2" />
                        Address
                      </TabsTrigger>
                      <TabsTrigger value="payment">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payment
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="address" className="space-y-4">
                      <div>
                        <Label htmlFor="street">Street Address</Label>
                        <Textarea
                          id="street"
                          value={shippingAddress.street}
                          onChange={(e) => handleAddressChange("street", e.target.value)}
                          className="farm-input"
                          placeholder="Enter your complete address"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={shippingAddress.city}
                            onChange={(e) => handleAddressChange("city", e.target.value)}
                            className="farm-input"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={shippingAddress.state}
                            onChange={(e) => handleAddressChange("state", e.target.value)}
                            className="farm-input"
                            placeholder="State"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input
                            id="pincode"
                            value={shippingAddress.pincode}
                            onChange={(e) => handleAddressChange("pincode", e.target.value)}
                            className="farm-input"
                            placeholder="Pincode"
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={shippingAddress.country}
                            onChange={(e) => handleAddressChange("country", e.target.value)}
                            className="farm-input"
                            placeholder="Country"
                            disabled
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="payment" className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="cod"
                            name="payment"
                            value="cod"
                            checked={paymentMethod === "cod"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="text-natural-green"
                          />
                          <Label htmlFor="cod" className="flex items-center cursor-pointer">
                            <Truck className="h-4 w-4 mr-2" />
                            Cash on Delivery
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="online"
                            name="payment"
                            value="online"
                            checked={paymentMethod === "online"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="text-natural-green"
                          />
                          <Label htmlFor="online" className="flex items-center cursor-pointer">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Online Payment
                          </Label>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Button className="w-full farm-button mt-6" onClick={handlePlaceOrder} disabled={orderLoading}>
                    {orderLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      `Place Order - ₹${calculateTotal().toFixed(2)}`
                    )}
                  </Button>

                  <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-1" />
                      24-48hr delivery
                    </div>
                    <div className="flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-1" />
                      100% fresh guarantee
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
