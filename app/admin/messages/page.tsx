"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Search, Eye, Trash2, Archive, Reply } from "lucide-react"
import { format } from "date-fns"
import AdminHeader from "@/components/admin/admin-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Message {
  id: string
  fromName: string
  fromEmail: string
  fromAvatar?: string
  toName: string
  toEmail: string
  subject: string
  content: string
  timestamp: Date
  isRead: boolean
  priority: "low" | "medium" | "high"
  category: "support" | "complaint" | "inquiry" | "feedback"
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      fromName: "Rajesh Kumar",
      fromEmail: "rajesh@example.com",
      fromAvatar: "/placeholder.svg",
      toName: "Support Team",
      toEmail: "support@tazatokri.com",
      subject: "Issue with order delivery",
      content:
        "My order #12345 was supposed to be delivered yesterday but I haven't received it yet. Can you please check the status?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false,
      priority: "high",
      category: "complaint",
    },
    {
      id: "2",
      fromName: "Priya Singh",
      fromEmail: "priya@example.com",
      fromAvatar: "/placeholder.svg",
      toName: "Support Team",
      toEmail: "support@tazatokri.com",
      subject: "Question about organic certification",
      content: "I want to know more about the organic certification process for farmers. Can you provide more details?",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      isRead: true,
      priority: "medium",
      category: "inquiry",
    },
    {
      id: "3",
      fromName: "Amit Patel",
      fromEmail: "amit@example.com",
      fromAvatar: "/placeholder.svg",
      toName: "Support Team",
      toEmail: "support@tazatokri.com",
      subject: "Great service!",
      content:
        "I wanted to thank you for the excellent service. The vegetables I ordered were fresh and delivered on time.",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true,
      priority: "low",
      category: "feedback",
    },
    {
      id: "4",
      fromName: "Sunita Sharma",
      fromEmail: "sunita@example.com",
      fromAvatar: "/placeholder.svg",
      toName: "Support Team",
      toEmail: "support@tazatokri.com",
      subject: "Payment issue",
      content: "I'm having trouble with the payment gateway. It keeps showing an error when I try to pay for my order.",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isRead: false,
      priority: "high",
      category: "support",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      searchTerm === "" ||
      message.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = !categoryFilter || categoryFilter === "all" || message.category === categoryFilter
    const matchesPriority = !priorityFilter || priorityFilter === "all" || message.priority === priorityFilter

    return matchesSearch && matchesCategory && matchesPriority
  })

  const handleSearch = () => {
    // Already filtering in the filteredMessages variable
  }

  const markAsRead = (id: string) => {
    setMessages(messages.map((msg) => (msg.id === id ? { ...msg, isRead: true } : msg)))
  }

  const deleteMessage = (id: string) => {
    setMessages(messages.filter((msg) => msg.id !== id))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "low":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "support":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "complaint":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "inquiry":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "feedback":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader title="Messages Management" description="Manage customer messages and support requests" />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>

            <div className="flex gap-2">
              <Select onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)} defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="inquiry">Inquiry</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setPriorityFilter(value === "all" ? null : value)} defaultValue="all">
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">From</th>
                  <th className="text-left py-3 px-4 font-medium">Subject</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Priority</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted-foreground">
                      No messages found
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((message) => (
                    <tr key={message.id} className={`border-b hover:bg-gray-50 ${!message.isRead ? "bg-blue-50" : ""}`}>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={message.fromAvatar || "/placeholder.svg"} alt={message.fromName} />
                            <AvatarFallback>{message.fromName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{message.fromName}</p>
                            <p className="text-xs text-muted-foreground">{message.fromEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className={`font-medium ${!message.isRead ? "font-bold" : ""}`}>{message.subject}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{message.content}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`font-normal ${getCategoryColor(message.category)}`}>
                          {message.category.charAt(0).toUpperCase() + message.category.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`font-normal ${getPriorityColor(message.priority)}`}>
                          {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        {format(message.timestamp, "MMM dd, yyyy")}
                        <br />
                        <span className="text-xs text-muted-foreground">{format(message.timestamp, "HH:mm")}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div
                            className={`h-2 w-2 rounded-full mr-2 ${message.isRead ? "bg-gray-300" : "bg-blue-500"}`}
                          ></div>
                          <span>{message.isRead ? "Read" : "Unread"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => markAsRead(message.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Message
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Reply className="h-4 w-4 mr-2" />
                              Reply
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteMessage(message.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {filteredMessages.length} of {messages.length} messages
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <div className="text-sm">Page 1 of 1</div>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
