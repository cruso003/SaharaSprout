"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Droplets,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { MobileSidebar } from "./sidebar"

interface HeaderProps {
  title?: string
  description?: string
}

export function Header({ title = "Farm Dashboard", description }: HeaderProps) {
  // Temporary mock user data for demo purposes
  const mockUser = {
    displayName: "Demo User",
    email: "demo@saharasprout.com",
    photoURL: ""
  }
  
  const notifications = [
    {
      id: 1,
      type: "success",
      title: "Irrigation Complete",
      message: "Zone 3 (Tomatoes) irrigation completed successfully",
      time: "2 min ago",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      id: 2,
      type: "warning",
      title: "Low Soil Moisture",
      message: "Zone 1 (Peppers) moisture below 45%",
      time: "15 min ago",
      icon: Droplets,
      color: "text-amber-600"
    },
    {
      id: 3,
      type: "alert",
      title: "Weather Alert",
      message: "Heavy rain expected in 3 hours",
      time: "1 hour ago",
      icon: AlertTriangle,
      color: "text-red-600"
    }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6">
        {/* Mobile menu trigger */}
        <div className="md:hidden mr-4">
          <MobileSidebar />
        </div>

        {/* Page title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold truncate">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground truncate">{description}</p>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search farm data..."
              className="pl-8 w-[300px]"
            />
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex items-start space-x-3 p-3">
                    <notification.icon className={`h-4 w-4 mt-0.5 ${notification.color}`} />
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center justify-center">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={mockUser?.photoURL || ""} alt={mockUser?.displayName || "User"} />
                  <AvatarFallback>
                    {mockUser?.displayName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {mockUser?.displayName || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {mockUser?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log("Sign out clicked")}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
