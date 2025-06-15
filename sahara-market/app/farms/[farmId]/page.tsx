"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Star,
  Shield,
  Phone,
  Mail,
  Globe,
  Truck,
  Clock,
  Heart,
  ShoppingCart,
  MessageSquare,
  Share2,
  ArrowLeft,
  Calendar,
  Users,
  Package,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"

// This would normally come from your API/database
const getFarmData = (farmId: string) => {
  const farms = {
    "1": {
      id: "1",
      name: "Liberian Organic Collective",
      tagline: "Sustainable farming for a better tomorrow",
      location: "Monrovia, Liberia",
      country: "liberia",
      rating: 4.8,
      totalSales: 1250,
      totalReviews: 89,
      totalProducts: 12,
      joinedDate: "2023-01-15",
      specialties: ["Organic Cassava", "Palm Oil", "Ginger"],
      avatar: "/api/placeholder/120/120",
      cover: "/api/placeholder/1200/400",
      verified: true,
      description: "A cooperative of local farmers committed to sustainable, organic farming practices in Liberia. We specialize in traditional crops grown with modern organic techniques. Our mission is to provide healthy, nutritious food while preserving our environment for future generations.",
      story: "Founded in 2023, the Liberian Organic Collective represents over 50 local farmers across Montserrado County. We began as a small group of friends who shared a vision of sustainable agriculture that respects both traditional farming methods and modern organic practices. Today, we're proud to be one of Liberia's leading organic producers.",
      phone: "+231-555-0123",
      email: "contact@liberianorganic.lr",
      website: "www.liberianorganic.lr",
      certifications: ["Organic", "Fair Trade", "Rainforest Alliance"],
      farmingMethods: ["Organic", "Sustainable", "Traditional"],
      deliveryAreas: ["Monrovia", "Paynesville", "New Kru Town"],
      products: [
        {
          id: "1",
          name: "Organic Cassava",
          variety: "Sweet Cassava",
          price: 45,
          unit: "kg",
          quantity: 500,
          image: "https://media.istockphoto.com/id/1011964780/photo/manioc.webp?a=1&b=1&s=612x612&w=0&k=20&c=rc1tsaAJOurmQfeQ-qvD7D3fnpMVP2HWVoLoeDiPsB0=",
          inStock: true,
          rating: 4.9,
          reviews: 23
        },
        {
          id: "2", 
          name: "Fresh Ginger",
          variety: "Yellow Ginger",
          price: 85,
          unit: "kg",
          quantity: 75,
          image: "https://plus.unsplash.com/premium_photo-1675364893053-180a3c6e0119?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Z2luZ2VyfGVufDB8fDB8fHww",
          inStock: true,
          rating: 4.8,
          reviews: 19
        },
        {
          id: "3",
          name: "Palm Oil",
          variety: "Red Palm Oil",
          price: 120,
          unit: "liter",
          quantity: 100,
          image: "https://media.istockphoto.com/id/151662238/photo/red-palm-oil.webp?a=1&b=1&s=612x612&w=0&k=20&c=tTw_sxp6Ia9VMmI7FgNT8kwaXPNAG1xkV-SYwSJG8QA=",
          inStock: true,
          rating: 4.7,
          reviews: 28
        }
      ],
      reviews: [
        {
          id: "1",
          author: "Sarah Johnson",
          rating: 5,
          comment: "Excellent quality cassava! Fresh and organic as promised.",
          date: "2024-06-10",
          verified: true
        },
        {
          id: "2",
          author: "David Miller",
          rating: 5,
          comment: "Best palm oil I've ever bought. Will definitely order again.",
          date: "2024-06-08",
          verified: true
        }
      ]
    },
    "2": {
      id: "2",
      name: "Kampala Fresh Co-op",
      tagline: "Premium coffee and fresh produce",
      location: "Kampala, Uganda",
      country: "uganda",
      rating: 4.9,
      totalSales: 2100,
      totalReviews: 156,
      totalProducts: 18,
      joinedDate: "2022-08-20",
      specialties: ["Coffee", "Bananas", "Sweet Potatoes"],
      avatar: "/api/placeholder/120/120",
      cover: "/api/placeholder/1200/400",
      verified: true,
      description: "Premier coffee and fresh produce cooperative serving Central Uganda. We work directly with over 200 smallholder farmers to bring you the highest quality crops.",
      story: "Founded in 2022, Kampala Fresh Co-op has grown to become one of Uganda's most trusted agricultural cooperatives. Our mission is to connect smallholder farmers with quality markets while ensuring fair pricing and sustainable farming practices.",
      phone: "+256-700-123456",
      email: "info@kampalafresh.ug",
      website: "www.kampalafresh.ug",
      certifications: ["Fair Trade", "UTZ Certified", "4C Association"],
      farmingMethods: ["Sustainable", "GAP", "Integrated"],
      deliveryAreas: ["Kampala", "Entebbe", "Mukono", "Wakiso"],
      products: [
        {
          id: "4",
          name: "Arabica Coffee Beans",
          variety: "AA Grade",
          price: 250,
          unit: "kg",
          quantity: 200,
          image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop&crop=center",
          inStock: true,
          rating: 4.9,
          reviews: 45
        },
        {
          id: "5",
          name: "Sweet Bananas",
          variety: "Cavendish",
          price: 35,
          unit: "bunch",
          quantity: 150,
          image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop&crop=center",
          inStock: true,
          rating: 4.8,
          reviews: 32
        }
      ],
      reviews: [
        {
          id: "3",
          author: "John Mukasa",
          rating: 5,
          comment: "Best coffee beans in Uganda! Excellent quality and fast delivery.",
          date: "2024-06-12",
          verified: true
        }
      ]
    },
    "3": {
      id: "3",
      name: "Nimba County Farms",
      tagline: "Traditional farming with modern sustainability",
      location: "Nimba County, Liberia",
      country: "liberia",
      rating: 4.7,
      totalSales: 890,
      totalReviews: 67,
      totalProducts: 8,
      joinedDate: "2023-03-10",
      specialties: ["Palm Oil", "Cocoa", "Rice"],
      avatar: "/api/placeholder/120/120",
      cover: "/api/placeholder/1200/400",
      verified: true,
      description: "Family-owned farm network in Nimba County, specializing in traditional Liberian crops. Three generations of farming experience with modern sustainable practices.",
      story: "Established in 2015, Nimba County Farms represents a network of family-owned farms across Nimba County. We combine traditional Liberian farming wisdom passed down through generations with modern sustainable agricultural practices to produce high-quality crops.",
      phone: "+231-555-0456",
      email: "hello@nimbafarms.lr",
      website: "www.nimbafarms.lr",
      certifications: ["RSPO", "Organic"],
      farmingMethods: ["Traditional", "Sustainable", "Family-owned"],
      deliveryAreas: ["Ganta", "Sanniquellie", "Tappita"],
      products: [
        {
          id: "4",
          name: "Organic Yams",
          variety: "White Yams",
          price: 65,
          unit: "kg",
          quantity: 120,
          image: "https://media.istockphoto.com/id/1463749704/photo/sweet-potatoes-at-the-organic-farmers-market-fall-vegetables.jpg?s=612x612&w=0&k=20&c=vetqLCWFBS-1mU2jW7YWU70D9wMTmtmFr3pH9RPRyQU=",
          inStock: true,
          rating: 4.9,
          reviews: 18
        },
        {
          id: "7",
          name: "Palm Oil",
          variety: "Red Palm Oil",
          price: 120,
          unit: "liter",
          quantity: 100,
          image: "https://media.istockphoto.com/id/151662238/photo-red-palm-oil.webp?a=1&b=1&s=612x612&w=0&k=20&c=tTw_sxp6Ia9VMmI7FgNT8kwaXPNAG1xkV-SYwSJG8QA=",
          inStock: true,
          rating: 4.7,
          reviews: 28
        }
      ],
      reviews: [
        {
          id: "4",
          author: "Mary Williams",
          rating: 5,
          comment: "Excellent quality yams! Fresh and perfectly grown. Will order again.",
          date: "2024-06-11",
          verified: true
        },
        {
          id: "5",
          author: "James Cooper",
          rating: 4,
          comment: "Good quality palm oil, authentic and well-packaged.",
          date: "2024-06-09",
          verified: true
        }
      ]
    }
  }

  return farms[farmId as keyof typeof farms] || null
}

