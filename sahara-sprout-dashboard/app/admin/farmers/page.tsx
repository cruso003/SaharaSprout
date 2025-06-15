"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  Eye,
  MoreHorizontal,
  MapPin,
  User,
  Phone,
  Mail,
  Zap,
  DollarSign,
  Search,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"

// Mock farmer data - in real app this would come from API
const farmers = [
  {
    id: "FRM-001",
    profile: {
      name: "Joseph Kamara",
      email: "j.kamara@email.com",
      phone: "+231-555-0456",
      location: "Gbarnga, Bong County, Liberia",
      joinedDate: "2025-03-15",
      avatar: null
    },
    subscription: {
      plan: "Growth Plan",
      status: "active",
      monthlyFee: "$85",
      nextPayment: "2025-07-15",
      paymentMethod: "Pay-as-You-Harvest"
    },
    installation: {
      systemSize: "2.5kW Solar System",
      installDate: "2025-04-02",
      status: "operational",
      efficiency: 92,
      monthlyGeneration: "380kWh"
    },
    farm: {
      size: "5 hectares",
      crops: ["Cocoa", "Coffee", "Plantain"],
      lastHarvest: "2025-05-20",
      estimatedYield: "+35%"
    },
    support: {
      tickets: 2,
      lastContact: "2025-06-10",
      satisfaction: "excellent"
    }
  },
  {
    id: "FRM-002",
    profile: {
      name: "Amara Koroma",
      email: "amara.koroma@email.com",
      phone: "+231-555-0123",
      location: "Monrovia, Montserrado County, Liberia",
      joinedDate: "2025-04-20",
      avatar: null
    },
    subscription: {
      plan: "Essential Plan",
      status: "active",
      monthlyFee: "$45",
      nextPayment: "2025-07-20",
      paymentMethod: "Group Financing"
    },
    installation: {
      systemSize: "1.5kW Solar System",
      installDate: "2025-05-10",
      status: "operational",
      efficiency: 88,
      monthlyGeneration: "220kWh"
    },
    farm: {
      size: "2.5 hectares",
      crops: ["Rice", "Cassava", "Sweet Potato"],
      lastHarvest: "2025-06-01",
      estimatedYield: "+28%"
    },
    support: {
      tickets: 0,
      lastContact: "2025-05-15",
      satisfaction: "good"
    }
  },
  {
    id: "FRM-003",
    profile: {
      name: "Fatou Sesay",
      email: "fatou.sesay@email.com",
      phone: "+232-555-0789",
      location: "Bo, Southern Province, Sierra Leone",
      joinedDate: "2025-02-08",
      avatar: null
    },
    subscription: {
      plan: "Professional Plan",
      status: "payment_pending",
      monthlyFee: "$150",
      nextPayment: "2025-06-08",
      paymentMethod: "Direct Payment"
    },
    installation: {
      systemSize: "4.0kW Solar System",
      installDate: "2025-03-18",
      status: "maintenance_required",
      efficiency: 76,
      monthlyGeneration: "580kWh"
    },
    farm: {
      size: "3.8 hectares",
      crops: ["Rice", "Groundnuts", "Vegetables"],
      lastHarvest: "2025-05-30",
      estimatedYield: "+42%"
    },
    support: {
      tickets: 5,
      lastContact: "2025-06-12",
      satisfaction: "fair"
    }
  }
]

