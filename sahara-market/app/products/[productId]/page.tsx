"use client"

import { useState, useEffect, use } from "react"
import { motion } from "framer-motion"
import { notFound, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCart } from "@/lib/cart-context"
import {
  MapPin,
  Star,
  Truck,
  Shield,
  Clock,
  Leaf,
  Heart,
  ShoppingCart,
  MessageSquare,
  Share2,
  ArrowLeft,
  Plus,
  Minus,
  Package,
  Award,
  CheckCircle,
  Info,
  Users,
  Phone,
  Mail,
  Store
} from "lucide-react"

// Mock data - in real app this would come from API
const productData = {
  "1": {
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
    images: [
      "https://media.istockphoto.com/id/1011964780/photo/manioc.webp?a=1&b=1&s=612x612&w=0&k=20&c=rc1tsaAJOurmQfeQ-qvD7D3fnpMVP2HWVoLoeDiPsB0=",
      "https://media.istockphoto.com/id/2166676681/photo/cassava-in-the-colombian-peasant-market-square-manihot-esculenta.webp?a=1&b=1&s=612x612&w=0&k=20&c=XaqZhKZIRcEeNUtGM5jfPpveIX8S-el2HhUUO4Y3-yQ=",
      "https://plus.unsplash.com/premium_photo-1725467479101-556af13a7220?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2Fzc2F2YXxlbnwwfHwwfHx8MA%3D%3D"
    ],
    location: "Monrovia, Liberia",
    country: "liberia",
    rating: 4.8,
    reviews: 32,
    fastDelivery: true,
    farmVerified: true,
    category: "vegetables",
    description: "Premium organic cassava grown using traditional sustainable farming methods. Rich in carbohydrates and naturally gluten-free, perfect for various culinary applications.",
    nutritionalInfo: {
      calories: "160 per 100g",
      carbs: "38g",
      fiber: "1.8g",
      protein: "1.4g",
      fat: "0.3g"
    },
    farmInfo: {
      name: "Liberian Organic Collective",
      location: "Monrovia, Liberia",
      established: "2018",
      farmSize: "25 hectares",
      certification: ["Organic", "Fair Trade"],
      specialties: ["Root Vegetables", "Herbs", "Spices"],
      about: "A cooperative of 15 local farmers committed to sustainable organic farming practices. We focus on traditional crops with modern organic techniques.",
      contact: {
        phone: "+231-123-456-789",
        email: "info@liberianorganic.lr"
      }
    },
    shippingInfo: {
      freeShipping: true,
      estimatedDelivery: "2-3 days",
      shippingMethods: ["Standard Delivery", "Express Delivery", "Pickup"],
      packagingType: "Eco-friendly packaging"
    },
    minOrder: 5,
    maxOrder: 100,
    inStock: true,
    tags: ["Organic", "Gluten-Free", "Traditional", "Sustainable"]
  },
  "2": {
    id: "2",
    farmId: "1",
    farmName: "Liberian Organic Collective",
    crop: "Sweet Potatoes",
    variety: "Orange Sweet Potato",
    price: 38,
    unit: "kg",
    quantity: 300,
    quality: "Grade A",
    certification: "Organic",
    harvestDate: "2024-06-12",
    images: [
      "https://images.unsplash.com/photo-1730815048561-45df6f7f331d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3dlZXQlMjBwb3RhdG9lc3xlbnwwfHwwfHx8MA%3D%3D"
    ],
    location: "Monrovia, Liberia",
    country: "liberia",
    rating: 4.7,
    reviews: 28,
    fastDelivery: true,
    farmVerified: true,
    category: "vegetables",
    description: "Fresh, nutritious sweet potatoes rich in vitamins and minerals. Perfect for roasting, mashing, or making traditional dishes.",
    nutritionalInfo: {
      calories: "86 per 100g",
      carbs: "20g",
      fiber: "3g",
      protein: "1.6g",
      fat: "0.1g"
    },
    farmInfo: {
      name: "Liberian Organic Collective",
      location: "Monrovia, Liberia",
      established: "2018",
      farmSize: "25 hectares",
      certification: ["Organic", "Fair Trade"],
      specialties: ["Root Vegetables", "Herbs", "Spices"],
      about: "A cooperative of 15 local farmers committed to sustainable organic farming practices.",
      contact: {
        phone: "+231-123-456-789",
        email: "info@liberianorganic.lr"
      }
    },
    shippingInfo: {
      freeShipping: true,
      estimatedDelivery: "2-3 days",
      shippingMethods: ["Standard Delivery", "Express Delivery", "Pickup"],
      packagingType: "Eco-friendly packaging"
    },
    minOrder: 3,
    maxOrder: 50,
    inStock: true,
    tags: ["Organic", "Nutritious", "Traditional", "Sustainable"]
  },
  "3": {
    id: "3",
    farmId: "2",
    farmName: "Kampala Fresh Co-op",
    crop: "Fresh Plantains",
    variety: "Green Plantains",
    price: 52,
    unit: "bunch",
    quantity: 150,
    quality: "Grade A",
    certification: "Fair Trade",
    harvestDate: "2024-06-14",
    images: [
      "https://media.istockphoto.com/id/183329155/photo/seven-ripe-bananas-ready-to-eat.webp?a=1&b=1&s=612x612&w=0&k=20&c=q5DFWy8B3RGV5-hsopIek7DAaLnxKC488fSN23p7B_M="
    ],
    location: "Kampala, Uganda",
    country: "uganda",
    rating: 4.6,
    reviews: 22,
    fastDelivery: true,
    farmVerified: true,
    category: "fruits",
    description: "Fresh plantains perfect for cooking and frying. A staple food rich in potassium and carbohydrates.",
    nutritionalInfo: {
      calories: "122 per 100g",
      carbs: "32g",
      fiber: "2.3g",
      protein: "1.3g",
      fat: "0.4g"
    },
    farmInfo: {
      name: "Kampala Fresh Co-op",
      location: "Kampala, Uganda",
      established: "2020",
      farmSize: "30 hectares",
      certification: ["Fair Trade", "UTZ Certified"],
      specialties: ["Tropical Fruits", "Bananas", "Plantains"],
      about: "Premier cooperative serving Central Uganda with quality tropical fruits.",
      contact: {
        phone: "+256-700-123456",
        email: "info@kampalafresh.ug"
      }
    },
    shippingInfo: {
      freeShipping: true,
      estimatedDelivery: "1-2 days",
      shippingMethods: ["Standard Delivery", "Express Delivery"],
      packagingType: "Biodegradable packaging"
    },
    minOrder: 2,
    maxOrder: 20,
    inStock: true,
    tags: ["Fresh", "Traditional", "Potassium-Rich", "Fair Trade"]
  },
  "4": {
    id: "4",
    farmId: "3",
    farmName: "Nimba County Farms",
    crop: "Organic Yams",
    variety: "White Yams",
    price: 65,
    unit: "kg",
    quantity: 120,
    quality: "Grade A",
    certification: "Organic",
    harvestDate: "2024-06-13",
    images: [
      "https://media.istockphoto.com/id/1463749704/photo/sweet-potatoes-at-the-organic-farmers-market-fall-vegetables.jpg?s=612x612&w=0&k=20&c=vetqLCWFBS-1mU2jW7YWU70D9wMTmtmFr3pH9RPRyQU="
    ],
    location: "Nimba County, Liberia",
    country: "liberia",
    rating: 4.9,
    reviews: 18,
    fastDelivery: true,
    farmVerified: true,
    category: "vegetables",
    description: "Premium organic yams grown in the fertile soils of Nimba County. Rich in complex carbohydrates and essential nutrients.",
    nutritionalInfo: {
      calories: "118 per 100g",
      carbs: "27g",
      fiber: "4.1g",
      protein: "1.5g",
      fat: "0.2g"
    },
    farmInfo: {
      name: "Nimba County Farms",
      location: "Nimba County, Liberia",
      established: "2015",
      farmSize: "40 hectares",
      certification: ["Organic", "RSPO"],
      specialties: ["Root Vegetables", "Palm Oil", "Cocoa"],
      about: "Family-owned farm network specializing in traditional Liberian crops with modern sustainable practices.",
      contact: {
        phone: "+231-555-0456",
        email: "hello@nimbafarms.lr"
      }
    },
    shippingInfo: {
      freeShipping: true,
      estimatedDelivery: "3-4 days",
      shippingMethods: ["Standard Delivery", "Express Delivery"],
      packagingType: "Eco-friendly packaging"
    },
    minOrder: 2,
    maxOrder: 30,
    inStock: true,
    tags: ["Organic", "Traditional", "Nutrient-Rich", "Sustainable"]
  }
}

