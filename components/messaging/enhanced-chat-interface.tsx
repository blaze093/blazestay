"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useMessaging } from "@/lib/messaging-context"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Send,
  X,
  MessageCircle,
  Package,
  Clock,
  CheckCheck,
  ImageIcon,
  Paperclip,
  Smile,
  MoreVertical,
  Edit,
  Trash2,
  Reply,
  Search,
  Sprout,
  Wheat,
  TreePine,
  Sun,
  CloudRain,
  Calendar,
  Leaf,
  Info,
  Phone,
  Video,
  Star,
} from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import type { Message } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"

interface EnhancedChatInterfaceProps {
  sellerId: string
  sellerName: string
  productId?: string
  productName?: string
  productImage?: string
  onClose?: () => void
  isEmbedded?: boolean
}

const farmingEmojis = ["🌱", "🌾", "🚜", "🥕", "🍅", "🌽", "🥬", "🍓", "🌻", "🐄", "🐔", "🌿", "🥔", "🥦", "🧑‍🌾"]
const farmingQuickReplies = [
  "Is this product freshly harvested?",
  "When was this harvested?",
  "Do you offer delivery?",
  "Is this organically grown?",
  "Can I visit your farm?",
  "What fertilizers do you use?",
  "Do you have any seasonal discounts?",
  "How should I store this produce?",
]