export default function FarmersPage() {
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
      case "payment_pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Payment Pending</Badge>
      case "suspended":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Suspended</Badge>
      case "operational":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Operational</Badge>
      case "maintenance_required":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Maintenance Required</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSatisfactionBadge = (satisfaction: string) => {
    switch (satisfaction) {
      case "excellent":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Excellent</Badge>
      case "good":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Good</Badge>
      case "fair":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Fair</Badge>
      case "poor":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Poor</Badge>
      default:
        return <Badge variant="secondary">{satisfaction}</Badge>
    }
  }

  const filteredFarmers = farmers.filter(farmer => {
    const matchesStatus = statusFilter === "all" || farmer.subscription.status === statusFilter
    const matchesSearch = !searchQuery || 
      farmer.profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.profile.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Farmer Management</h1>
        <p className="text-muted-foreground">
          Manage active farmers and their subscriptions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farmers.length}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Systems</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {farmers.filter(f => f.installation.status === "operational").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(farmers.reduce((acc, f) => acc + f.installation.efficiency, 0) / farmers.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              System performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {farmers.reduce((acc, f) => acc + f.support.tickets, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Open tickets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search farmers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Farmers</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="payment_pending">Payment Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Farmers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Farmers ({filteredFarmers.length})</CardTitle>
          <CardDescription>Manage farmer profiles and system performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farmer ID</TableHead>
                <TableHead>Name & Contact</TableHead>
                <TableHead>Plan & Status</TableHead>
                <TableHead>System Performance</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Support</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFarmers.map((farmer) => (
                <TableRow key={farmer.id}>
                  <TableCell className="font-medium">{farmer.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{farmer.profile.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {farmer.profile.location.split(',')[0]}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{farmer.subscription.plan}</p>
                      {getStatusBadge(farmer.subscription.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{farmer.installation.systemSize}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={farmer.installation.efficiency} className="w-16 h-2" />
                        <span className="text-sm text-muted-foreground">{farmer.installation.efficiency}%</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{farmer.subscription.monthlyFee}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(farmer.subscription.nextPayment).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{farmer.support.tickets} tickets</p>
                      {getSatisfactionBadge(farmer.support.satisfaction)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedFarmer(farmer)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Farmer Profile - {farmer.profile.name}</DialogTitle>
                            <DialogDescription>
                              Complete farmer information and system status
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedFarmer && (
                            <div className="grid gap-6 py-4">
                              {/* Personal Information */}
                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                  <User className="h-5 w-5" />
                                  Personal Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Full Name</Label>
                                    <p className="font-medium">{selectedFarmer.profile.name}</p>
                                  </div>
                                  <div>
                                    <Label>Email</Label>
                                    <p className="flex items-center gap-2">
                                      <Mail className="h-4 w-4" />
                                      {selectedFarmer.profile.email}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Phone</Label>
                                    <p className="flex items-center gap-2">
                                      <Phone className="h-4 w-4" />
                                      {selectedFarmer.profile.phone}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Location</Label>
                                    <p className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      {selectedFarmer.profile.location}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Member Since</Label>
                                    <p className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      {new Date(selectedFarmer.profile.joinedDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Subscription & Billing */}
                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                  <DollarSign className="h-5 w-5" />
                                  Subscription & Billing
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Current Plan</Label>
                                    <p className="font-medium">{selectedFarmer.subscription.plan}</p>
                                  </div>
                                  <div>
                                    <Label>Status</Label>
                                    {getStatusBadge(selectedFarmer.subscription.status)}
                                  </div>
                                  <div>
                                    <Label>Monthly Fee</Label>
                                    <p className="font-medium">{selectedFarmer.subscription.monthlyFee}</p>
                                  </div>
                                  <div>
                                    <Label>Payment Method</Label>
                                    <p className="font-medium">{selectedFarmer.subscription.paymentMethod}</p>
                                  </div>
                                  <div>
                                    <Label>Next Payment Due</Label>
                                    <p className="font-medium">
                                      {new Date(selectedFarmer.subscription.nextPayment).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Solar Installation */}
                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                  <Zap className="h-5 w-5" />
                                  Solar Installation
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>System Size</Label>
                                    <p className="font-medium">{selectedFarmer.installation.systemSize}</p>
                                  </div>
                                  <div>
                                    <Label>Installation Date</Label>
                                    <p className="font-medium">
                                      {new Date(selectedFarmer.installation.installDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>System Status</Label>
                                    {getStatusBadge(selectedFarmer.installation.status)}
                                  </div>
                                  <div>
                                    <Label>Current Efficiency</Label>
                                    <div className="flex items-center gap-2">
                                      <Progress value={selectedFarmer.installation.efficiency} className="w-24 h-2" />
                                      <span className="font-medium">{selectedFarmer.installation.efficiency}%</span>
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Monthly Generation</Label>
                                    <p className="font-medium">{selectedFarmer.installation.monthlyGeneration}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Farm Information */}
                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold">Farm Information</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Farm Size</Label>
                                    <p className="font-medium">{selectedFarmer.farm.size}</p>
                                  </div>
                                  <div>
                                    <Label>Primary Crops</Label>
                                    <p className="font-medium">{selectedFarmer.farm.crops.join(", ")}</p>
                                  </div>
                                  <div>
                                    <Label>Last Harvest</Label>
                                    <p className="font-medium">
                                      {new Date(selectedFarmer.farm.lastHarvest).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Estimated Yield Improvement</Label>
                                    <p className="font-medium text-green-600">{selectedFarmer.farm.estimatedYield}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Visit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DollarSign className="h-4 w-4 mr-2" />
                            View Billing
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-orange-600">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Flag for Review
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
