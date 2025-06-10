"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  writeBatch,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useAuth } from "@/components/providers/auth-provider"
import type { Message, Conversation, TypingIndicator } from "@/lib/types"

interface MessagingContextType {
  conversations: Conversation[]
  messages: { [conversationId: string]: Message[] }
  typingUsers: { [conversationId: string]: TypingIndicator[] }
  sendMessage: (
    conversationId: string,
    content: string,
    receiverId: string,
    receiverName: string,
    messageType?: "text" | "image" | "file" | "product",
    file?: File,
    productId?: string,
    productName?: string,
    replyTo?: string,
  ) => Promise<void>
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => Promise<void>
  createConversation: (
    sellerId: string,
    sellerName: string,
    productId?: string,
    productName?: string,
  ) => Promise<string>
  markAsRead: (conversationId: string) => Promise<void>
  addReaction: (messageId: string, emoji: string) => Promise<void>
  removeReaction: (messageId: string, emoji: string) => Promise<void>
  editMessage: (messageId: string, newContent: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  archiveConversation: (conversationId: string) => Promise<void>
  muteConversation: (conversationId: string, mute: boolean) => Promise<void>
  searchMessages: (conversationId: string, searchTerm: string) => Message[]
  loading: boolean
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined)

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({})
  const [typingUsers, setTypingUsers] = useState<{ [conversationId: string]: TypingIndicator[] }>({})
  const [loading, setLoading] = useState(true)

