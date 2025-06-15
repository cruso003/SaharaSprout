"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Filter,
  MapPin,
  Star,
  Truck,
  Shield,
  Clock,
  Leaf,
  Users,
  TrendingUp,
  Heart,
  ShoppingCart,
  Eye,
  MessageSquare,
  Store
} from "lucide-react"

// Mock data for public marketplace
const featuredFarms = [
  {
    id: "1",
    name: "Green Valley Organic Farm",
    location: "Casablanca, Morocco",
    rating: 4.9,
    totalSales: 1250,
    specialties: ["Organic Vegetables", "Herbs"],
    avatar: "/api/placeholder/80/80",
    verified: true,
    url: "greenvalley.saharamarket.com",
    activeCrops: 8,
    description: "Premium organic produce grown with sustainable farming practices"
  },
  {
    id: "2", 
    name: "Sahara Fresh Co-op",
    location: "Marrakech, Morocco",
    rating: 4.7,
    totalSales: 890,
    specialties: ["Tomatoes", "Peppers", "Citrus"],
    avatar: "/api/placeholder/80/80",
    verified: true,
    url: "saharafresh.saharamarket.com",
    activeCrops: 12,
    description: "Cooperative of local farmers bringing fresh produce to your table"
  },
  {
    id: "3",
    name: "Atlas Mountain Harvest",
    location: "Meknes, Morocco",
    rating: 4.8,
    totalSales: 2100,
    specialties: ["Berries", "Stone Fruits", "Leafy Greens"],
    avatar: "/api/placeholder/80/80",
    verified: true,
    url: "atlasmountain.saharamarket.com",
    activeCrops: 15,
    description: "High-altitude farming for exceptional flavor and quality"
  }
]

const cropListings = [
  {
    id: "1",
    farmId: "1",
    farmName: "Green Valley Organic Farm",
    crop: "Organic Cherry Tomatoes",
    variety: "Sweet Cherry",
    price: 8.5,
    unit: "kg",
    quantity: 500,
    quality: "Grade A",
    certification: "Organic",
    harvestDate: "2024-06-10",
    image: "/api/placeholder/300/200",
    location: "Casablanca",
    rating: 4.9,
    reviews: 45,
    fastDelivery: true,
    farmVerified: true
  },
  {
    id: "2",
    farmId: "2",
    farmName: "Sahara Fresh Co-op",
    crop: "Bell Peppers Mix",
    variety: "Red, Yellow, Green",
    price: 12.0,
    unit: "kg",
    quantity: 300,
    quality: "Grade A",
    certification: "GAP Certified",
    harvestDate: "2024-06-12",
    image: "/api/placeholder/300/200",
    location: "Marrakech",
    rating: 4.7,
    reviews: 32,
    fastDelivery: false,
    farmVerified: true
  },
  {
    id: "3",
    farmId: "3",
    farmName: "Atlas Mountain Harvest",
    crop: "Premium Strawberries",
    variety: "Albion",
    price: 25.0,
    unit: "kg",
    quantity: 150,
    quality: "Grade A+",
    certification: "Organic",
    harvestDate: "2024-06-14",
    image: "/api/placeholder/300/200",
    location: "Meknes",
    rating: 4.8,
    reviews: 78,
    fastDelivery: true,
    farmVerified: true
  }
]

const categories = [
  { id: "vegetables", name: "Vegetables", count: 124 },
  { id: "fruits", name: "Fruits", count: 89 },
  { id: "herbs", name: "Herbs & Spices", count: 45 },
  { id: "grains", name: "Grains & Cereals", count: 67 },
  { id: "legumes", name: "Legumes", count: 34 }
]

export default function PublicMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortBy, setSortBy] = useState("featured")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-green-600">SaharaMarket</h1>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Fresh from Farm to Table
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost">For Farmers</Button>
              <Button variant="ghost">Help</Button>
              <Button>Sign In</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for fresh crops, farms, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 h-12">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name} ({cat.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="lg" className="px-8">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </div>

        <Tabs defaultValue="marketplace" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="farms">Farm Stores</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-6">
            {/* Filters and Sort */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                <Badge variant="secondary">{cropListings.length} products found</Badge>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cropListings.map((listing) => (
                <Card key={listing.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative">
                    <img
                      src={listing.image}
                      alt={listing.crop}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 left-2 flex gap-2">
                      {listing.farmVerified && (
                        <Badge className="bg-green-600">
                          <Shield className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                      {listing.certification && (
                        <Badge variant="secondary">{listing.certification}</Badge>
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/80">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    {listing.fastDelivery && (
                      <div className="absolute bottom-2 left-2">
                        <Badge className="bg-blue-600">
                          <Truck className="mr-1 h-3 w-3" />
                          Fast Delivery
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-green-600 transition-colors">
                          {listing.crop}
                        </h3>
                        <p className="text-sm text-muted-foreground">{listing.variety}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {listing.farmName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{listing.farmName}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{listing.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{listing.location}</span>
                        <Separator orientation="vertical" className="h-3" />
                        <span>{listing.quantity} {listing.unit} available</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-green-600">
                            {listing.price} MAD
                          </span>
                          <span className="text-sm text-muted-foreground">/{listing.unit}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {listing.quality}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {Math.floor(Math.random() * 50) + 10}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {listing.reviews}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Harvested {new Date(listing.harvestDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1" size="sm">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="farms" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Featured Farm Stores</h2>
              <p className="text-muted-foreground">
                Discover trusted farms and browse their dedicated stores
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredFarms.map((farm) => (
                <Card key={farm.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={farm.avatar} />
                        <AvatarFallback>{farm.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                            {farm.name}
                          </CardTitle>
                          {farm.verified && (
                            <Shield className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{farm.rating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({farm.totalSales} sales)
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {farm.location}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{farm.description}</p>

                    <div className="flex flex-wrap gap-1">
                      {farm.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Store className="h-4 w-4" />
                        {farm.activeCrops} active crops
                      </span>
                      <span className="text-muted-foreground">{farm.url}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm">
                        Visit Store
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Browse by Category</h2>
              <p className="text-muted-foreground">
                Find exactly what you're looking for
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="group hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <Leaf className="h-12 w-12 mx-auto text-green-600" />
                    </div>
                    <h3 className="font-semibold group-hover:text-green-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.count} products
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
