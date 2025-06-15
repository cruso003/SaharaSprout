"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  MapPin,
  Star,
  Truck,
  Shield,
  Leaf,
  Users,
  Heart,
  ShoppingCart,
  Store,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Globe,
  Award,
  TrendingUp,
  MessageSquare
} from "lucide-react"

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

const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
}

// Landing page specific data
const features = [
  {
    icon: Shield,
    title: "Verified Farmers",
    description: "All farmers are vetted and verified to ensure quality and authenticity of products."
  },
  {
    icon: Truck,
    title: "Fresh Delivery",
    description: "Get farm-fresh produce delivered directly to your door within 24-48 hours."
  },
  {
    icon: Leaf,
    title: "Organic & Sustainable",
    description: "Supporting eco-friendly farming practices for a healthier planet and community."
  },
  {
    icon: Users,
    title: "Direct Connection",
    description: "Connect directly with farmers, ensuring fair prices and transparent sourcing."
  }
]

const stats = [
  { number: "2,500+", label: "Active Farmers", icon: Users },
  { number: "15,000+", label: "Happy Customers", icon: Heart },
  { number: "8", label: "Countries Served", icon: Globe },
  { number: "95%", label: "Customer Satisfaction", icon: Award }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Home Chef",
    location: "Monrovia, Liberia",
    content: "SaharaMarket has transformed how I shop for ingredients. The quality is unmatched and knowing I'm supporting local farmers makes it even better.",
    rating: 5,
    avatar: "/testimonials/sarah.jpg"
  },
  {
    name: "David Mukasa",
    role: "Restaurant Owner",
    location: "Kampala, Uganda",
    content: "As a restaurant owner, having direct access to fresh, quality produce has elevated our dishes. Our customers notice the difference!",
    rating: 5,
    avatar: "/testimonials/david.jpg"
  },
  {
    name: "Grace Kpeh",
    role: "Family Shopper",
    location: "Gbarnga, Liberia",
    content: "Finally, a platform where I can buy fresh vegetables and fruits while supporting our local farming community. Highly recommended!",
    rating: 5,
    avatar: "/testimonials/grace.jpg"
  }
]

const featuredProducts = [
  {
    name: "Organic Cherry Tomatoes",
    price: "L$1,250",
    farm: "Greenville Organic Farm",
    location: "Monrovia, Liberia",
    image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=300&fit=crop&crop=center",
    rating: 4.9
  },
  {
    name: "Fresh Bell Peppers",
    price: "USh 45,000",
    farm: "Kampala Fresh Co-op",
    location: "Kampala, Uganda",
    image: "https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=400&h=300&fit=crop&crop=center",
    rating: 4.7
  },
  {
    name: "Premium Strawberries",
    price: "L$3,200",
    farm: "Bong County Harvest",
    location: "Gbarnga, Liberia",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=300&fit=crop&crop=center",
    rating: 4.8
  }
]

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-8"
            variants={fadeInUp}
          >
            Fresh from Farm
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent block">
              to Your Table
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed"
            variants={fadeInUp}
          >
            Connect directly with verified farmers across Africa. Get the freshest produce, 
            support sustainable agriculture, and build stronger communities.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            variants={fadeInUp}
          >
            <Link href="/marketplace">
              <Button size="lg" className="px-8 py-4 text-lg bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Start Shopping
              </Button>
            </Link>
            <Link href="/farms">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-2 hover:border-green-500 dark:hover:border-green-400">
                <Store className="mr-2 h-5 w-5" />
                Browse Farms
              </Button>
            </Link>
          </motion.div>

          {/* Quick Search */}
          <motion.div 
            className="max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for fresh produce, farms, or locations..."
                  className="pl-10 h-12 border-2 focus:border-green-500 dark:focus:border-green-400"
                />
              </div>
              <Button size="lg" className="px-6 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
                Search
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-white/50 dark:bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose SaharaMarket?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're revolutionizing the way you buy fresh produce by connecting you directly with farmers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="h-full text-center border-0 shadow-lg bg-white dark:bg-gray-800">
                    <CardHeader>
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Our Impact in Numbers</h2>
            <p className="text-xl text-muted-foreground">
              Growing stronger communities across Africa
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 p-8">
                    <IconComponent className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {stat.number}
                    </div>
                    <div className="text-muted-foreground">
                      {stat.label}
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white/50 dark:bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Fresh Picks This Week</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Discover the best seasonal produce from our verified farmers
            </p>
            <Link href="/marketplace">
              <Button variant="outline" className="border-2 hover:border-green-500 dark:hover:border-green-400">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-800">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700">
                      <Star className="mr-1 h-3 w-3 fill-white" />
                      {product.rating}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-green-100 dark:bg-green-900">
                          {product.farm.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{product.farm}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-3 w-3" />
                      {product.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {product.price}
                      </span>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-muted-foreground">
              Real stories from people who love fresh, local produce
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback>
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {testimonial.location}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Stay Connected</h2>
            <p className="text-xl text-white/90 mb-8">
              Get weekly updates on fresh seasonal produce, new farmers, and special offers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70"
              />
              <Button variant="secondary" size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                Subscribe
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of customers enjoying fresh, local produce delivered to their door
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace">
                <Button size="lg" className="px-8 py-4 text-lg bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Shop Now
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-2 hover:border-green-500 dark:hover:border-green-400">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="bg-gray-50 dark:bg-gray-900 border-t"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-xl font-bold">SaharaMarket</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Connecting farmers with consumers for fresher, more sustainable food systems across Africa and beyond.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
            
            {[
              {
                title: "Shop",
                links: [
                  { name: "Marketplace", href: "/marketplace" },
                  { name: "Farm Stores", href: "/farms" },
                  { name: "Categories", href: "/categories" },
                  { name: "Fresh Deals", href: "/marketplace" }
                ]
              },
              {
                title: "Company", 
                links: [
                  { name: "About Us", href: "/about" },
                  { name: "Contact", href: "/contact" },
                  { name: "For Farmers", href: "/contact" },
                  { name: "Careers", href: "/about" }
                ]
              },
              {
                title: "Support",
                links: [
                  { name: "Help Center", href: "/contact" },
                  { name: "Delivery Info", href: "/about" },
                  { name: "Terms of Service", href: "/about" },
                  { name: "Privacy Policy", href: "/about" }
                ]
              }
            ].map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {section.links.map((link) => (
                    <motion.li 
                      key={link.name}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link href={link.href} className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                        {link.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          
          <Separator className="my-8" />
          
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p>&copy; 2024 SaharaMarket. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-red-500" /> for sustainable agriculture
            </p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  )
}