  // Update user online status
  useEffect(() => {
    if (!user) return

    const updateOnlineStatus = async (isOnline: boolean) => {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          isOnline,
          lastSeen: serverTimestamp(),
        })
      } catch (error) {
        console.error("Error updating online status:", error)
      }
    }

    updateOnlineStatus(true)

    const handleBeforeUnload = () => updateOnlineStatus(false)
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      updateOnlineStatus(false)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setConversations([])
      setMessages({})
      setTypingUsers({})
      setLoading(false)
      return
    }

    // Listen to conversations
    const conversationsQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc"),
    )

    const unsubscribeConversations = onSnapshot(conversationsQuery, (snapshot) => {
      const conversationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastMessageTime: doc.data().lastMessageTime?.toDate(),
      })) as Conversation[]

      setConversations(conversationsData)
      setLoading(false)

      // Listen to messages and typing indicators for each conversation
      conversationsData.forEach((conversation) => {
        // Messages listener
        const messagesQuery = query(
          collection(db, "messages"),
          where("conversationId", "==", conversation.id),
          orderBy("timestamp", "asc"),
        )

        onSnapshot(messagesQuery, (messagesSnapshot) => {
          const messagesData = messagesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date(),
            editedAt: doc.data().editedAt?.toDate(),
            reactions:
              doc.data().reactions?.map((r: any) => ({
                ...r,
                timestamp: r.timestamp?.toDate() || new Date(),
              })) || [],
          })) as Message[]

          setMessages((prev) => ({
            ...prev,
            [conversation.id]: messagesData,
          }))
        })

        // Typing indicators listener
        const typingQuery = query(
          collection(db, "typing"),
          where("conversationId", "==", conversation.id),
          where("userId", "!=", user.uid),
        )

        onSnapshot(typingQuery, (typingSnapshot) => {
          const typingData = typingSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date(),
          })) as TypingIndicator[]

          setTypingUsers((prev) => ({
            ...prev,
            [conversation.id]: typingData,
          }))
        })
      })
    })

    return () => {
      unsubscribeConversations()
    }
  }, [user])

  const createConversation = async (
    sellerId: string,
    sellerName: string,
    productId?: string,
    productName?: string,
  ): Promise<string> => {
    if (!user) throw new Error("User not authenticated")

    // Check if conversation already exists
    const existingQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains-any", [user.uid, sellerId]),
    )

    const existingSnapshot = await getDocs(existingQuery)
    const existingConv = existingSnapshot.docs.find((doc) => {
      const data = doc.data()
      return (
        data.participants.includes(user.uid) &&
        data.participants.includes(sellerId) &&
        data.productId === (productId || null)
      )
    })

    if (existingConv) {
      return existingConv.id
    }

    // Create new conversation
    const conversationData = {
      buyerId: user.role === "buyer" ? user.uid : sellerId,
      buyerName: user.role === "buyer" ? user.name : sellerName,
      sellerId: user.role === "seller" ? user.uid : sellerId,
      sellerName: user.role === "seller" ? user.name : sellerName,
      productId: productId || null,
      productName: productName || null,
      participants: [user.uid, sellerId],
      unreadCount: { [user.uid]: 0, [sellerId]: 0 },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      archived: false,
      muted: false,
    }

    const docRef = await addDoc(collection(db, "conversations"), conversationData)
    return docRef.id
  }

  const sendMessage = async (
    conversationId: string,
    content: string,
    receiverId: string,
    receiverName: string,
    messageType: "text" | "image" | "file" | "product" = "text",
    file?: File,
    productId?: string,
    productName?: string,
    replyTo?: string,
  ) => {
    if (!user) throw new Error("User not authenticated")

    let imageUrl: string | undefined
    let fileName: string | undefined
    let fileSize: number | undefined

    // Handle file upload
    if (file && (messageType === "image" || messageType === "file")) {
      const fileRef = ref(storage, `chat-files/${conversationId}/${Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(fileRef, file)
      imageUrl = await getDownloadURL(snapshot.ref)
      fileName = file.name
      fileSize = file.size
    }

    const messageData = {
      conversationId,
      senderId: user.uid,
      senderName: user.name,
      senderRole: user.role,
      receiverId,
      receiverName,
      content,
      timestamp: serverTimestamp(),
      read: false,
      delivered: true,
      messageType,
      productId: productId || null,
      productName: productName || null,
      imageUrl: imageUrl || null,
      fileName: fileName || null,
      fileSize: fileSize || null,
      reactions: [],
      replyTo: replyTo || null,
      edited: false,
    }

    await addDoc(collection(db, "messages"), messageData)

    // Update conversation
    const batch = writeBatch(db)
    const conversationRef = doc(db, "conversations", conversationId)

    batch.update(conversationRef, {
      lastMessage: messageType === "text" ? content : `Sent a ${messageType}`,
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
      [`unreadCount.${receiverId}`]: 1,
    })

    await batch.commit()

    // Clear typing indicator
    await sendTypingIndicator(conversationId, false)
  }

  const sendTypingIndicator = async (conversationId: string, isTyping: boolean) => {
    if (!user) return

    const typingRef = doc(db, "typing", `${conversationId}_${user.uid}`)

    if (isTyping) {
      await updateDoc(typingRef, {
        conversationId,
        userId: user.uid,
        userName: user.name,
        timestamp: serverTimestamp(),
      }).catch(async () => {
        await addDoc(collection(db, "typing"), {
          conversationId,
          userId: user.uid,
          userName: user.name,
          timestamp: serverTimestamp(),
        })
      })

      // Auto-clear typing indicator after 3 seconds
      setTimeout(() => {
        deleteDoc(typingRef).catch(() => {})
      }, 3000)
    } else {
      await deleteDoc(typingRef).catch(() => {})
    }
  }

  const markAsRead = async (conversationId: string) => {
    if (!user) return

    const batch = writeBatch(db)

    // Mark messages as read
    const messagesQuery = query(
      collection(db, "messages"),
      where("conversationId", "==", conversationId),
      where("receiverId", "==", user.uid),
      where("read", "==", false),
    )

    const snapshot = await getDocs(messagesQuery)
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true })
    })

    // Update conversation unread count
    const conversationRef = doc(db, "conversations", conversationId)
    batch.update(conversationRef, {
      [`unreadCount.${user.uid}`]: 0,
    })

    await batch.commit()
  }

  const addReaction = async (messageId: string, emoji: string) => {
    if (!user) return

    const messageRef = doc(db, "messages", messageId)
    const reaction = {
      userId: user.uid,
      userName: user.name,
      emoji,
      timestamp: serverTimestamp(),
    }

    await updateDoc(messageRef, {
      reactions: arrayUnion(reaction),
    })
  }

  const removeReaction = async (messageId: string, emoji: string) => {
    if (!user) return

    const messageRef = doc(db, "messages", messageId)
    const message = messages[Object.keys(messages)[0]]?.find((m) => m.id === messageId)

    if (message) {
      const reactionToRemove = message.reactions?.find((r) => r.userId === user.uid && r.emoji === emoji)
      if (reactionToRemove) {
        await updateDoc(messageRef, {
          reactions: arrayRemove(reactionToRemove),
        })
      }
    }
  }

  const editMessage = async (messageId: string, newContent: string) => {
    if (!user) return

    const messageRef = doc(db, "messages", messageId)
    await updateDoc(messageRef, {
      content: newContent,
      edited: true,
      editedAt: serverTimestamp(),
    })
  }

  const deleteMessage = async (messageId: string) => {
    if (!user) return

    await deleteDoc(doc(db, "messages", messageId))
  }

  const archiveConversation = async (conversationId: string) => {
    if (!user) return

    const conversationRef = doc(db, "conversations", conversationId)
    await updateDoc(conversationRef, {
      archived: true,
    })
  }

  const muteConversation = async (conversationId: string, mute: boolean) => {
    if (!user) return

    const conversationRef = doc(db, "conversations", conversationId)
    await updateDoc(conversationRef, {
      muted: mute,
    })
  }

  const searchMessages = useCallback(
    (conversationId: string, searchTerm: string): Message[] => {
      const conversationMessages = messages[conversationId] || []
      if (!searchTerm.trim()) return conversationMessages

      return conversationMessages.filter((message) => message.content.toLowerCase().includes(searchTerm.toLowerCase()))
    },
    [messages],
  )

  return (
    <MessagingContext.Provider
      value={{
        conversations,
        messages,
        typingUsers,
        sendMessage,
        sendTypingIndicator,
        createConversation,
        markAsRead,
        addReaction,
        removeReaction,
        editMessage,
        deleteMessage,
        archiveConversation,
        muteConversation,
        searchMessages,
        loading,
      }}
    >
      {children}
    </MessagingContext.Provider>
  )
}

export function useMessaging() {
  const context = useContext(MessagingContext)
  if (context === undefined) {
    throw new Error("useMessaging must be used within a MessagingProvider")
  }
  return context
}
