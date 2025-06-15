"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Leaf,
  Users,
  TrendingUp,
  Shield,
  Smartphone,
  Globe,
  BarChart3,
  Package,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Star,
  MapPin,
  Calendar,
  Truck,
  MessageSquare,
  Video,
  BookOpen,
  Handshake
} from "lucide-react"

const benefits = [
  {
    icon: DollarSign,
    title: "Increase Your Income",
    description: "Connect directly with buyers and get fair prices for your crops. No middlemen, higher profits."
  },
  {
    icon: Globe,
    title: "Expand Your Reach",
    description: "Sell to customers across Africa. Access urban markets from your rural farm."
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Get paid safely through mobile money, bank transfers, or cash on delivery."
  },
  {
    icon: BarChart3,
    title: "Track Your Sales",
    description: "Monitor your inventory, sales performance, and customer feedback in real-time."
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Manage your farm store from anywhere using your smartphone or tablet."
  },
  {
    icon: Handshake,
    title: "Support & Training",
    description: "Get ongoing support, training, and resources to grow your farming business."
  }
]

const features = [
  {
    title: "Digital Farm Store",
    description: "Create your online presence with photos, descriptions, and pricing",
    icon: Package
  },
  {
    title: "Customer Management",
    description: "Build relationships with buyers and track customer preferences",
    icon: Users
  },
  {
    title: "Inventory Tracking",
    description: "Keep track of your crops, harvest dates, and stock levels",
    icon: BarChart3
  },
  {
    title: "Mobile Payments",
    description: "Accept payments through MTN Mobile Money, Orange Money, and Airtel Money",
    icon: Smartphone
  },
  {
    title: "Delivery Coordination",
    description: "Coordinate deliveries and pickup schedules with customers",
    icon: Truck
  },
  {
    title: "Performance Analytics",
    description: "Understand your sales trends and optimize your farming business",
    icon: TrendingUp
  }
]

const testimonials = [
  {
    name: "Samuel Konneh",
    location: "Monrovia, Liberia",
    crop: "Cassava & Palm Oil",
    quote: "SaharaMarket helped me reach customers in the city. My income increased by 60% in just 6 months!",
    rating: 5,
    image: "/api/placeholder/60/60"
  },
  {
    name: "Grace Nakato",
    location: "Kampala, Uganda",
    crop: "Coffee & Bananas",
    quote: "The mobile payment system is amazing. I get paid instantly and can track all my sales easily.",
    rating: 5,
    image: "/api/placeholder/60/60"
  },
  {
    name: "Joseph Mulbah",
    location: "Nimba County, Liberia",
    crop: "Rice & Vegetables",
    quote: "Best decision I made for my farm. The support team helped me set up everything in just one day.",
    rating: 5,
    image: "/api/placeholder/60/60"
  }
]

const steps = [
  {
    step: 1,
    title: "Sign Up",
    description: "Create your farmer account with basic information about your farm"
  },
  {
    step: 2,
    title: "Set Up Your Store",
    description: "Add your crops, photos, prices, and farm story"
  },
  {
    step: 3,
    title: "Start Selling",
    description: "Customers can find and buy your products directly from your farm store"
  },
  {
    step: 4,
    title: "Get Paid",
    description: "Receive payments through mobile money or other secure payment methods"
  }
]

export default function FarmersPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("benefits")

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="mb-4 bg-green-600 hover:bg-green-700">
                <Leaf className="mr-1 h-3 w-3" />
                For African Farmers
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Grow Your Farm
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent block">
                  Business Online
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Join thousands of farmers across Africa who are selling directly to customers, 
                increasing their income, and building sustainable farming businesses with SaharaMarket.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="http://localhost:3000/landing">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Start Selling Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg">
                  <Video className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
              <div className="absolute -top-4 -right-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                Free to Join!
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Mobile-First Platform</h3>
                    <p className="text-sm text-muted-foreground">Manage everything from your phone</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Instant Payments</h3>
                    <p className="text-sm text-muted-foreground">Get paid through mobile money</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Direct to Customer</h3>
                    <p className="text-sm text-muted-foreground">No middlemen, higher profits</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-900 py-16"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "2,500+", label: "Active Farmers" },
              { number: "50,000+", label: "Happy Customers" },
              { number: "60%", label: "Average Income Increase" },
              { number: "12", label: "African Countries" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Main Content Tabs */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="testimonials">Stories</TabsTrigger>
              <TabsTrigger value="getting-started">Get Started</TabsTrigger>
            </TabsList>

            <TabsContent value="benefits" className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Why Join SaharaMarket?</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Discover how our platform can transform your farming business and increase your income
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                  >
                    <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                          <benefit.icon className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                        <p className="text-muted-foreground">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Everything you need to run a successful online farm business
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                  >
                    <Card className="h-full border-0 shadow-lg">
                      <CardContent className="p-6">
                        <feature.icon className="h-8 w-8 text-green-600 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="testimonials" className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Hear from farmers who have transformed their businesses with SaharaMarket
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                  >
                    <Card className="h-full border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{testimonial.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {testimonial.location}
                            </div>
                          </div>
                          <div className="flex">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-3">"{testimonial.quote}"</p>
                        <Badge variant="secondary">{testimonial.crop}</Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="getting-started" className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Getting Started is Easy</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Follow these simple steps to start selling your crops online
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                  >
                    <Card className="h-full border-0 shadow-lg text-center">
                      <CardContent className="p-6">
                        <div className="h-16 w-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                          {step.step}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground text-sm">{step.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link href="http://localhost:3000/landing">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Create Your Farm Store
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-4">
                  Free to join • No setup fees • Start selling immediately
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="bg-green-600 dark:bg-green-700 py-16"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Grow Your Farm Business?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful farmers who are already selling on SaharaMarket
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="http://localhost:3000/landing">
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-green-50">
                Sign Up as Farmer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="ghost" className="text-white border-white hover:bg-green-700">
              <MessageSquare className="mr-2 h-4 w-4" />
              Talk to Our Team
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Resources Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-8">Farmer Resources</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Farming Guides</h3>
                <p className="text-muted-foreground mb-4">
                  Access comprehensive guides in your farmer dashboard after signing up
                </p>
                <Button variant="outline" size="sm" disabled>
                  Available in Dashboard
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Video className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Video Tutorials</h3>
                <p className="text-muted-foreground mb-4">
                  Step-by-step training videos available in your farmer dashboard
                </p>
                <Button variant="outline" size="sm" disabled>
                  Available in Dashboard
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
                <p className="text-muted-foreground mb-4">
                  Get instant help from our dedicated farmer support team
                </p>
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
