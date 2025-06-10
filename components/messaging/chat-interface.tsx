"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useMessaging } from "@/lib/messaging-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, X, MessageCircle, Package, Clock } from "lucide-react"
import Image from "next/image"

interface ChatInterfaceProps {
  sellerId: string
  sellerName: string
  productId?: string
  productName?: string
  productImage?: string
  onClose: () => void
}

export function ChatInterface({
  sellerId,
  sellerName,
  productId,
  productName,
  productImage,
  onClose,
}: ChatInterfaceProps) {
  const { user } = useAuth()
  const { messages, sendMessage, createConversation, markAsRead } = useMessaging()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user && sellerId) {
      initializeConversation()
    }
  }, [user, sellerId, productId])

  useEffect(() => {
    scrollToBottom()
  }, [messages, conversationId])

  useEffect(() => {
    if (conversationId) {
      markAsRead(conversationId)
    }
  }, [conversationId, markAsRead])

  const initializeConversation = async () => {
    try {
      const convId = await createConversation(sellerId, sellerName, productId, productName)
      setConversationId(convId)
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId || !user || sending) return

    setSending(true)
    try {
      await sendMessage(conversationId, newMessage.trim(), sellerId, sellerName, productId, productName)
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const conversationMessages = conversationId ? messages[conversationId] || [] : []

  if (!user) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-natural-green text-white">
                  {sellerName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{sellerName}</CardTitle>
                <p className="text-sm text-gray-600">Farmer</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {productId && productName && (
            <>
              <Separator />
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {productImage && (
                  <div className="w-12 h-12 relative">
                    <Image
                      src={productImage || "/placeholder.svg"}
                      alt={productName}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 text-natural-green mr-2" />
                    <span className="font-medium text-sm">{productName}</span>
                  </div>
                  <p className="text-xs text-gray-600">Product inquiry</p>
                </div>
              </div>
            </>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {conversationMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Start a conversation with {sellerName}</p>
                  {productName && <p className="text-sm text-gray-500 mt-2">Ask about {productName}</p>}
                </div>
              ) : (
                conversationMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user.uid ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId === user.uid ? "bg-natural-green text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.senderId === user.uid && (
                          <div className="flex items-center">
                            {message.read ? (
                              <div className="text-xs opacity-70">Read</div>
                            ) : (
                              <Clock className="h-3 w-3 opacity-70" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${sellerName}...`}
                className="flex-1"
                disabled={sending}
              />
              <Button type="submit" size="icon" className="farm-button" disabled={!newMessage.trim() || sending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
