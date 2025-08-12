"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/providers/auth-provider"
import { CartProvider } from "@/lib/cart-context"
import { WishlistProvider } from "@/lib/wishlist-context"
import { MessagingProvider } from "@/lib/messaging-context"
import BottomNavigation from "@/components/layout/bottom-navigation"
import PWAInstallPrompt from "@/components/pwa/pwa-install-prompt"
import Script from "next/script"
import { useAuth } from "@/components/providers/auth-provider"

function ConditionalBottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Hide bottom navigation on auth page when user is not logged in
  if (!user && pathname === "/") {
    return null
  }

  return <BottomNavigation />
}

function ConditionalMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user && pathname === "/") {
    return <main className="flex-1">{children}</main>
  }

  return <main className="flex-1 pb-20 md:pb-0">{children}</main>
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <MessagingProvider>
              <div className="flex flex-col min-h-screen">
                <ConditionalMain>{children}</ConditionalMain>
                <ConditionalBottomNav />
              </div>
              <Toaster />
              <PWAInstallPrompt />
            </MessagingProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>

      {/* Service Worker Registration */}
      <Script id="sw-register" strategy="afterInteractive">
        {`
        if ('serviceWorker' in navigator) {
          window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
              .then(function(registration) {
                console.log('SW registered: ', registration);
              })
              .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
              });
          });
        }
      `}
      </Script>
    </ThemeProvider>
  )
}
