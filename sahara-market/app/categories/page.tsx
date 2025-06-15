"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Apple, 
  Wheat, 
  Leaf, 
  Fish, 
  Egg, 
  Milk, 
  Coffee, 
  TreePine,
  Flower,
  Cherry,
  Search,
  TrendingUp
} from "lucide-react"

const categories = [
  {
    id: 1,
    name: "Fresh Fruits",
    description: "Seasonal fruits directly from local orchards",
    icon: Apple,
    count: 156,
    trending: true,
    color: "bg-red-500",
    subcategories: ["Citrus", "Tropical", "Berries", "Stone Fruits", "Bananas"]
  },
  {
    id: 2,
    name: "Vegetables",
    description: "Farm-fresh vegetables harvested daily",
    icon: Leaf,
    count: 243,
    trending: true,
    color: "bg-green-500",
    subcategories: ["Leafy Greens", "Root Vegetables", "Legumes", "Herbs", "Peppers"]
  },
  {
    id: 3,
    name: "Grains & Cereals",
    description: "Wholesome grains and cereals from local farms",
    icon: Wheat,
    count: 89,
    trending: false,
    color: "bg-yellow-500",
    subcategories: ["Rice", "Maize", "Millet", "Sorghum", "Quinoa"]
  },
  {
    id: 4,
    name: "Fresh Fish",
    description: "Daily catch from coastal and inland waters",
    icon: Fish,
    count: 67,
    trending: true,
    color: "bg-blue-500",
    subcategories: ["Tilapia", "Catfish", "Salmon", "Tuna", "Sardines"]
  },
  {
    id: 5,
    name: "Poultry & Eggs",
    description: "Free-range poultry and farm-fresh eggs",
    icon: Egg,
    count: 45,
    trending: false,
    color: "bg-orange-500",
    subcategories: ["Chicken", "Duck", "Turkey", "Eggs", "Quail"]
  },
  {
    id: 6,
    name: "Dairy Products",
    description: "Fresh milk and artisanal dairy products",
    icon: Milk,
    count: 34,
    trending: false,
    color: "bg-indigo-500",
    subcategories: ["Milk", "Cheese", "Yogurt", "Butter", "Cream"]
  },
  {
    id: 7,
    name: "Coffee & Tea",
    description: "Premium coffee beans and tea leaves",
    icon: Coffee,
    count: 28,
    trending: true,
    color: "bg-amber-600",
    subcategories: ["Arabica Coffee", "Robusta Coffee", "Black Tea", "Green Tea", "Herbal Tea"]
  },
  {
    id: 8,
    name: "Spices & Herbs",
    description: "Aromatic spices and fresh herbs",
    icon: TreePine,
    count: 92,
    trending: false,
    color: "bg-emerald-600",
    subcategories: ["Turmeric", "Ginger", "Cardamom", "Cinnamon", "Black Pepper"]
  },
  {
    id: 9,
    name: "Flowers & Plants",
    description: "Beautiful flowers and ornamental plants",
    icon: Flower,
    count: 76,
    trending: false,
    color: "bg-pink-500",
    subcategories: ["Cut Flowers", "Potted Plants", "Seeds", "Succulents", "Herbs"]
  },
  {
    id: 10,
    name: "Processed Foods",
    description: "Value-added and processed farm products",
    icon: Cherry,
    count: 123,
    trending: true,
    color: "bg-purple-500",
    subcategories: ["Dried Fruits", "Jams", "Pickles", "Flour", "Oil"]
  }
]

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Browse Categories
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover fresh produce and farm products organized by category. 
            Find exactly what you're looking for from trusted local farmers.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-md mx-auto mb-8"
        >
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredCategories.map((category, index) => {
            const IconComponent = category.icon
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card 
                  className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg border-0 bg-white/70 backdrop-blur-sm dark:bg-gray-800/70"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      {category.trending && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-center">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <Badge variant="outline" className="text-sm">
                        {category.count} products
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Popular items:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {category.subcategories.slice(0, 3).map((sub, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {sub}
                          </Badge>
                        ))}
                        {category.subcategories.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{category.subcategories.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Browse {category.name}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your search terms or browse all categories.
            </p>
          </motion.div>
        )}

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Marketplace Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {categories.reduce((acc, cat) => acc + cat.count, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Total Products
              </div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Categories
              </div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {categories.filter(cat => cat.trending).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Trending
              </div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                150+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Farmers
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