export function EnhancedChatInterface({
  sellerId,
  sellerName,
  productId,
  productName,
  productImage,
  onClose,
  isEmbedded = false,
}: EnhancedChatInterfaceProps) {
  const { user } = useAuth()
  const {
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
  } = useMessaging()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [weatherInfo, setWeatherInfo] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()

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

  // Simulate online status and weather
  useEffect(() => {
    const weatherConditions = [
      "Sunny and perfect for harvesting",
      "Light rain, good for the crops",
      "Warm and humid",
      "Cool breeze, ideal growing conditions",
    ]
    const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)]
    setWeatherInfo(randomWeather)

    // Simulate online status
    setIsOnline(Math.random() > 0.3) // 70% chance of being online
  }, [])

  const initializeConversation = async () => {
    try {
      const convId = await createConversation(sellerId, sellerName, productId, productName)
      setConversationId(convId)
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      })
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleTyping = useCallback(
    (value: string) => {
      setNewMessage(value)

      if (!conversationId) return

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Send typing indicator
      sendTypingIndicator(conversationId, true)

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(conversationId, false)
      }, 2000)
    },
    [conversationId, sendTypingIndicator],
  )

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId || !user || sending) return

    setSending(true)
    try {
      await sendMessage(
        conversationId,
        newMessage.trim(),
        sellerId,
        sellerName,
        "text",
        undefined,
        productId,
        productName,
        replyingTo?.id,
      )
      setNewMessage("")
      setReplyingTo(null)
      setShowQuickReplies(false)
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const handleQuickReply = async (reply: string) => {
    if (!conversationId || !user || sending) return

    setSending(true)
    try {
      await sendMessage(conversationId, reply, sellerId, sellerName, "text", undefined, productId, productName)
      setShowQuickReplies(false)
    } catch (error) {
      console.error("Error sending quick reply:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const handleFileUpload = async (file: File, type: "image" | "file") => {
    if (!conversationId || !user) return

    setSending(true)
    try {
      await sendMessage(
        conversationId,
        type === "image" ? "📷 Image" : `📎 ${file.name}`,
        sellerId,
        sellerName,
        type,
        file,
        productId,
        productName,
      )
      toast({
        title: "Success",
        description: `${type === "image" ? "Image" : "File"} sent successfully`,
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: `Failed to send ${type}`,
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const handleEditMessage = async (messageId: string) => {
    if (!editContent.trim()) return

    try {
      await editMessage(messageId, editContent.trim())
      setEditingMessage(null)
      setEditContent("")
      toast({
        title: "Success",
        description: "Message updated",
      })
    } catch (error) {
      console.error("Error editing message:", error)
      toast({
        title: "Error",
        description: "Failed to edit message",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId)
      toast({
        title: "Success",
        description: "Message deleted",
      })
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      })
    }
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const message = conversationMessages.find((m) => m.id === messageId)
      const existingReaction = message?.reactions?.find((r) => r.userId === user?.uid && r.emoji === emoji)

      if (existingReaction) {
        await removeReaction(messageId, emoji)
      } else {
        await addReaction(messageId, emoji)
      }
    } catch (error) {
      console.error("Error handling reaction:", error)
    }
  }

  const conversationMessages = conversationId ? messages[conversationId] || [] : []
  const typingIndicators = conversationId ? typingUsers[conversationId] || [] : []
  const filteredMessages = searchTerm
    ? conversationMessages.filter((m) => m.content.toLowerCase().includes(searchTerm.toLowerCase()))
    : conversationMessages

  if (!user) return null

  const getTimeOfDayIcon = () => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 18) {
      return <Sun className="h-4 w-4 text-sunny-yellow" />
    } else {
      return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getWeatherIcon = () => {
    if (!weatherInfo) return null
    if (weatherInfo.includes("rain")) return <CloudRain className="h-4 w-4 text-blue-400" />
    if (weatherInfo.includes("Sunny")) return <Sun className="h-4 w-4 text-sunny-yellow" />
    return <Leaf className="h-4 w-4 text-natural-green" />
  }

  const ChatContent = () => (
    <Card
      className={`w-full h-full shadow-2xl border-2 border-natural-green/20 bg-gradient-to-br from-cream/50 to-white overflow-hidden ${!isEmbedded ? "max-w-4xl" : ""}`}
    >
      {/* Header */}
      <CardHeader className="flex-shrink-0 bg-gradient-to-r from-natural-green to-natural-green/80 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-white/20 ring-2 ring-sunny-yellow/50">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sellerName}`} />
                <AvatarFallback className="bg-sunny-yellow text-dark-olive font-bold text-lg">
                  {sellerName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Online Status Indicator */}
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold">{sellerName}</h3>
                <Sprout className="h-5 w-5 text-sunny-yellow" />
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-sunny-yellow fill-current" />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm opacity-90">
                <Wheat className="h-4 w-4" />
                <span>Farmer • {isOnline ? "Online" : "Last seen 2 hours ago"}</span>
                {getTimeOfDayIcon()}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Video className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-5 w-5" />
            </Button>
            {!isEmbedded && onClose && (
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Info */}
        {productId && productName && (
          <>
            <Separator className="bg-white/20 my-3" />
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm"
            >
              {productImage && (
                <div className="w-12 h-12 relative">
                  <Image
                    src={productImage || "/placeholder.svg"}
                    alt={productName}
                    fill
                    className="object-cover rounded border-2 border-white/20"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-sunny-yellow mr-2" />
                  <span className="font-medium">{productName}</span>
                </div>
                <p className="text-sm opacity-80">Product inquiry</p>
              </div>
              <TreePine className="h-6 w-6 text-sunny-yellow" />
            </motion.div>

            {/* Farm Weather Info */}
            {weatherInfo && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2 flex items-center space-x-2 text-xs bg-white/10 rounded-lg p-2 backdrop-blur-sm"
              >
                {getWeatherIcon()}
                <span>Farm conditions: {weatherInfo}</span>
              </motion.div>
            )}
          </>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 bg-gradient-to-b from-cream/20 to-white">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {filteredMessages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center py-12"
              >
                <div className="bg-gradient-to-br from-natural-green/10 to-sunny-yellow/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-12 w-12 text-natural-green" />
                </div>
                <h3 className="text-xl font-semibold text-dark-olive mb-2">Start Your Farm Conversation! 🌱</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Connect with {sellerName} about fresh, quality produce directly from the farm to your table.
                </p>
                {productName && <p className="text-natural-green font-medium mt-2">Ask about {productName}</p>}

                {/* Quick Reply Suggestions */}
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-3">Suggested questions:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {farmingQuickReplies.slice(0, 4).map((reply, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        onClick={() => handleQuickReply(reply)}
                        className="px-3 py-2 bg-natural-green/10 hover:bg-natural-green/20 text-natural-green rounded-full text-sm transition-colors"
                      >
                        {reply}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-500 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                  </div>
                </div>

                {filteredMessages.map((message, index) => {
                  const isMyMessage = message.senderId === user.uid
                  const showAvatar = index === 0 || filteredMessages[index - 1].senderId !== message.senderId
                  const replyToMessage = message.replyTo ? filteredMessages.find((m) => m.id === message.replyTo) : null

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index < 5 ? 0.1 * index : 0 }}
                      className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[75%] ${isMyMessage ? "order-2" : "order-1"}`}>
                        {/* Reply Preview */}
                        {replyToMessage && (
                          <div className="mb-2 p-2 bg-gray-100 rounded-lg border-l-4 border-natural-green text-sm">
                            <p className="font-medium text-natural-green">Replying to {replyToMessage.senderName}</p>
                            <p className="text-gray-600 truncate">{replyToMessage.content}</p>
                          </div>
                        )}

                        <div
                          className={`rounded-2xl p-4 shadow-lg transition-all duration-200 hover:shadow-xl ${
                            isMyMessage
                              ? "bg-gradient-to-br from-natural-green to-natural-green/80 text-white"
                              : "bg-white border-2 border-natural-green/20 text-gray-900"
                          }`}
                        >
                          {/* Message Content */}
                          {editingMessage === message.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="min-h-[60px] resize-none"
                              />
                              <div className="flex space-x-2">
                                <Button size="sm" onClick={() => handleEditMessage(message.id)} className="farm-button">
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingMessage(null)
                                    setEditContent("")
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {message.messageType === "image" && message.imageUrl && (
                                <div className="mb-2">
                                  <Image
                                    src={message.imageUrl || "/placeholder.svg"}
                                    alt="Shared image"
                                    width={300}
                                    height={200}
                                    className="rounded-lg object-cover"
                                  />
                                </div>
                              )}

                              {message.messageType === "file" && (
                                <div className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg mb-2">
                                  <Paperclip className="h-4 w-4" />
                                  <span className="text-sm">{message.fileName}</span>
                                </div>
                              )}

                              <p className="text-sm leading-relaxed">{message.content}</p>

                              {message.edited && <p className="text-xs opacity-70 mt-1">(edited)</p>}
                            </>
                          )}

                          {/* Message Footer */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isMyMessage && (
                                <div className="flex items-center">
                                  {message.read ? (
                                    <CheckCheck className="h-3 w-3 opacity-70" />
                                  ) : (
                                    <Clock className="h-3 w-3 opacity-70" />
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Message Actions */}
                            <div className="flex items-center space-x-1">
                              {/* Reactions */}
                              {message.reactions && message.reactions.length > 0 && (
                                <div className="flex space-x-1">
                                  {Array.from(new Set(message.reactions.map((r) => r.emoji))).map((emoji) => {
                                    const count = message.reactions?.filter((r) => r.emoji === emoji).length || 0
                                    const hasMyReaction = message.reactions?.some(
                                      (r) => r.userId === user.uid && r.emoji === emoji,
                                    )
                                    return (
                                      <Button
                                        key={emoji}
                                        size="sm"
                                        variant="ghost"
                                        className={`h-6 px-2 text-xs ${
                                          hasMyReaction ? "bg-sunny-yellow/20" : ""
                                        } rounded-full`}
                                        onClick={() => handleReaction(message.id, emoji)}
                                      >
                                        {emoji} {count}
                                      </Button>
                                    )
                                  })}
                                </div>
                              )}

                              {/* Action Menu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 opacity-50 hover:opacity-100 rounded-full"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => setReplyingTo(message)}>
                                    <Reply className="h-4 w-4 mr-2" />
                                    Reply
                                  </DropdownMenuItem>
                                  {farmingEmojis.slice(0, 6).map((emoji) => (
                                    <DropdownMenuItem key={emoji} onClick={() => handleReaction(message.id, emoji)}>
                                      <span className="mr-2">{emoji}</span>
                                      React with {emoji}
                                    </DropdownMenuItem>
                                  ))}
                                  {isMyMessage && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingMessage(message.id)
                                          setEditContent(message.content)
                                        }}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteMessage(message.id)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Avatar */}
                      {showAvatar && !isMyMessage && (
                        <Avatar className="h-8 w-8 order-1 mr-2 mt-auto">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderName}`} />
                          <AvatarFallback className="bg-natural-green text-white text-xs">
                            {message.senderName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  )
                })}

                {/* Typing Indicators */}
                {typingIndicators.length > 0 && (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, delay: 0 }}
                        className="w-2 h-2 bg-natural-green rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, delay: 0.2 }}
                        className="w-2 h-2 bg-natural-green rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, delay: 0.4 }}
                        className="w-2 h-2 bg-natural-green rounded-full"
                      />
                    </div>
                    <span className="text-sm">{typingIndicators.map((t) => t.userName).join(", ")} typing...</span>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Reply Preview */}
        <AnimatePresence>
          {replyingTo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 py-2 bg-gray-50 border-t overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Reply className="h-4 w-4 text-natural-green" />
                  <span className="text-sm font-medium">Replying to {replyingTo.senderName}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 truncate mt-1">{replyingTo.content}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Replies */}
        <AnimatePresence>
          {showQuickReplies && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 py-2 bg-gray-50 border-t overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Sprout className="h-4 w-4 text-natural-green" />
                  <span className="text-sm font-medium">Quick Questions</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setShowQuickReplies(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {farmingQuickReplies.map((reply, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleQuickReply(reply)}
                    className="px-3 py-1 bg-natural-green/10 hover:bg-natural-green/20 text-natural-green rounded-full text-sm transition-colors"
                  >
                    {reply}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Input */}
        <div className="p-4 border-t bg-gradient-to-r from-cream/30 to-white">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
            {/* File Upload Buttons */}
            <div className="flex space-x-1">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, "image")
                }}
              />
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, "file")
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="border-natural-green/30 hover:bg-natural-green/10 rounded-full"
                onClick={() => imageInputRef.current?.click()}
                disabled={sending}
              >
                <ImageIcon className="h-4 w-4 text-natural-green" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="border-natural-green/30 hover:bg-natural-green/10 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
              >
                <Paperclip className="h-4 w-4 text-natural-green" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="border-natural-green/30 hover:bg-natural-green/10 rounded-full"
                onClick={() => setShowQuickReplies(!showQuickReplies)}
                disabled={sending}
              >
                <Info className="h-4 w-4 text-natural-green" />
              </Button>
            </div>

            {/* Message Input */}
            <div className="flex-1 relative">
              <Textarea
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder={`Message ${sellerName} about fresh produce...`}
                className="min-h-[50px] max-h-32 resize-none pr-12 border-2 border-natural-green/30 focus:border-natural-green rounded-xl"
                disabled={sending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-2 bottom-2 h-8 w-8"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-4 w-4 text-natural-green" />
              </Button>

              {/* Emoji Picker */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute bottom-12 right-0 bg-white border-2 border-natural-green/20 rounded-lg p-3 shadow-lg z-10"
                  >
                    <div className="grid grid-cols-6 gap-2">
                      {farmingEmojis.map((emoji) => (
                        <Button
                          key={emoji}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-sunny-yellow/20 rounded-full"
                          onClick={() => {
                            setNewMessage(newMessage + emoji)
                            setShowEmojiPicker(false)
                          }}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              className="bg-gradient-to-r from-natural-green to-natural-green/80 hover:from-natural-green/90 hover:to-natural-green/70 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={!newMessage.trim() || sending}
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )

  if (isEmbedded) {
    return <ChatContent />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 15 }}
        className="w-full max-w-4xl h-[700px] flex flex-col"
      >
        <ChatContent />
      </motion.div>
    </motion.div>
  )
}
