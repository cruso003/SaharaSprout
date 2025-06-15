"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useFarm } from "@/lib/context/farm-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Home,
  Droplets,
  Map,
  BarChart3,
  Settings,
  Sprout,
  Zap,
  ShoppingCart,
  Bot,
  Menu,
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  MapPin,
  Users,
  Building
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Farm overview and real-time status"
  },
  {
    name: "Irrigation",
    href: "/dashboard/irrigation",
    icon: Droplets,
    description: "Autonomous system monitoring via 4G/WiFi"
  },
  {
    name: "Farm Map",
    href: "/dashboard/map",
    icon: Map,
    description: "Interactive zone mapping and sensor locations"
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "Performance insights and trends"
  },
  {
    name: "Crops",
    href: "/dashboard/crops",
    icon: Sprout,
    description: "Crop management and recommendations"
  },
  {
    name: "AI Assistant",
    href: "/dashboard/assistant",
    icon: Bot,
    description: "AI-powered farming recommendations"
  },
  {
    name: "Marketplace",
    href: "/dashboard/marketplace",
    icon: ShoppingCart,
    description: "Sell your crops directly to buyers"
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "System configuration and preferences"
  }
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { currentUser, currentFarm, farms, switchFarm, isLoading } = useFarm()

  if (isLoading) {
    return (
      <div className={cn("pb-12 min-h-screen", className)}>
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-32 mt-2" />
            <Skeleton className="h-3 w-24 mt-1" />
          </div>
          <div className="px-3">
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("pb-12 min-h-screen", className)}>
      <div className="space-y-4 py-4">
        {/* Logo and Brand */}
        <div className="px-3 py-2">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Sprout className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">SaharaSprout</h2>
              <p className="text-xs text-muted-foreground">Smart Farming Platform</p>
            </div>
          </div>
        </div>

        {/* Farm Selector */}
        {currentUser && farms.length > 1 && (
          <div className="px-3">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Select Farm</p>
              <Select value={currentFarm?.id} onValueChange={switchFarm}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {farms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.id}>
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{farm.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {farm.location.city}, {farm.location.country}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Current Farm Info */}
        {currentFarm && (
          <div className="px-3">
            <div className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{currentFarm.name}</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className={
                    currentFarm.subscription.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {currentFarm.subscription.plan}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{currentFarm.location.city}, {currentFarm.location.country}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{currentFarm.zones.length} zones • {currentFarm.totalArea}</span>
              </div>
            </div>
          </div>
        )}

        {/* System Status */}
        {currentFarm && (
          <div className="px-3">
            <div className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">System Status</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Zap className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Wifi className="w-3 h-3" />
                  <span>{currentFarm.devices[0]?.connectivity || 'WiFi'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Battery className="w-3 h-3" />
                  <span>{currentFarm.devices[0]?.battery || 87}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Navigation */}
        <div className="px-3">
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start text-left h-auto p-3",
                        isActive && "bg-secondary"
                      )}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </div>
                      </div>
                    </Button>
                  </Link>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="px-3">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Droplets className="mr-2 h-4 w-4" />
              Emergency Irrigation
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Smartphone className="mr-2 h-4 w-4" />
              Call Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-80">
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}
