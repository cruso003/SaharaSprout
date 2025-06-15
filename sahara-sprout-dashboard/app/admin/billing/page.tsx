"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Search,
  Filter,
  Calendar,
  Receipt
} from "lucide-react"

// Mock billing data
const billingData = {
  overview: {
    monthlyRecurring: 18450,
    totalRevenue: 234580,
    outstandingPayments: 3420,
    paymentSuccess: 94.2
  },
  subscriptions: [
    {
      farmerId: "FRM-001",
      farmerName: "Joseph Kamara",
      plan: "Growth Plan",
      monthlyFee: 85,
      status: "active",
      nextBilling: "2025-07-15",
      paymentMethod: "Pay-as-You-Harvest",
      lastPayment: "2025-06-15"
    },
    {
      farmerId: "FRM-002",
      farmerName: "Amara Koroma",
      plan: "Essential Plan", 
      monthlyFee: 45,
      status: "active",
      nextBilling: "2025-07-20",
      paymentMethod: "Group Financing",
      lastPayment: "2025-06-20"
    },
    {
      farmerId: "FRM-003",
      farmerName: "Fatou Sesay",
      plan: "Professional Plan",
      monthlyFee: 150,
      status: "overdue",
      nextBilling: "2025-06-08",
      paymentMethod: "Direct Payment",
      lastPayment: "2025-05-08"
    }
  ],
  transactions: [
    {
      id: "TXN-001",
      farmerId: "FRM-001",
      farmerName: "Joseph Kamara",
      amount: 85,
      type: "subscription",
      status: "completed",
      method: "Pay-as-You-Harvest",
      date: "2025-06-15T10:30:00Z"
    },
    {
      id: "TXN-002",
      farmerId: "FRM-002", 
      farmerName: "Amara Koroma",
      amount: 45,
      type: "subscription",
      status: "completed",
      method: "Group Financing",
      date: "2025-06-20T14:15:00Z"
    },
    {
      id: "TXN-003",
      farmerId: "FRM-003",
      farmerName: "Fatou Sesay",
      amount: 150,
      type: "subscription",
      status: "failed",
      method: "Direct Payment",
      date: "2025-06-08T09:00:00Z"
    }
  ]
}

export default function BillingPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>
      case "suspended":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Suspended</Badge>
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredSubscriptions = billingData.subscriptions.filter(sub => {
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter
    const matchesSearch = !searchQuery || 
      sub.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.farmerId.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing Management</h1>
          <p className="text-muted-foreground">
            Manage subscriptions, payments, and billing operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Receipt className="h-4 w-4 mr-2" />
            Generate Invoice
          </Button>
        </div>
      </div>

      {/* Billing Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingData.overview.monthlyRecurring.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingData.overview.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All-time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingData.overview.outstandingPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Overdue payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingData.overview.paymentSuccess}%</div>
            <p className="text-xs text-muted-foreground">
              Payment success rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          {/* Filters */}
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
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions ({filteredSubscriptions.length})</CardTitle>
              <CardDescription>Manage farmer subscription plans and billing</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Monthly Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.farmerId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{subscription.farmerName}</p>
                          <p className="text-sm text-muted-foreground">{subscription.farmerId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{subscription.plan}</TableCell>
                      <TableCell>${subscription.monthlyFee}</TableCell>
                      <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(subscription.nextBilling).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>{subscription.paymentMethod}</TableCell>
                      <TableCell>{new Date(subscription.lastPayment).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Receipt className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Payment history and transaction details</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingData.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.farmerName}</p>
                          <p className="text-sm text-muted-foreground">{transaction.farmerId}</p>
                        </div>
                      </TableCell>
                      <TableCell>${transaction.amount}</TableCell>
                      <TableCell className="capitalize">{transaction.type}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>{transaction.method}</TableCell>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Revenue by subscription plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Essential Plan</span>
                    <span className="font-bold">$6,300</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Growth Plan</span>
                    <span className="font-bold">$7,565</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Professional Plan</span>
                    <span className="font-bold">$4,585</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution of payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Pay-as-You-Harvest</span>
                    <span className="font-bold">45%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Group Financing</span>
                    <span className="font-bold">32%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Direct Payment</span>
                    <span className="font-bold">23%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
              <CardDescription>Configure billing and payment options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="grace-period">Grace Period (days)</Label>
                    <Input id="grace-period" type="number" defaultValue="7" />
                  </div>
                  <div>
                    <Label htmlFor="late-fee">Late Fee (%)</Label>
                    <Input id="late-fee" type="number" defaultValue="5" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="payment-methods">Accepted Payment Methods</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="harvest" defaultChecked />
                      <label htmlFor="harvest">Pay-as-You-Harvest</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="group" defaultChecked />
                      <label htmlFor="group">Group Financing</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="direct" defaultChecked />
                      <label htmlFor="direct">Direct Payment</label>
                    </div>
                  </div>
                </div>

                <Button>
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
