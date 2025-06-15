"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useCart } from "@/lib/cart-context"
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight
} from "lucide-react"

export function CartDropdown() {
  const { state, updateQuantity, removeItem } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 relative"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Cart</span>
            <AnimatePresence>
              {state.itemCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-2 -right-2"
                >
                  <Badge 
                    variant="secondary" 
                    className="bg-white text-green-600 h-5 w-5 p-0 rounded-full flex items-center justify-center text-xs font-bold"
                  >
                    {state.itemCount}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Shopping Cart</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {state.itemCount} {state.itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {state.items.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your cart is empty
              </p>
              <Button 
                asChild 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/marketplace">Shop Now</Link>
              </Button>
            </div>
          ) : (
            <div className="p-2">
              {state.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                >
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {item.farmName}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs font-medium px-2">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">
                          {item.currency} {(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {state.items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg">
                ${state.total.toFixed(2)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                asChild 
                variant="outline" 
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/cart">View Cart</Link>
              </Button>
              <Button 
                asChild 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/checkout">
                  Checkout
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
