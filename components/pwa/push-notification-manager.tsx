"use client"

import { useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"

export default function PushNotificationManager() {
  const { user } = useAuth()

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window && user) {
      requestNotificationPermission()
    }
  }, [user])

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission()

      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""),
        })

        // Send subscription to your server
        await fetch("/api/push-subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subscription,
            userId: user?.uid,
          }),
        })
      }
    } catch (error) {
      console.error("Error setting up push notifications:", error)
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  return null
}
