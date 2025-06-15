"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Leaf, 
  Users, 
  Globe, 
  Heart, 
  Truck, 
  Shield, 
  Award,
  Target,
  Lightbulb,
  Handshake,
  MapPin,
  TrendingUp
} from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Direct Connection",
    description: "Connect directly with farmers, eliminating middlemen and ensuring fair prices for both farmers and consumers."
  },
  {
    icon: Leaf,
    title: "Sustainable Agriculture",
    description: "Supporting eco-friendly farming practices that preserve the environment for future generations."
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "Every product is verified for quality and authenticity before reaching your table."
  },
  {
    icon: Truck,
    title: "Fresh Delivery",
    description: "Farm-to-table delivery ensuring maximum freshness and minimal time from harvest to delivery."
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connecting farmers across Africa and beyond to global markets and opportunities."
  },
  {
    icon: Heart,
    title: "Community Support",
    description: "Building stronger rural communities by providing farmers with better market access and fair compensation."
  }
]

const team = [
  {
    name: "Geitodyu Henrique Crusoe",
    role: "Founder & CEO",
    image: "/team/henrique.jpg",
    bio: "Visionary entrepreneur passionate about revolutionizing African agriculture through technology and sustainable farming practices."
  },
  {
    name: "Kwame Asante",
    role: "Head of Farmer Relations",
    image: "/team/kwame.jpg",
    bio: "Former farmer turned advocate, connecting rural communities with modern market opportunities."
  },
  {
    name: "Cindy Tetama Johnson",
    role: "Technology Director",
    image: "/team/cindy.jpg",
    bio: "Tech entrepreneur passionate about using technology to solve agricultural challenges in Africa."
  },
  {
    name: "Mohamed Hassan",
    role: "Operations Manager",
    image: "/team/mohamed.jpg",
    bio: "Logistics expert ensuring efficient and sustainable supply chain management across multiple countries."
  }
]

const stats = [
  { number: "2,500+", label: "Active Farmers", icon: Users },
  { number: "15,000+", label: "Happy Customers", icon: Heart },
  { number: "8", label: "Countries Served", icon: Globe },
  { number: "95%", label: "Farmer Satisfaction", icon: Award }
]

const milestones = [
  {
    year: "2019",
    title: "SaharaMarket Founded",
    description: "Started with 50 farmers in Liberia, focusing on connecting rural farmers to urban markets."
  },
  {
    year: "2020",
    title: "Digital Platform Launch",
    description: "Launched our first mobile app and web platform, enabling direct farmer-consumer connections."
  },
  {
    year: "2021",
    title: "Regional Expansion",
    description: "Expanded to Uganda, Ghana, and Kenya, onboarding over 500 farmers across the region."
  },
  {
    year: "2022",
    title: "Quality Certification",
    description: "Introduced comprehensive quality assurance program and organic certification partnerships."
  },
  {
    year: "2023",
    title: "Global Reach",
    description: "Achieved international recognition and partnerships, serving customers across three continents."
  },
  {
    year: "2024",
    title: "Sustainable Impact",
    description: "Reached 2,500+ farmers, improved livelihoods for 10,000+ farming families across Africa."
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            About SaharaMarket
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Connecting Farmers
            <span className="text-green-600 dark:text-green-400"> Across Africa</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            SaharaMarket is revolutionizing agriculture by creating direct connections between farmers and consumers. 
            We believe in fair trade, sustainable farming, and building stronger communities through technology.
          </p>
        </motion.div>

        {/* Mission & Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-8 mb-16"
        >
          <Card className="border-0 bg-white/70 backdrop-blur-sm dark:bg-gray-800/70">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                To empower smallholder farmers across Africa by providing them with direct access to markets, 
                fair pricing, and the tools they need to build sustainable livelihoods while delivering 
                fresh, quality produce to consumers worldwide.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm dark:bg-gray-800/70">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                A world where every farmer has the opportunity to thrive, where sustainable agriculture 
                feeds communities, and where technology bridges the gap between rural producers and 
                global consumers, creating prosperity for all.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Our Impact in Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <Card className="border-0 bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 p-6">
                    <IconComponent className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {stat.label}
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            What Makes Us Different
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="h-full border-0 bg-white/70 backdrop-blur-sm dark:bg-gray-800/70">
                    <CardHeader>
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Our Journey
          </h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`flex items-center gap-8 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}
              >
                <div className="flex-1">
                  <Card className="border-0 bg-white/70 backdrop-blur-sm dark:bg-gray-800/70">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          {milestone.year}
                        </Badge>
                        <CardTitle className="text-xl">{milestone.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300">
                        {milestone.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className="hidden md:block">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1"></div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="border-0 bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 text-center">
                  <CardHeader>
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={member.image} alt={member.name} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription className="text-green-600 dark:text-green-400 font-medium">
                      {member.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Card className="border-0 bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">Join Our Mission</CardTitle>
              <CardDescription className="text-white/90 text-lg max-w-2xl mx-auto">
                Whether you're a farmer looking to reach new markets or a consumer seeking fresh, 
                quality produce, SaharaMarket is here to connect you with what matters most.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary">
                  <Handshake className="mr-2 h-4 w-4" />
                  Partner With Us
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  <MapPin className="mr-2 h-4 w-4" />
                  Find Local Farmers
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
