"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Server,
  Wifi,
  Shield,
  Activity,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Zap,
  Users,
  RefreshCw,
  Settings,
  Download
} from "lucide-react"

// Mock system data - in real app this would come from API
const systemStatus = {
  overall: "healthy",
  uptime: "99.8%",
  lastUpdate: "2025-06-14T06:00:00Z",
  services: [
    {
      name: "Web Application",
      status: "healthy",
      uptime: "99.9%",
      responseTime: "145ms",
      lastCheck: "2025-06-14T12:30:00Z"
    },
    {
      name: "Database",
      status: "healthy", 
      uptime: "99.7%",
      responseTime: "23ms",
      lastCheck: "2025-06-14T12:30:00Z"
    },
    {
      name: "Authentication Service",
      status: "healthy",
      uptime: "100%",
      responseTime: "67ms",
      lastCheck: "2025-06-14T12:30:00Z"
    },
    {
      name: "Payment Processing",
      status: "warning",
      uptime: "98.2%",
      responseTime: "320ms",
      lastCheck: "2025-06-14T12:30:00Z"
    },
    {
      name: "SMS Service",
      status: "healthy",
      uptime: "99.5%",
      responseTime: "890ms",
      lastCheck: "2025-06-14T12:30:00Z"
    },
    {
      name: "File Storage",
      status: "error",
      uptime: "97.1%",
      responseTime: "timeout",
      lastCheck: "2025-06-14T12:25:00Z"
    }
  ],
  resources: {
    cpu: {
      usage: 45,
      cores: 8,
      load: "2.3, 2.1, 1.9"
    },
    memory: {
      usage: 68,
      total: "32GB",
      available: "10.2GB"
    },
    storage: {
      usage: 34,
      total: "1TB",
      available: "672GB"
    },
    network: {
      inbound: "125 Mbps",
      outbound: "89 Mbps",
      latency: "12ms"
    }
  },
  security: {
    lastScan: "2025-06-14T02:00:00Z",
    vulnerabilities: 0,
    failedLogins: 3,
    activeThreats: 0
  },
  backups: {
    lastBackup: "2025-06-14T01:00:00Z",
    status: "success",
    size: "2.3GB",
    retention: "30 days"
  }
}

const recentAlerts = [
  {
    type: "warning",
    service: "Payment Processing",
    message: "Response time elevated above normal threshold",
    time: "10 minutes ago",
    severity: "medium"
  },
  {
    type: "error",
    service: "File Storage",
    message: "Connection timeout to storage service",
    time: "25 minutes ago",
    severity: "high"
  },
  {
    type: "info",
    service: "Database",
    message: "Scheduled maintenance completed successfully",
    time: "2 hours ago",
    severity: "low"
  },
  {
    type: "warning",
    service: "SMS Service", 
    message: "High volume of outbound messages detected",
    time: "4 hours ago",
    severity: "medium"
  }
]

export default function SystemPage() {
  const [refreshing, setRefreshing] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Healthy</Badge>
      case "warning":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "error":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Low</Badge>
      default:
        return <Badge variant="secondary">{severity}</Badge>
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    // In real app, this would fetch fresh data
    setTimeout(() => setRefreshing(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Management</h1>
          <p className="text-muted-foreground">
            Monitor system health and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getStatusBadge(systemStatus.overall)}
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime: {systemStatus.uptime}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStatus.services.filter(s => s.status === "healthy").length}/{systemStatus.services.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Services operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStatus.resources.cpu.usage}%</div>
            <Progress value={systemStatus.resources.cpu.usage} className="w-full h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStatus.resources.memory.usage}%</div>
            <Progress value={systemStatus.resources.memory.usage} className="w-full h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Monitor the health of all system services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemStatus.services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Uptime: {service.uptime} • Response: {service.responseTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(service.status)}
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  CPU Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Usage</span>
                      <span>{systemStatus.resources.cpu.usage}%</span>
                    </div>
                    <Progress value={systemStatus.resources.cpu.usage} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Cores</p>
                      <p className="font-medium">{systemStatus.resources.cpu.cores}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Load Average</p>
                      <p className="font-medium">{systemStatus.resources.cpu.load}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MemoryStick className="h-5 w-5" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Usage</span>
                      <span>{systemStatus.resources.memory.usage}%</span>
                    </div>
                    <Progress value={systemStatus.resources.memory.usage} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-medium">{systemStatus.resources.memory.total}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Available</p>
                      <p className="font-medium">{systemStatus.resources.memory.available}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Storage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Usage</span>
                      <span>{systemStatus.resources.storage.usage}%</span>
                    </div>
                    <Progress value={systemStatus.resources.storage.usage} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-medium">{systemStatus.resources.storage.total}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Available</p>
                      <p className="font-medium">{systemStatus.resources.storage.available}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Inbound</p>
                      <p className="font-medium">{systemStatus.resources.network.inbound}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Outbound</p>
                      <p className="font-medium">{systemStatus.resources.network.outbound}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Latency</p>
                      <p className="font-medium">{systemStatus.resources.network.latency}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Last Security Scan</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(systemStatus.security.lastScan).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Vulnerabilities</span>
                    <Badge variant={systemStatus.security.vulnerabilities === 0 ? "secondary" : "destructive"}>
                      {systemStatus.security.vulnerabilities}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Failed Login Attempts (24h)</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {systemStatus.security.failedLogins}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Threats</span>
                    <Badge variant={systemStatus.security.activeThreats === 0 ? "secondary" : "destructive"}>
                      {systemStatus.security.activeThreats}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Backup Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Last Backup</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(systemStatus.backups.lastBackup).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Status</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {systemStatus.backups.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Backup Size</span>
                    <span className="font-medium">{systemStatus.backups.size}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Retention Period</span>
                    <span className="font-medium">{systemStatus.backups.retention}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent System Alerts</CardTitle>
              <CardDescription>Latest system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    {getStatusIcon(alert.type)}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{alert.service}</p>
                        {getSeverityBadge(alert.severity)}
                      </div>
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
