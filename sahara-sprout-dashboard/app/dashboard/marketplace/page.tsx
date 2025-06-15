"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Plus,
  Eye,
  Package,
  DollarSign,
  TrendingUp,
  Star,
  MapPin,
  Calendar,
  Users,
  BarChart3,
  Edit,
  MessageSquare
} from "lucide-react"

// Mock data for marketplace
const activeListing = {
  id: "1",
  crop: "Premium Tomatoes",
  variety: "Cherry Tomatoes",
  quantity: 500,
  unit: "kg",
  pricePerUnit: 8.5,
  totalValue: 4250,
  description: "Organically grown cherry tomatoes with exceptional sweetness and firm texture.",
  harvestDate: "2024-01-15",
  expiryDate: "2024-01-25",
  location: "Zone A - Greenhouse 1",
  quality: "Grade A",
  certification: "Organic",
  status: "active",
  views: 124,
  inquiries: 8,
  images: ["/api/placeholder/300/200"]
}

const marketAnalytics = {
  totalRevenue: 42750,
  totalSales: 15,
  averagePrice: 8.2,
  topCrop: "Tomatoes",
  monthlyGrowth: 15.8
}

const buyers = [
  {
    id: "1",
    name: "Farm Fresh Market",
    avatar: "/api/placeholder/40/40",
    rating: 4.8,
    location: "Casablanca",
    totalOrders: 23,
    inquiryDate: "2024-01-10",
    crop: "Premium Tomatoes",
    quantity: 100,
    offerPrice: 8.5,
    status: "pending"
  },
  {
    id: "2",
    name: "Green Valley Co-op",
    avatar: "/api/placeholder/40/40",
    rating: 4.6,
    location: "Rabat",
    totalOrders: 45,
    inquiryDate: "2024-01-09",
    crop: "Premium Tomatoes",
    quantity: 200,
    offerPrice: 8.2,
    status: "negotiating"
  },
  {
    id: "3",
    name: "Organic Plus",
    avatar: "/api/placeholder/40/40",
    rating: 4.9,
    location: "Marrakech",
    totalOrders: 67,
    inquiryDate: "2024-01-08",
    crop: "Premium Tomatoes",
    quantity: 150,
    offerPrice: 8.8,
    status: "accepted"
  }
]

const salesHistory = [
  {
    id: "1",
    crop: "Organic Lettuce",
    buyer: "Fresh Foods Ltd",
    quantity: 200,
    unit: "kg",
    price: 6.5,
    total: 1300,
    date: "2024-01-05",
    status: "delivered"
  },
  {
    id: "2",
    crop: "Bell Peppers",
    buyer: "City Market",
    quantity: 150,
    unit: "kg",
    price: 12.0,
    total: 1800,
    date: "2024-01-03",
    status: "delivered"
  },
  {
    id: "3",
    crop: "Cucumbers",
    buyer: "Green Valley Co-op",
    quantity: 300,
    unit: "kg",
    price: 5.5,
    total: 1650,
    date: "2023-12-28",
    status: "delivered"
  }
]

const marketPrices = [
  { crop: "Tomatoes", currentPrice: 8.2, trend: "up", change: 5.2 },
  { crop: "Lettuce", currentPrice: 6.5, trend: "down", change: -2.1 },
  { crop: "Bell Peppers", currentPrice: 12.0, trend: "up", change: 8.9 },
  { crop: "Cucumbers", currentPrice: 5.5, trend: "stable", change: 0.5 }
]