interface FarmStorePageProps {
  params: {
    farmId: string
  }
}

export default function FarmStorePage({ params }: FarmStorePageProps) {
  const [mounted, setMounted] = useState(false)
  const [selectedTab, setSelectedTab] = useState("products")
  const [addedToCart, setAddedToCart] = useState<string | null>(null)
  const { addToCart } = useCart()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Clear the "added to cart" feedback after 2 seconds
  useEffect(() => {
    if (addedToCart) {
      const timer = setTimeout(() => setAddedToCart(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [addedToCart])

  if (!mounted) {
    return null
  }

  const farm = getFarmData(params.farmId)

  if (!farm) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Farm Not Found</h1>
          <p className="text-muted-foreground mb-4">The farm you're looking for doesn't exist.</p>
          <Link href="/farms">
            <Button>Browse All Farms</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = (product: any) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      unit: product.unit,
      currency: "L$",
      image: product.image,
      farmName: farm.name,
      maxQuantity: product.quantity
    }
    
    addToCart(cartItem)
    setAddedToCart(product.id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Cover Image */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={farm.cover}
          alt={farm.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Link href="/farms">
            <Button variant="ghost" size="sm" className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Farms
            </Button>
          </Link>
        </div>

        {/* Share Button */}
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="sm" className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Farm Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <div className="flex items-end gap-6">
              <Avatar className="h-24 w-24 border-4 border-white">
                <AvatarImage src={farm.avatar} />
                <AvatarFallback className="bg-green-600 text-white text-xl">
                  {farm.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{farm.name}</h1>
                  {farm.verified && (
                    <Badge className="bg-green-600 text-white">
                      <Shield className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-lg opacity-90 mb-2">{farm.tagline}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {farm.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {farm.rating} ({farm.totalReviews} reviews)
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Since {new Date(farm.joinedDate).getFullYear()}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Heart className="mr-2 h-4 w-4" />
                  Follow Farm
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Products", value: farm.totalProducts, icon: Package },
            { label: "Sales", value: farm.totalSales, icon: TrendingUp },
            { label: "Customers", value: farm.totalReviews, icon: Users },
            { label: "Rating", value: farm.rating, icon: Star }
          ].map((stat, index) => (
            <Card key={index} className="text-center p-4">
              <stat.icon className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {farm.products.map((product) => (
                    <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                      <div className="relative overflow-hidden">
                        <Link href={`/products/${product.id}`}>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-48 object-cover transition-transform group-hover:scale-105 cursor-pointer"
                          />
                        </Link>
                        <div className="absolute top-2 right-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/80">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="secondary">Out of Stock</Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-semibold text-lg mb-1 hover:text-green-600 cursor-pointer transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-2">{product.variety}</p>
                        
                        <div className="flex items-center gap-1 mb-3">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{product.rating} ({product.reviews})</span>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-xl font-bold text-green-600">L${product.price}</span>
                            <span className="text-sm text-muted-foreground">/{product.unit}</span>
                          </div>
                          <Badge variant="outline">{product.quantity} {product.unit} available</Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            className={`flex-1 ${addedToCart === product.id ? 'bg-green-700' : 'bg-green-600 hover:bg-green-700'}`}
                            size="sm"
                            disabled={!product.inStock}
                            onClick={() => handleAddToCart(product)}
                          >
                            {addedToCart === product.id ? (
                              <>
                                <span className="mr-2">✓</span>
                                Added!
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Cart
                              </>
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Our Story</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {farm.story}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Farming Methods</h4>
                        <div className="flex flex-wrap gap-2">
                          {farm.farmingMethods.map((method, index) => (
                            <Badge key={index} variant="secondary">{method}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Certifications</h4>
                        <div className="flex flex-wrap gap-2">
                          {farm.certifications.map((cert, index) => (
                            <Badge key={index} className="bg-green-100 text-green-700">{cert}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {farm.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback>{review.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{review.author}</span>
                            {review.verified && (
                              <Badge variant="outline" className="text-xs">Verified Purchase</Badge>
                            )}
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-2">{review.comment}</p>
                          <span className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="contact" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {farm.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-green-600" />
                          <span>{farm.phone}</span>
                        </div>
                      )}
                      {farm.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-green-600" />
                          <span>{farm.email}</span>
                        </div>
                      )}
                      {farm.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-green-600" />
                          <span>{farm.website}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Areas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {farm.deliveryAreas.map((area, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-green-600" />
                            <span>{area}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Farm Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Location:</span>
                  <div className="font-medium">{farm.location}</div>
                </div>
                <Separator />
                <div className="text-sm">
                  <span className="text-muted-foreground">Specialties:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {farm.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="text-sm">
                  <span className="text-muted-foreground">Member since:</span>
                  <div className="font-medium">{new Date(farm.joinedDate).toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full">
                  <Heart className="mr-2 h-4 w-4" />
                  Follow Farm
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Store
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
