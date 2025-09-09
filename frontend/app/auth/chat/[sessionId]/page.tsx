"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Send,
  Paperclip,
  Smile,
  Users,
  Shield,
  ArrowLeft,
  Phone,
  Video,
  Settings,
  Search,
  ImageIcon,
  File,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface Message {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: Date
  encrypted: boolean
  status: "sending" | "sent" | "delivered" | "read"
  reactions?: { emoji: string; users: string[] }[]
  replyTo?: string
  fileUrl?: string
  fileName?: string
  fileType?: string
}

interface User {
  id: string
  name: string
  avatar?: string
  status: "online" | "away" | "offline"
  isTyping: boolean
}

export default function ChatPage() {
  const params = useParams()
  const sessionId = params?.sessionId as string
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [currentUser] = useState({
    id: "user-1",
    name: "You",
    avatar: "/diverse-user-avatars.png",
  })
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Mock encryption/decryption
  const encryptMessage = (text: string): string => {
    return btoa(text) // Simple base64 encoding for demo
  }

  const decryptMessage = (encrypted: string): string => {
    try {
      return atob(encrypted) // Simple base64 decoding for demo
    } catch {
      return encrypted
    }
  }

  // Initialize mock data
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: "user-1",
        name: "You",
        status: "online",
        isTyping: false,
      },
      {
        id: "user-2",
        name: "Kartik Pant",
        avatar: "/alice-avatar.jpg",
        status: "online",
        isTyping: false,
      },
      {
        id: "user-3",
        name: "Abhay goswami",
        avatar: "/bob-avatar.jpg",
        status: "away",
        isTyping: false,
      },
    ]

    const mockMessages: Message[] = [
      {
        id: "1",
        userId: "user-2",
        userName: "Kartik Pant",
        userAvatar: "/alice-avatar.jpg",
        content: encryptMessage("Hey everyone! Welcome to our secure chat session."),
        timestamp: new Date(Date.now() - 300000),
        encrypted: true,
        status: "read",
        reactions: [{ emoji: "👋", users: ["user-1", "user-3"] }],
      },
      {
        id: "2",
        userId: "user-1",
        userName: "You",
        content: encryptMessage("this is hardcoded message"),
        timestamp: new Date(Date.now() - 240000),
        encrypted: true,
        status: "read",
      },
      {
        id: "3",
        userId: "user-3",
        userName: "abhay",
        userAvatar: "/bob-avatar.jpg",
        content: encryptMessage("Agreed! This is much more secure than our usual chats."),
        timestamp: new Date(Date.now() - 180000),
        encrypted: true,
        status: "delivered",
        reactions: [{ emoji: "🔒", users: ["user-1"] }],
      },
    ]

    setUsers(mockUsers)
    setMessages(mockMessages)
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Mock typing simulation
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => setIsTyping(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isTyping])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "k":
            e.preventDefault()
            setShowSearch(!showSearch)
            break
          case "f":
            e.preventDefault()
            setShowSearch(true)
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showSearch])

  const sendMessage = () => {
    if (!message.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: encryptMessage(message),
      timestamp: new Date(),
      encrypted: true,
      status: "sending",
    }

    setMessages((prev) => [...prev, newMessage])
    setMessage("")

    // Simulate message status updates
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "sent" as const } : msg)))
    }, 500)

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "delivered" as const } : msg)),
      )
    }, 1000)

    // Mock response from other user
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const responses = [
          "That's interesting!",
          "I agree with that.",
          "Good point!",
          "Thanks for sharing.",
          "Let me think about that.",
        ]
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          userId: "user-2",
          userName: "Nivedita",
          userAvatar: "/alice-avatar.jpg",
          content: encryptMessage(randomResponse),
          timestamp: new Date(),
          encrypted: true,
          status: "sent",
        }
        setMessages((prev) => [...prev, responseMessage])
      }, 2000)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Mock file upload
      const fileMessage: Message = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        content: encryptMessage(`Shared a file: ${file.name}`),
        timestamp: new Date(),
        encrypted: true,
        status: "sending",
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileType: file.type,
      }

      setMessages((prev) => [...prev, fileMessage])

      // Simulate upload completion
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === fileMessage.id ? { ...msg, status: "sent" as const } : msg)),
        )
      }, 1000)
    }
  }

  const addReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || []
          const existingReaction = reactions.find((r) => r.emoji === emoji)

          if (existingReaction) {
            if (existingReaction.users.includes(currentUser.id)) {
              // Remove reaction
              existingReaction.users = existingReaction.users.filter((id) => id !== currentUser.id)
              if (existingReaction.users.length === 0) {
                return { ...msg, reactions: reactions.filter((r) => r.emoji !== emoji) }
              }
            } else {
              // Add reaction
              existingReaction.users.push(currentUser.id)
            }
          } else {
            // New reaction
            reactions.push({ emoji, users: [currentUser.id] })
          }

          return { ...msg, reactions }
        }
        return msg
      }),
    )
  }

  const filteredMessages = messages.filter((msg) =>
    searchQuery ? decryptMessage(msg.content).toLowerCase().includes(searchQuery.toLowerCase()) : true,
  )

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sending":
        return <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
      case "sent":
        return <div className="w-2 h-2 bg-muted-foreground rounded-full" />
      case "delivered":
        return <div className="w-2 h-2 bg-accent rounded-full" />
      case "read":
        return <div className="w-2 h-2 bg-green-500 rounded-full" />
    }
  }

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-80" : "w-0"} transition-all duration-300 border-r border-border bg-card/30 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Session: {sessionId}</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <Shield className="w-3 h-3 mr-1" />
              Encrypted
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" className="bg-transparent">
              <Phone className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="bg-transparent">
              <Video className="w-4 h-4" />
            </Button>
            <Link href="/settings">
              <Button size="sm" variant="outline" className="bg-transparent">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Participants ({users.length})</h3>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/5">
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                      user.status === "online"
                        ? "bg-green-500"
                        : user.status === "away"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  {user.isTyping && <p className="text-xs text-muted-foreground">typing...</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-accent/10"
              >
                <Users className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Secure Chat</h1>
                <p className="text-sm text-muted-foreground">End-to-end encrypted</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={showSearch} onOpenChange={setShowSearch}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-accent/10">
                    <Search className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Search Messages</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Search in conversation..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    <div className="text-sm text-muted-foreground">
                      {searchQuery && `Found ${filteredMessages.length} messages`}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="hover:bg-accent/10">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.userId === currentUser.id ? "justify-end" : "justify-start"} group`}
              >
                <div
                  className={`flex space-x-2 max-w-[70%] ${msg.userId === currentUser.id ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  {msg.userId !== currentUser.id && (
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarImage src={msg.userAvatar || "/placeholder.svg"} />
                      <AvatarFallback>{msg.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}

                  <div className="space-y-1">
                    {msg.userId !== currentUser.id && (
                      <p className="text-xs text-muted-foreground px-3">{msg.userName}</p>
                    )}

                    <Card
                      className={`${
                        msg.userId === currentUser.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border"
                      } shadow-sm`}
                    >
                      <CardContent className="p-3">
                        {msg.fileUrl && (
                          <div className="mb-2">
                            {msg.fileType?.startsWith("image/") ? (
                              <ImageIcon
                                src={msg.fileUrl || "/placeholder.svg"}
                                alt={msg.fileName}
                                className="max-w-full h-auto rounded-lg max-h-64 object-cover"
                              />
                            ) : (
                              <div className="flex items-center space-x-2 p-2 bg-muted/20 rounded-lg">
                                <File className="w-4 h-4" />
                                <span className="text-sm">{msg.fileName}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">
                          {msg.encrypted ? decryptMessage(msg.content) : msg.content}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Reactions */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex space-x-1 px-3">
                        {msg.reactions.map((reaction, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs hover:bg-accent/10"
                            onClick={() => addReaction(msg.id, reaction.emoji)}
                          >
                            {reaction.emoji} {reaction.users.length}
                          </Button>
                        ))}
                      </div>
                    )}

                    <div
                      className={`flex items-center space-x-2 px-3 ${msg.userId === currentUser.id ? "justify-end" : "justify-start"}`}
                    >
                      <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
                      {msg.userId === currentUser.id && getStatusIcon(msg.status)}
                    </div>

                    {/* Quick reactions (show on hover) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 px-3">
                      {["❤️", "👍", "😂", "😮", "😢", "😡"].map((emoji) => (
                        <Button
                          key={emoji}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-accent/10"
                          onClick={() => addReaction(msg.id, emoji)}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {users.some((user) => user.isTyping && user.id !== currentUser.id) && (
              <div className="flex justify-start">
                <div className="flex space-x-2 max-w-[70%]">
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <Card className="bg-card border-border shadow-sm">
                    <CardContent className="p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,application/pdf,.doc,.docx,.txt"
            />
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent/10"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  setIsTyping(true)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Type your message... (encrypted)"
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-accent/10"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>

            <Button onClick={sendMessage} disabled={!message.trim()} className="shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Messages are end-to-end encrypted</span>
            </div>
            <span>Press Enter to send • Ctrl+K to search</span>
          </div>
        </div>
      </div>
    </div>
  )
}
