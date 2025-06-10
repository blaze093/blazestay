"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface WishlistContextType {
  wishlistItems: Product[]
  addToWishlist: (product: Product) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  loading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [wishlistItems, setWishlistItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && user.role === "buyer") {
      fetchWishlist()
    }
  }, [user])

  const fetchWishlist = async () => {
    if (!user) return

    setLoading(true)
    try {
      const wishlistQuery = query(collection(db, "wishlist"), where("buyerId", "==", user.uid))
      const wishlistSnapshot = await getDocs(wishlistQuery)

      const productIds = wishlistSnapshot.docs.map((doc) => doc.data().productId)

      if (productIds.length > 0) {
        // Fetch product details for each wishlist item
        const productsQuery = query(collection(db, "products"))
        const productsSnapshot = await getDocs(productsQuery)

        const products = productsSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            harvestDate: doc.data().harvestDate?.toDate(),
          }))
          .filter((product) => productIds.includes(product.id)) as Product[]

        setWishlistItems(products)
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToWishlist = async (product: Product) => {
    if (!user) return

    try {
      await addDoc(collection(db, "wishlist"), {
        buyerId: user.uid,
        productId: product.id,
        addedAt: new Date(),
      })

      setWishlistItems((prev) => [...prev, product])

      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been added to your wishlist`,
      })
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to add item to wishlist",
        variant: "destructive",
      })
    }
  }

  const removeFromWishlist = async (productId: string) => {
    if (!user) return

    try {
      const wishlistQuery = query(
        collection(db, "wishlist"),
        where("buyerId", "==", user.uid),
        where("productId", "==", productId),
      )
      const wishlistSnapshot = await getDocs(wishlistQuery)

      if (!wishlistSnapshot.empty) {
        await deleteDoc(doc(db, "wishlist", wishlistSnapshot.docs[0].id))
        setWishlistItems((prev) => prev.filter((item) => item.id !== productId))

        toast({
          title: "Removed from Wishlist",
          description: "Item has been removed from your wishlist",
        })
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      })
    }
  }

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.id === productId)
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