export default function MarketplacePage() {
  const [newListingOpen, setNewListingOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground">
            Sell your crops directly to buyers and manage your marketplace activities
          </p>
        </div>
        <Dialog open={newListingOpen} onOpenChange={setNewListingOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Listing</DialogTitle>
              <DialogDescription>
                Add your crop to the marketplace to connect with buyers
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crop">Crop Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tomatoes">Tomatoes</SelectItem>
                      <SelectItem value="lettuce">Lettuce</SelectItem>
                      <SelectItem value="peppers">Bell Peppers</SelectItem>
                      <SelectItem value="cucumbers">Cucumbers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variety">Variety</Label>
                  <Input placeholder="e.g., Cherry Tomatoes" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input type="number" placeholder="500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="kg" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="tonnes">Tonnes</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Unit (MAD)</Label>
                  <Input type="number" step="0.1" placeholder="8.5" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  placeholder="Describe your crop quality, growing methods, certifications..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="harvest">Harvest Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quality">Quality Grade</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a">Grade A - Premium</SelectItem>
                      <SelectItem value="b">Grade B - Standard</SelectItem>
                      <SelectItem value="c">Grade C - Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewListingOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setNewListingOpen(false)}>
                Create Listing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketAnalytics.totalRevenue.toLocaleString()} MAD</div>
            <p className="text-xs text-muted-foreground">
              +{marketAnalytics.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketAnalytics.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketAnalytics.averagePrice} MAD/kg</div>
            <p className="text-xs text-muted-foreground">
              Market rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Crop</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketAnalytics.topCrop}</div>
            <p className="text-xs text-muted-foreground">
              Best performer
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Currently listed
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="listings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="inquiries">Buyer Inquiries</TabsTrigger>
          <TabsTrigger value="sales">Sales History</TabsTrigger>
          <TabsTrigger value="market">Market Prices</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          {/* Active Listing */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {activeListing.crop}
                    <Badge variant="secondary">{activeListing.status}</Badge>
                  </CardTitle>
                  <CardDescription>{activeListing.variety}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Quantity</Label>
                  <p className="font-semibold">{activeListing.quantity} {activeListing.unit}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Price per Unit</Label>
                  <p className="font-semibold">{activeListing.pricePerUnit} MAD</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Total Value</Label>
                  <p className="font-semibold">{activeListing.totalValue.toLocaleString()} MAD</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Quality</Label>
                  <p className="font-semibold">{activeListing.quality}</p>
                </div>
              </div>
              <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span>{activeListing.views} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span>{activeListing.inquiries} inquiries</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Harvest: {new Date(activeListing.harvestDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-sm text-muted-foreground">Description</Label>
                <p className="text-sm mt-1">{activeListing.description}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Buyer Inquiries
              </CardTitle>
              <CardDescription>
                Manage inquiries and offers from potential buyers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {buyers.map((buyer) => (
                  <div key={buyer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={buyer.avatar} />
                        <AvatarFallback>{buyer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{buyer.name}</h4>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{buyer.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {buyer.location}
                          </div>
                          <span>{buyer.totalOrders} orders</span>
                          <span>{new Date(buyer.inquiryDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{buyer.quantity} kg</div>
                      <div className="text-sm text-muted-foreground">{buyer.offerPrice} MAD/kg</div>
                      <Badge 
                        variant={
                          buyer.status === 'accepted' ? 'default' : 
                          buyer.status === 'pending' ? 'secondary' : 
                          'outline'
                        }
                        className="mt-1"
                      >
                        {buyer.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Sales History
              </CardTitle>
              <CardDescription>
                Track your completed sales and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Crop</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesHistory.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.crop}</TableCell>
                      <TableCell>{sale.buyer}</TableCell>
                      <TableCell>{sale.quantity} {sale.unit}</TableCell>
                      <TableCell>{sale.price} MAD</TableCell>
                      <TableCell className="font-semibold">{sale.total.toLocaleString()} MAD</TableCell>
                      <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="default">{sale.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Prices
              </CardTitle>
              <CardDescription>
                Current market rates and price trends for your crops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketPrices.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{item.crop}</h4>
                      <p className="text-sm text-muted-foreground">Current market rate</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{item.currentPrice} MAD/kg</div>
                      <div className={`text-sm flex items-center gap-1 ${
                        item.trend === 'up' ? 'text-green-600' : 
                        item.trend === 'down' ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        <TrendingUp className={`h-3 w-3 ${
                          item.trend === 'down' ? 'rotate-180' : ''
                        }`} />
                        {item.change > 0 ? '+' : ''}{item.change}%
                      </div>
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
