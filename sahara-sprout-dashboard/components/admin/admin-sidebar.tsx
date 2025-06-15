"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Sprout,
  BarChart3,
  MessageSquare,
  CreditCard,
  Wrench
} from "lucide-react"

const navigationItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    badge: null
  },
  {
    title: "Applications",
    href: "/admin/applications",
    icon: FileText,
    badge: "12" // This would come from actual data
  },
  {
    title: "Farmers",
    href: "/admin/farmers",
    icon: Users,
    badge: null
  },
  {
    title: "System",
    href: "/admin/system",
    icon: Wrench,
    badge: null
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    badge: null
  },
  {
    title: "Support",
    href: "/admin/support",
    icon: MessageSquare,
    badge: "3"
  },
  {
    title: "Billing",
    href: "/admin/billing",
    icon: CreditCard,
    badge: null
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    badge: null
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Sprout className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-foreground">SaharaSprout</h2>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isCollapsed ? 'px-2' : 'px-3'
                  } ${isActive ? 'bg-primary/10 text-primary border-primary/20' : ''}`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3">
            <HelpCircle className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Help & Support</span>}
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}
