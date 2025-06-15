"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  MapPin,
  Zap,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye
} from "lucide-react"

// Mock data - in real app this would come from API
const dashboardData = {
  stats: {
    totalFarmers: 247,
    newApplications: 12,
    activeProjects: 89,
    monthlyRevenue: 45720
  },
  recentApplications: [
    {
      id: "APP-001",
      farmer: "Amara Koroma",
      location: "Monrovia, Liberia",
      plan: "Essential Plan",
      status: "pending_review",
      submittedAt: "2 hours ago"
    },
    {
      id: "APP-002", 
      farmer: "Joseph Kamara",
      location: "Gbarnga, Liberia",
      plan: "Growth Plan",
      status: "approved",
      submittedAt: "5 hours ago"
    },
    {
      id: "APP-003",
      farmer: "Fatou Sesay",
      location: "Bo, Sierra Leone",
      plan: "Professional Plan",
      status: "under_review",
      submittedAt: "1 day ago"
    }
  ],
  systemAlerts: [
    {
      type: "warning",
      message: "Low inventory: 500W Solar Panels (12 units remaining)",
      time: "10 minutes ago"
    },
    {
      type: "info",
      message: "Monthly report generated successfully",
      time: "2 hours ago"
    },
    {
      type: "error",
      message: "Payment processing delay for 3 applications",
      time: "4 hours ago"
    }
  ]
}

export default function AdminDashboard() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_review":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>
      case "under_review":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Under Review</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage SaharaSprout operations and farmer applications
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalFarmers}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.newApplications}</div>
            <p className="text-xs text-muted-foreground">
              Require review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              Solar installations in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData.stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest farmer applications requiring attention</CardDescription>
              </div>
              <Link href="/admin/applications">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{app.farmer}</p>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {app.location}
                      </span>
                      <span>{app.plan}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{app.submittedAt}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts & Activity */}
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Recent system notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.systemAlerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getAlertIcon(alert.type)}
                  <div className="space-y-1 flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
              
              <Link href="/admin/system">
                <Button variant="outline" className="w-full">
                  View System Status
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Link href="/admin/applications">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-sm">Review Applications</span>
              </Button>
            </Link>
            
            <Link href="/admin/farmers">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Users className="h-5 w-5" />
                <span className="text-sm">Manage Farmers</span>
              </Button>
            </Link>
            
            <Link href="/admin/system">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Zap className="h-5 w-5" />
                <span className="text-sm">System Status</span>
              </Button>
            </Link>
            
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm">View Analytics</span>
              </Button>
            </Link>
            
            <Link href="/admin/billing">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="text-sm">Billing</span>
              </Button>
            </Link>
            
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">Settings</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
