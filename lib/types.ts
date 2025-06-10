export interface User {
  uid: string
  email: string
  name: string
  role: "buyer" | "seller"
  profileImage?: string
  phone?: string
  address?: string
  createdAt: Date
  isOnline?: boolean
  lastSeen?: Date
  location?: {
    latitude: number
    longitude: number
    address?: string
    city?: string
    state?: string
  }
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageURL: string
  sellerId: string
  sellerName: string
  stock: number
  unit: string // kg, piece, dozen, etc.
  isOrganic: boolean
  harvestDate?: Date
  location: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  rating: number
  reviewCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  buyerId: string
  buyerName: string
  buyerEmail: string
  items: OrderItem[]
  totalAmount: number
  status: "pending" | "confirmed" | "packed" | "dispatched" | "delivered" | "cancelled"
  shippingAddress: Address
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "failed"
  createdAt: Date
  updatedAt: Date
  statusHistory?: OrderStatusUpdate[]
}

export interface OrderStatusUpdate {
  status: string
  timestamp: Date
  updatedBy: string
  notes?: string
}

export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  sellerId: string
  sellerName: string
  quantity: number
  price: number
  unit: string
}

export interface Address {
  street: string
  city: string
  state: string
  pincode: string
  country: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export interface Review {
  id: string
  productId: string
  buyerId: string
  buyerName: string
  rating: number
  comment: string
  createdAt: Date
}

export interface WishlistItem {
  id: string
  buyerId: string
  productId: string
  addedAt: Date
}

export interface CartItem {
  productId: string
  quantity: number
  addedAt: Date
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: "buyer" | "seller"
  receiverId: string
  receiverName: string
  content: string
  timestamp: Date
  read: boolean
  delivered: boolean
  messageType: "text" | "image" | "file" | "product" | "order"
  productId?: string
  productName?: string
  imageUrl?: string
  fileName?: string
  fileSize?: number
  reactions?: MessageReaction[]
  replyTo?: string
  edited?: boolean
  editedAt?: Date
}

export interface MessageReaction {
  userId: string
  userName: string
  emoji: string
  timestamp: Date
}

export interface Conversation {
  id: string
  buyerId: string
  buyerName: string
  buyerAvatar?: string
  sellerId: string
  sellerName: string
  sellerAvatar?: string
  productId?: string
  productName?: string
  productImage?: string
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount: { [userId: string]: number }
  participants: string[]
  createdAt: Date
  updatedAt: Date
  isTyping?: { [userId: string]: boolean }
  archived?: boolean
  muted?: boolean
}

export interface TypingIndicator {
  conversationId: string
  userId: string
  userName: string
  timestamp: Date
}
