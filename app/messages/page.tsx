"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useMessaging } from "@/lib/messaging-context"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, MessageCircle, Package, Sprout, Wheat, Users, Filter, Archive, MoreVertical } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { EnhancedChatInterface } from "@/components/messaging/enhanced-chat-interface"
import type { Conversation } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function MessagesPage() {
  const { user } = useAuth()
  const { conversations, loading, markAsRead, archiveConversation, muteConversation } = useMessaging()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "unread" | "archived">("all")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      (user?.role === "buyer" ? conv.sellerName : conv.buyerName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conv.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesFilter =
      filterType === "all"
        ? !conv.archived
        : filterType === "unread"
          ? (conv.unreadCount?.[user?.uid || ""] || 0) > 0
          : filterType === "archived"
            ? conv.archived
            : true

    return matchesSearch && matchesFilter
  })

  const handleConversationClick = async (conversation: Conversation) => {
    setSelectedConversation(conversation)
    if ((conversation.unreadCount?.[user?.uid || ""] || 0) > 0) {
      await markAsRead(conversation.id)
    }
  }

  const handleArchive = async (conversationId: string) => {
    try {
      await archiveConversation(conversationId)
      toast({
        title: "Success",
        description: "Conversation archived",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive conversation",
        variant: "destructive",
      })
    }
  }

  const handleMute = async (conversationId: string, mute: boolean) => {
    try {
      await muteConversation(conversationId, mute)
      toast({
        title: "Success",
        description: mute ? "Conversation muted" : "Conversation unmuted",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update conversation",
        variant: "destructive",
      })
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-cream p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-10 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Loading conversations...</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream/50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-natural-green to-natural-green/80 p-3 rounded-full">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-dark-olive">Messages</h1>
                <p className="text-gray-600">
                  {user.role === "buyer" ? "Chat with farmers about fresh produce" : "Connect with your customers"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sprout className="h-6 w-6 text-natural-green" />
              <span className="text-sm text-gray-500">
                {filteredConversations.length} conversation{filteredConversations.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          {/* Conversations List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="h-full flex flex-col shadow-lg border-2 border-natural-green/20">
              <CardHeader className="bg-gradient-to-r from-natural-green/10 to-sunny-yellow/10 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-dark-olive flex items-center">
                    <Users className="h-5 w-5 mr-2 text-natural-green" />
                    Conversations
                  </h2>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setFilterType("all")}>All Conversations</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType("unread")}>Unread Only</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType("archived")}>Archived</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-natural-green/30 focus:border-natural-green"
                  />
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full">
                  {filteredConversations.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <div className="bg-gradient-to-br from-natural-green/10 to-sunny-yellow/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="h-8 w-8 text-natural-green" />
                      </div>
                      <h3 className="text-lg font-medium text-dark-olive mb-2">No Conversations</h3>
                      <p className="text-gray-600 text-sm">
                        {user.role === "buyer"
                          ? "Start chatting with farmers about their products"
                          : "Customers will message you about your products"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      <AnimatePresence>
                        {filteredConversations.map((conversation, index) => {
                          const otherUser = user.role === "buyer" ? conversation.sellerName : conversation.buyerName
                          const unreadCount = conversation.unreadCount?.[user.uid] || 0
                          const isSelected = selectedConversation?.id === conversation.id

                          return (
                            <motion.div
                              key={conversation.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ delay: index * 0.05 }}
                              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                                isSelected
                                  ? "bg-gradient-to-r from-natural-green/20 to-sunny-yellow/20 border-2 border-natural-green/30"
                                  : "hover:bg-gray-50 border-2 border-transparent"
                              }`}
                              onClick={() => handleConversationClick(conversation)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <Avatar className="h-12 w-12 border-2 border-natural-green/20">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser}`} />
                                    <AvatarFallback className="bg-natural-green text-white font-medium">
                                      {otherUser.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  {user.role === "buyer" && (
                                    <div className="absolute -bottom-1 -right-1 bg-sunny-yellow rounded-full p-1">
                                      <Wheat className="h-3 w-3 text-dark-olive" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-dark-olive truncate">{otherUser}</h3>
                                    <div className="flex items-center space-x-1">
                                      {conversation.lastMessageTime && (
                                        <span className="text-xs text-gray-500">
                                          {conversation.lastMessageTime.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      )}
                                      {unreadCount > 0 && (
                                        <Badge className="bg-natural-green text-white text-xs px-2 py-1">
                                          {unreadCount}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {conversation.productName && (
                                    <div className="flex items-center mt-1">
                                      <Package className="h-3 w-3 text-natural-green mr-1" />
                                      <span className="text-xs text-natural-green font-medium truncate">
                                        {conversation.productName}
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between mt-1">
                                    <p className="text-sm text-gray-600 truncate">
                                      {conversation.lastMessage || "No messages yet"}
                                    </p>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <MoreVertical className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={() => handleMute(conversation.id, !conversation.muted)}
                                        >
                                          {conversation.muted ? "Unmute" : "Mute"}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleArchive(conversation.id)}>
                                          <Archive className="h-4 w-4 mr-2" />
                                          Archive
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Chat Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {selectedConversation ? (
              <div className="h-full">
                <EnhancedChatInterface
                  sellerId={user.role === "buyer" ? selectedConversation.sellerId : selectedConversation.buyerId}
                  sellerName={user.role === "buyer" ? selectedConversation.sellerName : selectedConversation.buyerName}
                  productId={selectedConversation.productId || undefined}
                  productName={selectedConversation.productName || undefined}
                  onClose={() => setSelectedConversation(null)}
                  isEmbedded={true}
                />
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center shadow-lg border-2 border-natural-green/20">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-natural-green/10 to-sunny-yellow/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="h-12 w-12 text-natural-green" />
                  </div>
                  <h3 className="text-xl font-semibold text-dark-olive mb-2">
                    {user.role === "buyer" ? "Connect with Farmers" : "Chat with Customers"}
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    {user.role === "buyer"
                      ? "Select a conversation to start chatting with farmers about fresh, quality produce."
                      : "Select a conversation to help customers with their inquiries about your products."}
                  </p>
                  <div className="flex items-center justify-center mt-4 space-x-2">
                    <Sprout className="h-5 w-5 text-natural-green" />
                    <span className="text-sm text-gray-500">Farm to Table Communication</span>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
