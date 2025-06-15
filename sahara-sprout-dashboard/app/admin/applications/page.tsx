"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  DialogFooter,
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
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  MapPin,
  User,
  Phone,
  Mail,
  Zap,
  DollarSign,
  Search,
  Filter,
  Download
} from "lucide-react"

// Mock application data - in real app this would come from API
const applications = [
  {
    id: "APP-001",
    farmer: {
      name: "Amara Koroma",
      email: "amara.koroma@email.com",
      phone: "+231-555-0123",
      location: "Monrovia, Montserrado County, Liberia"
    },
    farm: {
      size: "2.5 hectares",
      crops: ["Rice", "Cassava", "Sweet Potato"],
      currentPower: "None",
      dailyWaterNeed: "500L"
    },
    application: {
      plan: "Essential Plan",
      estimatedCost: "$1,200",
      financingNeeded: true,
      preferredInstallation: "Within 2 months",
      status: "pending_review",
      submittedAt: "2025-06-14T08:30:00Z",
      notes: "Farmer has expressed urgency due to upcoming planting season"
    }
  },
  {
    id: "APP-002",
    farmer: {
      name: "Joseph Kamara", 
      email: "j.kamara@email.com",
      phone: "+231-555-0456",
      location: "Gbarnga, Bong County, Liberia"
    },
    farm: {
      size: "5 hectares",
      crops: ["Cocoa", "Coffee", "Plantain"],
      currentPower: "Generator (unreliable)",
      dailyWaterNeed: "800L"
    },
    application: {
      plan: "Growth Plan",
      estimatedCost: "$2,800",
      financingNeeded: false,
      preferredInstallation: "Within 1 month",
      status: "approved",
      submittedAt: "2025-06-13T14:20:00Z",
      notes: "Farmer can pay upfront, ready for immediate installation"
    }
  },
  {
    id: "APP-003",
    farmer: {
      name: "Fatou Sesay",
      email: "fatou.sesay@email.com", 
      phone: "+232-555-0789",
      location: "Bo, Southern Province, Sierra Leone"
    },
    farm: {
      size: "3.8 hectares",
      crops: ["Rice", "Groundnuts", "Vegetables"],
      currentPower: "Solar (insufficient)",
      dailyWaterNeed: "650L"
    },
    application: {
      plan: "Professional Plan",
      estimatedCost: "$4,500",
      financingNeeded: true,
      preferredInstallation: "Within 3 months",
      status: "under_review",
      submittedAt: "2025-06-12T16:45:00Z",
      notes: "Technical assessment required for existing solar integration"
    }
  }
]

export default function ApplicationsPage() {
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [actionNotes, setActionNotes] = useState("")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_review":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>
      case "under_review":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Under Review</Badge>
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === "all" || app.application.status === statusFilter
    const matchesSearch = !searchQuery || 
      app.farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.farmer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const handleStatusUpdate = (applicationId: string, newStatus: string) => {
    // In real app, this would make an API call
    console.log(`Updating application ${applicationId} to status: ${newStatus}`)
    console.log(`Notes: ${actionNotes}`)
    setActionNotes("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Farmer Applications</h1>
        <p className="text-muted-foreground">
          Review and manage incoming farmer applications
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
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
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          <CardDescription>Manage farmer solar installation applications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application ID</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{app.farmer.name}</p>
                      <p className="text-sm text-muted-foreground">{app.farmer.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="text-sm">{app.farmer.location.split(',')[0]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{app.application.plan}</p>
                      <p className="text-sm text-muted-foreground">{app.application.estimatedCost}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(app.application.status)}</TableCell>
                  <TableCell>
                    {new Date(app.application.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(app)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Application Details - {app.id}</DialogTitle>
                            <DialogDescription>
                              Review complete application information
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedApplication && (
                            <div className="grid gap-6 py-4">
                              {/* Farmer Information */}
                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                  <User className="h-5 w-5" />
                                  Farmer Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Full Name</Label>
                                    <p className="font-medium">{selectedApplication.farmer.name}</p>
                                  </div>
                                  <div>
                                    <Label>Email</Label>
                                    <p className="flex items-center gap-2">
                                      <Mail className="h-4 w-4" />
                                      {selectedApplication.farmer.email}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Phone</Label>
                                    <p className="flex items-center gap-2">
                                      <Phone className="h-4 w-4" />
                                      {selectedApplication.farmer.phone}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Location</Label>
                                    <p className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      {selectedApplication.farmer.location}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Farm Information */}
                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                  <Zap className="h-5 w-5" />
                                  Farm Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Farm Size</Label>
                                    <p className="font-medium">{selectedApplication.farm.size}</p>
                                  </div>
                                  <div>
                                    <Label>Current Power Source</Label>
                                    <p className="font-medium">{selectedApplication.farm.currentPower}</p>
                                  </div>
                                  <div>
                                    <Label>Daily Water Need</Label>
                                    <p className="font-medium">{selectedApplication.farm.dailyWaterNeed}</p>
                                  </div>
                                  <div>
                                    <Label>Primary Crops</Label>
                                    <p className="font-medium">{selectedApplication.farm.crops.join(", ")}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Application Details */}
                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                  <DollarSign className="h-5 w-5" />
                                  Application Details
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Selected Plan</Label>
                                    <p className="font-medium">{selectedApplication.application.plan}</p>
                                  </div>
                                  <div>
                                    <Label>Estimated Cost</Label>
                                    <p className="font-medium">{selectedApplication.application.estimatedCost}</p>
                                  </div>
                                  <div>
                                    <Label>Financing Required</Label>
                                    <p className="font-medium">
                                      {selectedApplication.application.financingNeeded ? "Yes" : "No"}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Preferred Installation</Label>
                                    <p className="font-medium">{selectedApplication.application.preferredInstallation}</p>
                                  </div>
                                </div>
                                <div>
                                  <Label>Additional Notes</Label>
                                  <p className="text-sm bg-muted p-3 rounded-md">
                                    {selectedApplication.application.notes}
                                  </p>
                                </div>
                              </div>

                              {/* Status Update */}
                              <div className="grid gap-4 pt-4 border-t">
                                <h3 className="text-lg font-semibold">Update Application Status</h3>
                                <div className="grid gap-4">
                                  <div>
                                    <Label>Current Status</Label>
                                    <div className="mt-1">
                                      {getStatusBadge(selectedApplication.application.status)}
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="action-notes">Action Notes</Label>
                                    <Textarea
                                      id="action-notes"
                                      placeholder="Add notes about this status update..."
                                      value={actionNotes}
                                      onChange={(e) => setActionNotes(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      className="text-green-600 border-green-600 hover:bg-green-50"
                                      onClick={() => handleStatusUpdate(selectedApplication.id, "approved")}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="text-red-600 border-red-600 hover:bg-red-50"
                                      onClick={() => handleStatusUpdate(selectedApplication.id, "rejected")}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                      onClick={() => handleStatusUpdate(selectedApplication.id, "under_review")}
                                    >
                                      <Clock className="h-4 w-4 mr-2" />
                                      Under Review
                                    </Button>
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
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(app.id, "approved")}
                            className="text-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(app.id, "under_review")}
                            className="text-blue-600"
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Under Review
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(app.id, "rejected")}
                            className="text-red-600"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
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