const relatedProducts = [
  {
    id: "2",
    name: "Sweet Potatoes",
    price: "L$ 38",
    farm: "Monrovia Farms",
    image: "https://images.unsplash.com/photo-1730815048561-45df6f7f331d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3dlZXQlMjBwb3RhdG9lc3xlbnwwfHwwfHx8MA%3D%3D",
    rating: 4.7
  },
  {
    id: "3",
    name: "Fresh Plantains",
    price: "L$ 52",
    farm: "Coastal Organic",
    image: "https://media.istockphoto.com/id/183329155/photo/seven-ripe-bananas-ready-to-eat.webp?a=1&b=1&s=612x612&w=0&k=20&c=q5DFWy8B3RGV5-hsopIek7DAaLnxKC488fSN23p7B_M=",
    rating: 4.6
  },
  {
    id: "4",
    name: "Organic Yams",
    price: "L$ 65",
    farm: "Nimba Farms",
    image: "https://media.istockphoto.com/id/1463749704/photo/sweet-potatoes-at-the-organic-farmers-market-fall-vegetables.jpg?s=612x612&w=0&k=20&c=vetqLCWFBS-1mU2jW7YWU70D9wMTmtmFr3pH9RPRyQU=",
    rating: 4.9
  }
]

export default function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(5)
  const [mounted, setMounted] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })
  
  const { addToCart } = useCart()
  const resolvedParams = use(params)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const product = productData[resolvedParams.productId as keyof typeof productData]
  
  if (!product) {
    notFound()
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= product.minOrder && newQuantity <= product.maxOrder) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.crop,
      price: product.price,
      currency: "L$", // Liberian Dollar for this product
      image: product.images[0],
      farmName: product.farmName,
      unit: product.unit,
      quantity: quantity,
      category: product.category,
      location: product.location,
      inStock: product.inStock
    })
  }

  const handleContactFarm = () => {
    setContactForm({
      name: "",
      email: "",
      phone: "",
      subject: `Inquiry about ${product.crop}`,
      message: `Hi ${product.farmName},\n\nI'm interested in your ${product.crop} (${product.variety}). Could you please provide more information about:\n\n- Availability and pricing\n- Delivery options\n- Bulk discounts\n\nThank you!`
    })
    setShowContactModal(true)
  }

  const handleSendMessage = () => {
    // In a real app, this would send the message to the farm's dashboard
    // For now, we'll simulate the API call
    console.log('Sending message to farm:', {
      farmId: product.farmId,
      farmName: product.farmName,
      productId: product.id,
      productName: product.crop,
      customerMessage: contactForm
    })
    
    setShowContactModal(false)
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 4000)
    
    // Reset form
    setContactForm({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    })
  }

  const handleFormChange = (field: string, value: string) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCallFarm = () => {
    // In a real app, this would initiate a call or show a phone number
    if (confirm(`Call ${product.farmName} at ${product.farmInfo.contact.phone}?`)) {
      window.open(`tel:${product.farmInfo.contact.phone}`)
    }
  }

  const handleEmailFarm = () => {
    // In a real app, this would open email client or send an email
    const subject = encodeURIComponent(`Inquiry about ${product.crop}`)
    const body = encodeURIComponent(`Hi ${product.farmName},\n\nI'm interested in your ${product.crop} (${product.variety}). Could you please provide more information?\n\nThank you!`)
    window.open(`mailto:${product.farmInfo.contact.email}?subject=${subject}&body=${body}`)
  }

  const totalPrice = product.price * quantity

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Success Message Notification */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>Message sent to {product.farmName} successfully!</span>
          </div>
        </motion.div>
      )}

      {/* Contact Farm Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Contact {product.farmName}
            </DialogTitle>
            <DialogDescription>
              Send a message to {product.farmName} about their {product.crop}. They'll receive your inquiry in their farm dashboard and respond directly to you.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  value={contactForm.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                  placeholder="+231-XXX-XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={contactForm.subject}
                  onChange={(e) => handleFormChange("subject", e.target.value)}
                  placeholder="What is this about?"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={contactForm.message}
                onChange={(e) => handleFormChange("message", e.target.value)}
                placeholder="Write your message here..."
                className="min-h-[120px]"
                required
              />
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium">Product Details:</p>
                  <p>{product.crop} - {product.variety}</p>
                  <p>Price: L$ {product.price} per {product.unit}</p>
                  <p>Farm: {product.farmName}</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={!contactForm.name || !contactForm.email || !contactForm.message}
              className="bg-green-600 hover:bg-green-700"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative rounded-lg overflow-hidden bg-white dark:bg-gray-800 aspect-square">
              <img
                src={product.images[selectedImage]}
                alt={product.crop}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/80 hover:bg-white"
                  onClick={() => setIsInWishlist(!isInWishlist)}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/80 hover:bg-white"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-green-500' : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.crop} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {product.category}
                </Badge>
                {product.farmVerified && (
                  <Badge className="bg-green-600 hover:bg-green-700">
                    <Shield className="mr-1 h-3 w-3" />
                    Verified Farm
                  </Badge>
                )}
                {product.certification && (
                  <Badge variant="secondary">
                    <Award className="mr-1 h-3 w-3" />
                    {product.certification}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.crop}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {product.variety}
              </p>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviews} reviews)</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{product.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-green-100 dark:bg-green-900">
                    {product.farmName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{product.farmName}</p>
                  <p className="text-sm text-muted-foreground">Organic Certified Farm</p>
                </div>
              </div>
            </div>

            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                    L$ {product.price}
                  </span>
                  <span className="text-muted-foreground">per {product.unit}</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Quantity</span>
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= product.minOrder}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold">{quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.maxOrder}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Min order: {product.minOrder} {product.unit} • Max order: {product.maxOrder} {product.unit}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-green-600 dark:text-green-400">
                      L$ {totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleContactFarm}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Farm
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 bg-white/70 dark:bg-gray-800/70">
                <CardContent className="p-4 text-center">
                  <Truck className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="font-semibold text-sm">{product.shippingInfo.estimatedDelivery}</p>
                  <p className="text-xs text-muted-foreground">Delivery</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-white/70 dark:bg-gray-800/70">
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="font-semibold text-sm">
                    {new Date(product.harvestDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Harvested</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="description" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="farm">Farm Info</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Product Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {product.description}
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Key Features:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Grade {product.quality} quality certification</li>
                      <li>Harvested fresh on {new Date(product.harvestDate).toLocaleDateString()}</li>
                      <li>Grown using sustainable farming practices</li>
                      <li>No artificial pesticides or chemicals</li>
                    </ul>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nutrition" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5" />
                    Nutritional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(product.nutritionalInfo).map(([key, value]) => (
                      <div key={key} className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">{value}</p>
                        <p className="text-sm text-muted-foreground capitalize">{key}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="farm" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    About the Farm
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{product.farmInfo.about}</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Farm Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Established:</span>
                          <span>{product.farmInfo.established}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Farm Size:</span>
                          <span>{product.farmInfo.farmSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span>{product.farmInfo.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.farmInfo.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      
                      <h4 className="font-semibold">Certifications</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.farmInfo.certification.map((cert, index) => (
                          <Badge key={index} className="bg-green-600 hover:bg-green-700">
                            <Award className="mr-1 h-3 w-3" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator />
                  
                  <div className="space-y-3">
                    <Link href={`/farms/${product.farmId}`}>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <Store className="mr-2 h-4 w-4" />
                        Visit Farm Store
                      </Button>
                    </Link>
                    
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleContactFarm}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Custom Message
                    </Button>
                    
                    <div className="flex gap-4">
                      <Button variant="outline" className="flex-1" onClick={handleCallFarm}>
                        <Phone className="mr-2 h-4 w-4" />
                        Call Farm
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={handleEmailFarm}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email Farm
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Delivery Options</h4>
                      <div className="space-y-2">
                        {product.shippingInfo.shippingMethods.map((method, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm">{method}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold">Shipping Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estimated Delivery:</span>
                          <span>{product.shippingInfo.estimatedDelivery}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Free Shipping:</span>
                          <span>{product.shippingInfo.freeShipping ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Packaging:</span>
                          <span>{product.shippingInfo.packagingType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Related Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold mb-8">Related Products</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Link href={`/products/${product.id}`}>
                  <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 cursor-pointer">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{product.farm}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {product.price}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{product.rating}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
