"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import {
  Search,
  Filter,
  MapPin,
  Star,
  Truck,
  Shield,
  Clock,
  Leaf,
  Heart,
  ShoppingCart,
  Eye,
  MessageSquare,
  SlidersHorizontal,
  Grid3X3,
  List
} from "lucide-react"

// Types
interface Country {
  id: string
  name: string
  flag: string
  currency: string
  currencySymbol: string
}

interface CropListing {
  id: string
  farmId: string
  farmName: string
  crop: string
  variety: string
  price: number
  unit: string
  quantity: number
  quality: string
  certification: string
  harvestDate: string
  image: string
  location: string
  country: string
  rating: number
  reviews: number
  fastDelivery: boolean
  farmVerified: boolean
  category: string
}

// Data
const countries: Country[] = [
  { id: "liberia", name: "Liberia", flag: "🇱🇷", currency: "LRD", currencySymbol: "L$" },
  { id: "uganda", name: "Uganda", flag: "🇺🇬", currency: "UGX", currencySymbol: "USh" }
]

const categories = [
  { id: "vegetables", name: "Vegetables", count: 45, icon: "🥕" },
  { id: "fruits", name: "Fruits", count: 32, icon: "🍎" },
  { id: "herbs", name: "Herbs & Spices", count: 18, icon: "🌿" },
  { id: "grains", name: "Grains & Cereals", count: 23, icon: "🌾" },
  { id: "legumes", name: "Legumes", count: 15, icon: "🫘" }
]

