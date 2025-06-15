"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "@/components/auth-modal"
import {
  ShoppingBag,
  Heart,
  Bell,
  User,
  Package,
  TrendingUp,
  Star,
  MapPin,
  Calendar,
  Truck,
  DollarSign,
  Eye,
  ArrowRight,
  Settings,
  Loader2
} from "lucide-react"

// Mock data - in real app this would come from API based on user
const getMockUserData = (user: any) => ({
  totalOrders: Math.floor(Math.random() * 50) + 1,
  totalSpent: Math.floor(Math.random() * 5000) + 100,
  savedFarms: Math.floor(Math.random() * 15) + 1,
  wishlistItems: Math.floor(Math.random() * 20) + 1
})

const recentOrders = [
  {
    id: "ORD-001",
    date: "2024-06-12",
    farmName: "Liberian Organic Collective",
    items: ["Organic Cassava (5kg)", "Fresh Ginger (2kg)"],
    total: 175,
    status: "delivered",
    trackingNumber: "LBR-001-2024"
  },
  {
    id: "ORD-002", 
    date: "2024-06-10",
    farmName: "Kampala Fresh Co-op",
    items: ["Coffee Beans (1kg)"],
    total: 250,
    status: "in_transit",
    trackingNumber: "UGA-002-2024"
  },
  {
    id: "ORD-003",
    date: "2024-06-08",
    farmName: "Nimba County Farms",
    items: ["Palm Oil (2L)", "Organic Yams (3kg)"],
    total: 435,
    status: "processing",
    trackingNumber: "LBR-003-2024"
  }
]

const wishlistItems = [
  {
    id: "1",
    name: "Sweet Potatoes",
    farmName: "Monrovia Farms",
    price: 38,
    image: "/api/placeholder/100/100",
    inStock: true
  },
  {
    id: "2",
    name: "Sesame Seeds",
    farmName: "Jinja Organic Farms", 
    price: 65,
    image: "/api/placeholder/100/100",
    inStock: true
  },
  {
    id: "3",
    name: "Fresh Bananas",
    farmName: "Entebbe Fruit Gardens",
    price: 25,
    image: "/api/placeholder/100/100",
    inStock: false
  }
]

const notifications = [
  {
    id: "1",
    type: "order_update",
    title: "Order Delivered",
    message: "Your order from Liberian Organic Collective has been delivered",
    timestamp: "2 hours ago",
    read: false
  },
  {
    id: "2", 
    type: "farm_message",
    title: "Message from Kampala Fresh Co-op",
    message: "Thank you for your order! Your coffee beans are freshly roasted.",
    timestamp: "1 day ago",
    read: false
  },
  {
    id: "3",
    type: "price_drop",
    title: "Price Drop Alert",
    message: "Sweet Potatoes from Monrovia Farms are now 20% off!",
    timestamp: "2 days ago",
    read: true
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered": return "bg-green-100 text-green-800"
    case "in_transit": return "bg-blue-100 text-blue-800"
    case "processing": return "bg-yellow-100 text-yellow-800"
    case "cancelled": return "bg-red-100 text-red-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "delivered": return "Delivered"
    case "in_transit": return "In Transit"
    case "processing": return "Processing"
    case "cancelled": return "Cancelled"
    default: return "Unknown"
  }
}

export default function BuyerDashboard() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect farmers to their dashboard
  useEffect(() => {
    if (mounted && user && user.role === 'farmer') {
      router.push('http://localhost:3000/landing')
    }
  }, [user, mounted, router])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth modal if not logged in
  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
            >
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <h1 className="text-2xl font-bold mb-2">Welcome to Your Dashboard</h1>
              <p className="text-muted-foreground mb-6">
                Sign in to access your orders, wishlist, and account settings.
              </p>
              <Button onClick={() => setAuthModalOpen(true)} className="w-full">
                Sign In to Continue
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="text-green-600 hover:underline"
                >
                  Sign up here
                </button>
              </p>
            </motion.div>
          </div>
        </div>
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)}
          defaultRole="buyer"
        />
      </>
    )
  }

  const mockUserData = getMockUserData(user)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-green-100 text-green-700 text-xl">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">Welcome back, {user.name.split(' ')[0]}!</h1>
                <p className="text-muted-foreground">
                  Member since {new Date(user.joinedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Link href="/dashboard/settings">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { 
              label: "Total Orders", 
              value: mockUserData.totalOrders, 
              icon: ShoppingBag,
              color: "text-blue-600"
            },
            { 
              label: "Total Spent", 
              value: `L$ ${mockUserData.totalSpent}`, 
              icon: DollarSign,
              color: "text-green-600"
            },
            { 
              label: "Saved Farms", 
              value: mockUserData.savedFarms, 
              icon: Heart,
              color: "text-red-600"
            },
            { 
              label: "Wishlist Items", 
              value: mockUserData.wishlistItems, 
              icon: Star,
              color: "text-yellow-600"
            }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Orders</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/dashboard/orders">
                        View All <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">#{order.id}</span>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{order.farmName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">L$ {order.total}</p>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Notifications</CardTitle>
                    <Button variant="ghost" size="sm">
                      Mark All Read
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className={`p-3 border rounded-lg ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{notification.title}</h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {notification.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>
                    Track your orders and view purchase history
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold">#{order.id}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Farm</p>
                            <p className="font-medium">{order.farmName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Items</p>
                            <p className="font-medium">{order.items.join(", ")}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="font-medium">{new Date(order.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Tracking</p>
                            <p className="font-medium">{order.trackingNumber}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">L$ {order.total}</p>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Truck className="mr-2 h-4 w-4" />
                            Track
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlist" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Your Wishlist</CardTitle>
                  <CardDescription>
                    Save items you want to buy later
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h3 className="font-semibold mb-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{item.farmName}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-green-600">L$ {item.price}</span>
                          <Badge variant={item.inStock ? "secondary" : "destructive"}>
                            {item.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            disabled={!item.inStock}
                          >
                            Add to Cart
                          </Button>
                          <Button variant="outline" size="sm">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Stay updated on your orders and favorite farms
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    Mark All Read
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`p-4 border rounded-lg ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{notification.title}</h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                          </div>
                          <p className="text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.timestamp}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          {notification.read ? "Mark Unread" : "Mark Read"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/marketplace">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <ShoppingBag className="h-6 w-6" />
                    Browse Marketplace
                  </Button>
                </Link>
                <Link href="/farms">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <MapPin className="h-6 w-6" />
                    Explore Farms
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Settings className="h-6 w-6" />
                    Account Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
