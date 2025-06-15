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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  MessageSquare,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Search,
  Filter,
  Plus,
  Send,
  FileText,
  Headphones
} from "lucide-react"

// Mock support data
const supportTickets = [
  {
    id: "SUP-001",
    farmer: {
      name: "Amara Koroma",
      email: "amara.koroma@email.com",
      farmerId: "FRM-001"
    },
    subject: "Solar panel efficiency dropping",
    description: "My solar panels seem to be generating less power than usual. The output has dropped by about 30% over the past week.",
    priority: "high",
    status: "open",
    category: "technical",
    createdAt: "2025-06-14T09:30:00Z",
    lastUpdate: "2025-06-14T11:15:00Z",
    assignedTo: "Tech Support Team"
  },
  {
    id: "SUP-002", 
    farmer: {
      name: "Joseph Kamara",
      email: "j.kamara@email.com",
      farmerId: "FRM-002"
    },
    subject: "Payment method update request",
    description: "I need to update my payment method from bank transfer to mobile money. Can you help me with this?",
    priority: "medium",
    status: "in_progress",
    category: "billing",
    createdAt: "2025-06-13T14:20:00Z",
    lastUpdate: "2025-06-14T08:45:00Z",
    assignedTo: "Billing Team"
  },
  {
    id: "SUP-003",
    farmer: {
      name: "Fatou Sesay",
      email: "fatou.sesay@email.com",
      farmerId: "FRM-003"
    },
    subject: "Installation schedule inquiry",
    description: "When can I expect the installation team to visit my farm? I submitted my application last month.",
    priority: "low",
    status: "resolved",
    category: "installation",
    createdAt: "2025-06-12T10:15:00Z",
    lastUpdate: "2025-06-13T16:30:00Z",
    assignedTo: "Installation Team"
  }
]

export default function SupportPage() {
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [responseText, setResponseText] = useState("")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Open</Badge>
      case "in_progress":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">In Progress</Badge>
      case "resolved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Resolved</Badge>
      case "closed":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Closed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Low</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technical":
        return <AlertTriangle className="h-4 w-4" />
      case "billing":
        return <FileText className="h-4 w-4" />
      case "installation":
        return <Headphones className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter
    const matchesSearch = !searchQuery || 
      ticket.farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesPriority && matchesSearch
  })

  const handleSendResponse = () => {
    if (responseText.trim()) {
      // In real app, this would make an API call
      console.log(`Sending response to ticket ${selectedTicket?.id}: ${responseText}`)
      setResponseText("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support Center</h1>
          <p className="text-muted-foreground">
            Manage farmer support tickets and inquiries
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* Support Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {supportTickets.filter(t => t.status === "open").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {supportTickets.filter(t => t.status === "in_progress").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {supportTickets.filter(t => t.priority === "high").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Critical issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-muted-foreground">
              Below 4h target
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tickets Table */}
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets ({filteredTickets.length})</CardTitle>
              <CardDescription>Manage farmer support requests and inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Last Update</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ticket.farmer.name}</p>
                          <p className="text-sm text-muted-foreground">{ticket.farmer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {ticket.description}
                        </p>
                      </TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(ticket.category)}
                          <span className="capitalize">{ticket.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(ticket.lastUpdate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(ticket)}>
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Support Ticket - {ticket.id}</DialogTitle>
                              <DialogDescription>
                                Manage and respond to farmer support request
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedTicket && (
                              <div className="grid gap-6 py-4">
                                {/* Ticket Information */}
                                <div className="grid gap-4">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">{selectedTicket.subject}</h3>
                                    <div className="flex gap-2">
                                      {getPriorityBadge(selectedTicket.priority)}
                                      {getStatusBadge(selectedTicket.status)}
                                    </div>
                                  </div>
                                  
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <Label>Farmer</Label>
                                      <div className="flex items-center gap-2 mt-1">
                                        <User className="h-4 w-4" />
                                        <span>{selectedTicket.farmer.name}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Contact</Label>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Mail className="h-4 w-4" />
                                        <span>{selectedTicket.farmer.email}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Category</Label>
                                      <div className="flex items-center gap-2 mt-1">
                                        {getCategoryIcon(selectedTicket.category)}
                                        <span className="capitalize">{selectedTicket.category}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Assigned To</Label>
                                      <p className="mt-1">{selectedTicket.assignedTo}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Issue Description */}
                                <div>
                                  <Label>Issue Description</Label>
                                  <div className="mt-1 p-3 bg-muted rounded-md">
                                    {selectedTicket.description}
                                  </div>
                                </div>

                                {/* Response Section */}
                                <div className="space-y-4 pt-4 border-t">
                                  <h3 className="text-lg font-semibold">Send Response</h3>
                                  <div>
                                    <Label htmlFor="response">Response Message</Label>
                                    <Textarea
                                      id="response"
                                      placeholder="Type your response to the farmer..."
                                      value={responseText}
                                      onChange={(e) => setResponseText(e.target.value)}
                                      rows={4}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button onClick={handleSendResponse} disabled={!responseText.trim()}>
                                      <Send className="h-4 w-4 mr-2" />
                                      Send Response
                                    </Button>
                                    <Select defaultValue={selectedTicket.status}>
                                      <SelectTrigger className="w-40">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>Common solutions and documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-12 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Knowledge base management coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Support Team</CardTitle>
              <CardDescription>Manage support team members and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-12 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Team management coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
