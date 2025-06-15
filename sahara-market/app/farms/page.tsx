"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  MapPin,
  Star,
  Shield,
  Store,
  Users,
  Package,
  TrendingUp,
  Heart,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

// Types
interface Farm {
  id: string
  name: string
  location: string
  country: string
  rating: number
  totalSales: number
  totalReviews: number
  specialties: string[]
  avatar: string
  verified: boolean
  url: string
  activeCrops: number
  joinedDate: string
  description: string
  cover: string
  phone?: string
  email?: string
  website?: string
  certifications: string[]
  farmingMethods: string[]
  deliveryAreas: string[]
}

// Mock farm data
const farms: Farm[] = [
  {
    id: "1",
    name: "Liberian Organic Collective",
    location: "Monrovia, Liberia",
    country: "liberia",
    rating: 4.8,
    totalSales: 1250,
    totalReviews: 89,
    specialties: ["Organic Cassava", "Palm Oil", "Ginger"],
    avatar: "/api/placeholder/120/120",
    verified: true,
    url: "liberian-organic.saharamarket.com",
    activeCrops: 12,
    joinedDate: "2023-01-15",
    description: "A cooperative of local farmers committed to sustainable, organic farming practices in Liberia. We specialize in traditional crops grown with modern organic techniques.",
    cover: "/api/placeholder/800/400",
    phone: "+231-555-0123",
    email: "contact@liberianorganic.lr",
    website: "www.liberianorganic.lr",
    certifications: ["Organic", "Fair Trade", "Rainforest Alliance"],
    farmingMethods: ["Organic", "Sustainable", "Traditional"],
    deliveryAreas: ["Monrovia", "Paynesville", "New Kru Town"]
  },
  {
    id: "2",
    name: "Kampala Fresh Co-op",
    location: "Kampala, Uganda",
    country: "uganda",
    rating: 4.9,
    totalSales: 2100,
    totalReviews: 156,
    specialties: ["Coffee", "Bananas", "Sweet Potatoes"],
    avatar: "/api/placeholder/120/120",
    verified: true,
    url: "kampala-fresh.saharamarket.com",
    activeCrops: 18,
    joinedDate: "2022-08-20",
    description: "Premier coffee and fresh produce cooperative serving Central Uganda. We work directly with over 200 smallholder farmers to bring you the highest quality crops.",
    cover: "/api/placeholder/800/400",
    phone: "+256-700-123456",
    email: "info@kampalafresh.ug",
    website: "www.kampalafresh.ug",
    certifications: ["Fair Trade", "UTZ Certified", "4C Association"],
    farmingMethods: ["Sustainable", "GAP", "Integrated"],
    deliveryAreas: ["Kampala", "Entebbe", "Mukono", "Wakiso"]
  },
  {
    id: "3",
    name: "Nimba County Farms",
    location: "Nimba County, Liberia",
    country: "liberia",
    rating: 4.7,
    totalSales: 890,
    totalReviews: 67,
    specialties: ["Palm Oil", "Cocoa", "Rice"],
    avatar: "/api/placeholder/120/120",
    verified: true,
    url: "nimba-farms.saharamarket.com",
    activeCrops: 8,
    joinedDate: "2023-03-10",
    description: "Family-owned farm network in Nimba County, specializing in traditional Liberian crops. Three generations of farming experience with modern sustainable practices.",
    cover: "/api/placeholder/800/400",
    phone: "+231-555-0456",
    email: "hello@nimbafarms.lr",
    certifications: ["RSPO", "Organic"],
    farmingMethods: ["Traditional", "Sustainable", "Family-owned"],
    deliveryAreas: ["Ganta", "Sanniquellie", "Tappita"]
  },
  {
    id: "4",
    name: "Entebbe Fruit Gardens",
    location: "Entebbe, Uganda",
    country: "uganda",
    rating: 4.6,
    totalSales: 1450,
    totalReviews: 123,
    specialties: ["Tropical Fruits", "Passion Fruit", "Pineapples"],
    avatar: "/api/placeholder/120/120",
    verified: true,
    url: "entebbe-fruits.saharamarket.com",
    activeCrops: 15,
    joinedDate: "2022-11-05",
    description: "Tropical fruit specialists located near Lake Victoria. We grow exotic and traditional fruits using climate-smart agricultural techniques.",
    cover: "/api/placeholder/800/400",
    phone: "+256-700-789012",
    email: "orders@entebbefruits.ug",
    website: "www.entebbefruits.ug",
    certifications: ["GlobalGAP", "HACCP"],
    farmingMethods: ["Climate-Smart", "Integrated", "Precision"],
    deliveryAreas: ["Entebbe", "Kampala", "Wakiso"]
  },
  {
    id: "5",
    name: "Jinja Organic Farms",
    location: "Jinja, Uganda",
    country: "uganda",
    rating: 4.7,
    totalSales: 1680,
    totalReviews: 98,
    specialties: ["Sesame", "Sunflower", "Soybeans"],
    avatar: "/api/placeholder/120/120",
    verified: true,
    url: "jinja-organic.saharamarket.com",
    activeCrops: 10,
    joinedDate: "2023-02-14",
    description: "Leading organic farm in Eastern Uganda specializing in oil seeds and legumes. Committed to improving soil health and farmer livelihoods.",
    cover: "/api/placeholder/800/400",
    phone: "+256-700-345678",
    email: "info@jinjaorganic.ug",
    certifications: ["Organic", "Fair Trade"],
    farmingMethods: ["Organic", "Regenerative", "Agroecology"],
    deliveryAreas: ["Jinja", "Iganga", "Kamuli"]
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

export default function FarmStoresPage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("all")

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredFarms = farms.filter(farm => {
    const matchesSearch = farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         farm.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         farm.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCountry = selectedCountry === "all" || farm.country === selectedCountry
    return matchesSearch && matchesCountry
  })

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Featured 
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent block">
              Farm Stores
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover trusted farms and browse their dedicated stores across Africa
          </p>

          {/* Search Bar */}
          <div className="flex gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search farms, locations, or specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button size="lg" className="px-8 bg-green-600 hover:bg-green-700">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { label: "Active Farms", value: farms.length, icon: Store },
            { label: "Total Products", value: farms.reduce((acc, farm) => acc + farm.activeCrops, 0), icon: Package },
            { label: "Happy Customers", value: farms.reduce((acc, farm) => acc + farm.totalSales, 0), icon: Users },
            { label: "Average Rating", value: "4.7★", icon: Star }
          ].map((stat, index) => (
            <Card key={index} className="text-center p-4">
              <stat.icon className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </motion.div>

        {/* Farms Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <AnimatePresence>
            {filteredFarms.map((farm, index) => (
              <motion.div
                key={farm.id}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="cursor-pointer"
              >
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-white dark:bg-gray-800">
                  {/* Cover Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={farm.cover}
                      alt={farm.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{farm.name}</h3>
                      <p className="text-sm opacity-90">{farm.url}</p>
                    </div>
                    {farm.verified && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-600 text-white">
                          <Shield className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16 border-2 border-green-200">
                        <AvatarImage src={farm.avatar} />
                        <AvatarFallback className="bg-green-100">
                          {farm.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{farm.name}</h4>
                          {farm.verified && (
                            <Shield className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{farm.rating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({farm.totalReviews} reviews)
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {farm.location}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {farm.description}
                    </p>

                    <Tabs defaultValue="products" className="mb-4">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="certifications">Certs</TabsTrigger>
                        <TabsTrigger value="contact">Contact</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="products" className="mt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Active Products:</span>
                            <Badge variant="outline">{farm.activeCrops}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {farm.specialties.slice(0, 3).map((specialty, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="certifications" className="mt-4">
                        <div className="flex flex-wrap gap-1">
                          {farm.certifications.map((cert, idx) => (
                            <Badge key={idx} className="text-xs bg-green-100 text-green-700">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="contact" className="mt-4">
                        <div className="space-y-2 text-sm">
                          {farm.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span>{farm.phone}</span>
                            </div>
                          )}
                          {farm.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{farm.email}</span>
                            </div>
                          )}
                          {farm.website && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-3 w-3" />
                              <span className="truncate">{farm.website}</span>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {farm.totalSales} sales
                        </span>
                        <span>Joined {new Date(farm.joinedDate).getFullYear()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/farms/${farm.id}`} className="flex-1">
                        <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">
                          Visit Store
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredFarms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No farms found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or browse all available farms
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
