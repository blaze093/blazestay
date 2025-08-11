import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/providers/auth-provider"
import { CartProvider } from "@/lib/cart-context"
import { WishlistProvider } from "@/lib/wishlist-context"
import { MessagingProvider } from "@/lib/messaging-context"
import Navbar from "@/components/layout/navbar"
import BottomNavigation from "@/components/layout/bottom-navigation"
import PWAInstallPrompt from "@/components/pwa/pwa-install-prompt"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TazaTokri - Farm to Table",
  description: "Fresh produce directly from farmers to your table",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TazaTokri",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "TazaTokri",
    title: "TazaTokri - Farm to Table",
    description: "Fresh produce directly from farmers to your table",
  },
  twitter: {
    card: "summary",
    title: "TazaTokri - Farm to Table",
    description: "Fresh produce directly from farmers to your table",
  },
    generator: 'v0.dev'
}

export const viewport = {
  themeColor: "#4CAF50",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="TazaTokri" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TazaTokri" />
        <meta name="description" content="Fresh produce directly from farmers to your table" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#4CAF50" />
        <meta name="msapplication-tap-highlight" content="no" />

        <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/touch-icon-ipad.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/touch-icon-iphone-retina.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/touch-icon-ipad-retina.png" />

        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#4CAF50" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <MessagingProvider>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1 pt-16 pb-20 md:pb-0">{children}</main>

                    <BottomNavigation />
                  </div>
                  <Toaster />
                  <PWAInstallPrompt />
                </MessagingProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>

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
      </body>
    </html>
  )
}
