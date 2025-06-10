"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ShoppingCart, Heart, Package, Plus, LogOut, Menu, X, Sprout, MessageCircle } from "lucide-react"

export default function Navbar() {
  const { user, logout } = useAuth()
  const { getCartItemsCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const cartItemsCount = getCartItemsCount()

  const buyerMenuItems = [
    { icon: ShoppingCart, label: "My Orders", href: "/buyer-dashboard/orders" },
    { icon: Heart, label: "Wishlist", href: "/buyer-dashboard/wishlist" },
    { icon: MessageCircle, label: "Messages", href: "/messages" },
  ]

  const sellerMenuItems = [
    { icon: Package, label: "My Listings", href: "/seller-dashboard/products" },
    { icon: Package, label: "Orders", href: "/seller-dashboard/orders" },
    { icon: Plus, label: "Add Product", href: "/seller-dashboard/add-product" },
    { icon: MessageCircle, label: "Messages", href: "/messages" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-natural-green shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-white p-2 rounded-full">
              <Sprout className="h-6 w-6 text-natural-green" />
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold">FreshKart</h1>
              <p className="text-xs text-green-100">Farm to Table</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="text-white hover:text-green-100 transition-colors">
              Products
            </Link>
            <Link href="/" className="text-white hover:text-green-100 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-white hover:text-green-100 transition-colors">
              About
            </Link>

            {user && user.role === "buyer" && (
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className="text-white hover:text-green-100">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-sunny-yellow text-dark-olive text-xs min-w-[20px] h-5 flex items-center justify-center">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-white">
                      <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-sunny-yellow text-dark-olive">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Badge
                      variant="secondary"
                      className="absolute -top-2 -right-2 bg-sunny-yellow text-dark-olive text-xs"
                    >
                      {user.role === "buyer" ? "🛒" : "🌾"}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <Badge variant="outline" className="mt-1">
                      {user.role === "buyer" ? "Buyer" : "Farmer"}
                    </Badge>
                  </div>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link
                      href={user.role === "buyer" ? "/buyer-dashboard" : "/seller-dashboard"}
                      className="flex items-center"
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <Package className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  {user.role === "buyer"
                    ? buyerMenuItems.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href} className="flex items-center">
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      ))
                    : sellerMenuItems.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href} className="flex items-center">
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="outline" className="bg-white text-natural-green hover:bg-green-50">
                    Login
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="bg-sunny-yellow text-dark-olive hover:bg-earthy-orange">Home</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {user && user.role === "buyer" && (
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className="text-white">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-sunny-yellow text-dark-olive text-xs min-w-[20px] h-5 flex items-center justify-center">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-natural-green border-t border-green-400">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user && (
                <div className="px-3 py-2 mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-sunny-yellow text-dark-olive text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white text-sm font-medium">{user.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {user.role === "buyer" ? "Buyer" : "Farmer"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <Link
                href="/"
                className="block px-3 py-2 text-white hover:bg-green-600 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="block px-3 py-2 text-white hover:bg-green-600 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-white hover:bg-green-600 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>

              {user ? (
                <div className="border-t border-green-400 pt-3 mt-3">
                  <Link
                    href={user.role === "buyer" ? "/buyer-dashboard" : "/seller-dashboard"}
                    className="flex items-center px-3 py-2 text-white hover:bg-green-600 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package className="mr-3 h-4 w-4" />
                    Dashboard
                  </Link>

                  {user.role === "buyer"
                    ? buyerMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center px-3 py-2 text-white hover:bg-green-600 rounded-md"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.label}
                        </Link>
                      ))
                    : sellerMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center px-3 py-2 text-white hover:bg-green-600 rounded-md"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.label}
                        </Link>
                      ))}

                  {/* Profile Link at Bottom */}
                  <Link
                    href="/profile"
                    className="flex items-center px-3 py-2 text-white hover:bg-green-600 rounded-md border-t border-green-400 mt-3 pt-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package className="mr-3 h-4 w-4" />
                    Profile
                  </Link>

                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center w-full px-3 py-2 text-red-200 hover:bg-red-600 rounded-md"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="border-t border-green-400 pt-3 mt-3 space-y-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full bg-white text-natural-green">
                      Login
                    </Button>
                  </Link>
                  <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-sunny-yellow text-dark-olive hover:bg-earthy-orange">Home</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
