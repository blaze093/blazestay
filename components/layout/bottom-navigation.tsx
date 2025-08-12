"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { useCart } from "@/lib/cart-context"
import { Badge } from "@/components/ui/badge"
import { Home, Heart, ShoppingCart, User, Package, Plus, MessageCircle } from "lucide-react"

export default function BottomNavigation() {
  const { user } = useAuth()
  const { getCartItemsCount } = useCart()
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const cartItemsCount = getCartItemsCount()

  // Hide/show bottom nav on scroll
  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false)
        } else {
          setIsVisible(true)
        }
        setLastScrollY(window.scrollY)
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar)
      return () => {
        window.removeEventListener("scroll", controlNavbar)
      }
    }
  }, [lastScrollY])

  // Don't show on admin pages
  if (pathname?.startsWith("/admin")) {
    return null
  }

  const buyerNavItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Heart, label: "Wishlist", href: "/buyer-dashboard/wishlist" },
    { icon: ShoppingCart, label: "Cart", href: "/cart", badge: cartItemsCount },
    { icon: Package, label: "Orders", href: "/buyer-dashboard/orders" },
    { icon: User, label: "Profile", href: "/profile" },
  ]

  const sellerNavItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Package, label: "Products", href: "/seller-dashboard/products" },
    { icon: Plus, label: "Add", href: "/seller-dashboard/add-product" },
    { icon: MessageCircle, label: "Messages", href: "/messages" },
    { icon: User, label: "Dashboard", href: "/seller-dashboard" },
  ]

  const guestNavItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Heart, label: "Products", href: "/products" },
    { icon: User, label: "Login", href: "/login" },
  ]

  const navItems = user ? (user.role === "buyer" ? buyerNavItems : sellerNavItems) : guestNavItems

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 min-w-[60px] relative ${
                isActive ? "text-natural-green" : "text-gray-500 hover:text-natural-green"
              }`}
            >
              <div className="relative">
                <item.icon className={`h-5 w-5 ${isActive ? "text-natural-green" : ""}`} />
                {item.badge && item.badge > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[18px] h-4 flex items-center justify-center p-0">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? "text-natural-green font-medium" : ""}`}>{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-natural-green rounded-b-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