const cropListings: CropListing[] = [
  {
    id: "1",
    farmId: "1",
    farmName: "Liberian Organic Collective",
    crop: "Organic Cassava",
    variety: "Sweet Cassava",
    price: 45,
    unit: "kg",
    quantity: 500,
    quality: "Grade A",
    certification: "Organic",
    harvestDate: "2024-06-10",
    image: "https://media.istockphoto.com/id/1011964780/photo/manioc.webp?a=1&b=1&s=612x612&w=0&k=20&c=rc1tsaAJOurmQfeQ-qvD7D3fnpMVP2HWVoLoeDiPsB0=",
    location: "Monrovia, Liberia",
    country: "liberia",
    rating: 4.8,
    reviews: 32,
    fastDelivery: true,
    farmVerified: true,
    category: "vegetables"
  },
  {
    id: "2",
    farmId: "2",
    farmName: "Kampala Fresh Co-op",
    crop: "Coffee Beans",
    variety: "Arabica",
    price: 8500,
    unit: "kg",
    quantity: 200,
    quality: "Grade AA",
    certification: "Fair Trade",
    harvestDate: "2024-06-08",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop&crop=center",
    location: "Kampala, Uganda",
    country: "uganda",
    rating: 4.9,
    reviews: 67,
    fastDelivery: false,
    farmVerified: true,
    category: "grains"
  },
  {
    id: "3",
    farmId: "3",
    farmName: "Nimba County Farms",
    crop: "Palm Oil",
    variety: "Red Palm Oil",
    price: 120,
    unit: "liter",
    quantity: 100,
    quality: "Grade A",
    certification: "Organic",
    harvestDate: "2024-06-12",
    image: "https://media.istockphoto.com/id/151662238/photo/red-palm-oil.webp?a=1&b=1&s=612x612&w=0&k=20&c=tTw_sxp6Ia9VMmI7FgNT8kwaXPNAG1xkV-SYwSJG8QA=",
    location: "Nimba County, Liberia",
    country: "liberia",
    rating: 4.7,
    reviews: 28,
    fastDelivery: true,
    farmVerified: true,
    category: "grains"
  },
  {
    id: "4",
    farmId: "4",
    farmName: "Entebbe Fruit Gardens",
    crop: "Fresh Bananas",
    variety: "Matooke",
    price: 2500,
    unit: "bunch",
    quantity: 150,
    quality: "Grade A",
    certification: "GAP Certified",
    harvestDate: "2024-06-14",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop&crop=center",
    location: "Entebbe, Uganda",
    country: "uganda",
    rating: 4.6,
    reviews: 41,
    fastDelivery: true,
    farmVerified: true,
    category: "fruits"
  },
  {
    id: "5",
    farmId: "1",
    farmName: "Liberian Organic Collective",
    crop: "Fresh Ginger",
    variety: "Yellow Ginger",
    price: 85,
    unit: "kg",
    quantity: 75,
    quality: "Grade A+",
    certification: "Organic",
    harvestDate: "2024-06-11",
    image: "https://plus.unsplash.com/premium_photo-1675364893053-180a3c6e0119?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Z2luZ2VyfGVufDB8fDB8fHww",
    location: "Monrovia, Liberia",
    country: "liberia",
    rating: 4.8,
    reviews: 19,
    fastDelivery: true,
    farmVerified: true,
    category: "herbs"
  },
  {
    id: "6",
    farmId: "5",
    farmName: "Jinja Organic Farms",
    crop: "Sesame Seeds",
    variety: "White Sesame",
    price: 6500,
    unit: "kg",
    quantity: 300,
    quality: "Grade A",
    certification: "Organic",
    harvestDate: "2024-06-09",
    image: "https://plus.unsplash.com/premium_photo-1667773301057-65909aa87b95?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c2VzYW1lJTIwc2VlZHxlbnwwfHwwfHx8MA%3D%3D",
    location: "Jinja, Uganda",
    country: "uganda",
    rating: 4.7,
    reviews: 35,
    fastDelivery: false,
    farmVerified: true,
    category: "legumes"
  }
]

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function MarketplacePage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  
  const { addToCart } = useCart()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let filtered = cropListings.filter(listing => {
      const matchesSearch = listing.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           listing.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           listing.location.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCountry = selectedCountry === "all" || listing.country === selectedCountry
      const matchesCategory = selectedCategory === "all" || listing.category === selectedCategory
      
      return matchesSearch && matchesCountry && matchesCategory
    })

    // Sort listings
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        filtered.sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime())
        break
      default:
        // Featured - keep original order
        break
    }

    return filtered
  }, [searchQuery, selectedCountry, selectedCategory, sortBy])

  const getCurrentCurrency = () => {
    if (selectedCountry === "all") return "Mixed"
    const country = countries.find(c => c.id === selectedCountry)
    return country?.currencySymbol || ""
  }

  const handleAddToCart = (listing: CropListing) => {
    const country = countries.find(c => c.id === listing.country)
    addToCart({
      id: listing.id,
      name: listing.crop,
      price: listing.price,
      currency: country?.currencySymbol || "",
      image: listing.image,
      farmName: listing.farmName,
      unit: listing.unit,
      quantity: 1,
      category: listing.category,
      location: listing.location,
      inStock: true
    })
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground text-lg">
            Discover fresh produce from verified farmers across Africa
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search crops, farms, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-full lg:w-48 h-12">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🌍 All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48 h-12">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="lg" className="w-full lg:w-auto">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                {filteredListings.length} products found
                {selectedCountry !== "all" && (
                  <span className="ml-2">
                    in {countries.find(c => c.id === selectedCountry)?.name}
                  </span>
                )}
              </Badge>
              {selectedCountry !== "all" && (
                <Badge variant="outline">
                  Currency: {getCurrentCurrency()}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
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
              
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Product Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          <AnimatePresence>
            {filteredListings.map((listing, index) => {
              const currency = countries.find(c => c.id === listing.country)?.currencySymbol || ""
              
              return (
                <motion.div
                  key={listing.id}
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="cursor-pointer"
                >
                  <Link href={`/products/${listing.id}`}>
                    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-white dark:bg-gray-800">
                    <div className="relative overflow-hidden">
                      <img
                        src={listing.image}
                        alt={listing.crop}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="absolute top-2 left-2 flex gap-2">
                        {listing.farmVerified && (
                          <Badge className="bg-green-600 text-white">
                            <Shield className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                        {listing.certification && (
                          <Badge variant="secondary" className="bg-white/90">
                            {listing.certification}
                          </Badge>
                        )}
                      </div>
                      
                      <motion.div 
                        className="absolute top-2 right-2"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/80 hover:bg-white">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      
                      {listing.fastDelivery && (
                        <div className="absolute bottom-2 left-2">
                          <Badge className="bg-blue-600 text-white">
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
                            <AvatarFallback className="text-xs bg-green-100 dark:bg-green-900">
                              {listing.farmName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium truncate">{listing.farmName}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{listing.rating}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{listing.location}</span>
                          <Separator orientation="vertical" className="h-3" />
                          <span>{listing.quantity} {listing.unit}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-green-600">
                              {currency}{listing.price.toLocaleString()}
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
                            {new Date(listing.harvestDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700" 
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleAddToCart(listing)
                            }}
                          >
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
                  </Link>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {filteredListings.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Leaf className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or browse different categories
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
