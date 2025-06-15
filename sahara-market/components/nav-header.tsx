"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { CartDropdown } from "@/components/cart-dropdown"
import { AuthModal } from "@/components/auth-modal"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import {
  Leaf,
  Sparkles,
  User,
  ShoppingCart,
  Menu,
  Heart,
  Bell,
  Search,
  LogOut,
  Settings,
  Package
} from "lucide-react"

const navigation = [
  { name: "Market", href: "/marketplace" },
  { name: "Farms", href: "/farms" },
  { name: "Categories", href: "/categories" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" }
]

export function NavHeader() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { user, logout, isLoading } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleAuthClick = () => {
    setAuthModalOpen(true)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/">
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Leaf className="h-7 w-7 text-green-600" />
              </motion.div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  SaharaMarket
                </h1>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hidden lg:flex text-xs px-1 py-0">
                  <Sparkles className="mr-1 h-2 w-2" />
                  Farm Fresh
                </Badge>
              </div>
            </motion.div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
            {navigation.map((item, index) => (
              <motion.div key={item.name}>
                <Link
                  href={item.href}
                  className={`text-sm font-medium transition-colors relative px-2 py-1 rounded ${
                    pathname === item.href
                      ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                      : "hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  }`}
                >
                  <motion.span
                    whileHover={{ y: -1 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {item.name}
                  </motion.span>
                </Link>
              </motion.div>
            ))}
          </nav>
          
          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button variant="ghost" size="sm" className="hidden lg:flex p-2">
              <Search className="h-4 w-4" />
            </Button>

            {/* Authenticated User Actions */}
            {user && (
              <>
                {/* Notifications */}
                {user.role === 'buyer' && (
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="hidden lg:flex relative p-2">
                      <Bell className="h-4 w-4" />
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    </Button>
                  </Link>
                )}

                {/* Wishlist - only for buyers */}
                {user.role === 'buyer' && (
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="hidden lg:flex p-2">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* For Farmers Button - only show if not a farmer */}
            {(!user || user.role !== 'farmer') && (
              <Link href="/farmers">
                <Button variant="ghost" size="sm" className="hidden xl:flex text-xs">
                  Farmers
                </Button>
              </Link>
            )}
            
            {/* Authentication */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden md:flex gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline text-sm">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <Badge variant="secondary" className="w-fit text-xs mt-1">
                        {user.role === 'buyer' ? 'Buyer' : 'Farmer'}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {user.role === 'buyer' ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center">
                          <Package className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center">
                          <Heart className="mr-2 h-4 w-4" />
                          <span>Wishlist</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="http://localhost:3000/landing" className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Farmer Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" className="hidden md:flex" onClick={handleAuthClick}>
                <User className="md:mr-1 h-4 w-4" />
                <span className="hidden lg:inline">Sign In</span>
              </Button>
            )}
            
            {/* Cart */}
            <CartDropdown />

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden p-2">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Leaf className="h-6 w-6 text-green-600" />
                    SaharaMarket
                  </SheetTitle>
                  <SheetDescription>
                    Fresh from Farm to Table
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block text-lg font-medium transition-colors ${
                        pathname === item.href
                          ? "text-green-600 dark:text-green-400"
                          : "hover:text-green-600 dark:hover:text-green-400"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="pt-4 border-t space-y-2">
                    {(!user || user.role !== 'farmer') && (
                      <Link href="/farmers">
                        <Button variant="outline" className="w-full">
                          For Farmers
                        </Button>
                      </Link>
                    )}
                    
                    {user ? (
                      <div className="space-y-2">
                        {user.role === 'buyer' ? (
                          <Link href="/dashboard">
                            <Button variant="outline" className="w-full">
                              Dashboard
                            </Button>
                          </Link>
                        ) : (
                          <Link href="http://localhost:3000/landing">
                            <Button variant="outline" className="w-full">
                              Farmer Dashboard
                            </Button>
                          </Link>
                        )}
                        <Button variant="destructive" className="w-full" onClick={handleLogout}>
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleAuthClick}>
                        Sign In
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
      />
    </motion.header>
  )
}
