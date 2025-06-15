"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "@/lib/cart-context"
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
  MapPin,
  User,
  Lock,
  Smartphone,
  Banknote
} from "lucide-react"

// Mobile Money Providers
const mobileMoneyProviders = {
  liberia: [
    { 
      id: "mtn_mobile_money", 
      name: "MTN Mobile Money", 
      icon: "https://images.seeklogo.com/logo-png/55/1/mtn-momo-mobile-money-uganda-logo-png_seeklogo-556395.png", 
      prefix: "+231" 
    },
    { 
      id: "orange_money", 
      name: "Orange Money", 
      icon: "https://techafricanews.com/wp-content/uploads/2020/03/orange-money.jpg", 
      prefix: "+231" 
    }
  ],
  uganda: [
    { 
      id: "mtn_mobile_money", 
      name: "MTN Mobile Money", 
      icon: "https://images.seeklogo.com/logo-png/55/1/mtn-momo-mobile-money-uganda-logo-png_seeklogo-556395.png", 
      prefix: "+256" 
    },
    { 
      id: "airtel_money", 
      name: "Airtel Money", 
      icon: "https://clickpesa.com/wp-content/uploads/2024/08/airtel-money-logo-400x300.png", 
      prefix: "+256" 
    }
  ]
}

export default function CheckoutPage() {
  const router = useRouter()
  const { state, clearCart } = useCart()
  const [mounted, setMounted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    
    // Shipping Address
    address: "",
    city: "",
    state: "",
    country: "liberia",
    postalCode: "",
    
    // Payment Information
    paymentMethod: "mobile_money", // mobile_money, card, cash_on_delivery
    
    // Card Payment Fields
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    
    // Mobile Money Fields
    mobileMoneyProvider: "",
    mobileMoneyNumber: "",
    
    // Delivery Options
    deliveryMethod: "standard",
    deliveryInstructions: ""
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // If cart is empty, redirect to marketplace
  if (state.items.length === 0 && !orderComplete) {
    router.push("/marketplace")
    return null
  }

  // Get available mobile money providers based on country
  const getAvailableProviders = () => {
    return mobileMoneyProviders[formData.country as keyof typeof mobileMoneyProviders] || []
  }

  const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = formData.deliveryMethod === "express" ? 25 : formData.deliveryMethod === "standard" ? 10 : 0
  const tax = subtotal * 0.05 // 5% tax
  const total = subtotal + shipping + tax

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Reset mobile money provider when country changes
      if (field === "country") {
        newData.mobileMoneyProvider = ""
        newData.mobileMoneyNumber = ""
      }
      
      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setIsProcessing(false)
    setOrderComplete(true)
    clearCart()
  }

  const getPaymentMethodText = () => {
    switch (formData.paymentMethod) {
      case "mobile_money":
        return "Pay with Mobile Money"
      case "card":
        return "Pay with Card"
      case "cash_on_delivery":
        return "Confirm Order (Cash on Delivery)"
      default:
        return "Complete Order"
    }
  }

  const getOrderConfirmationMessage = () => {
    switch (formData.paymentMethod) {
      case "mobile_money":
        const provider = getAvailableProviders().find(p => p.id === formData.mobileMoneyProvider)
        return `You'll receive a ${provider?.name || 'mobile money'} prompt on your phone shortly. Please complete the payment to confirm your order.`
      case "card":
        return "Your payment has been processed successfully. You'll receive a confirmation email shortly."
      case "cash_on_delivery":
        return "Your order has been confirmed. Please have the exact amount ready when your order arrives."
      default:
        return "Thank you for your order. You'll receive a confirmation email shortly."
    }
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center p-8"
        >
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-6">
            {getOrderConfirmationMessage()}
          </p>
          {formData.paymentMethod === "mobile_money" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Payment Amount:</strong> L$ {total.toFixed(2)}<br />
                <strong>Reference:</strong> SM{Date.now().toString().slice(-6)}
              </p>
            </div>
          )}
          <div className="space-y-3">
            <Button 
              onClick={() => router.push("/marketplace")} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Continue Shopping
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/")} 
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
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
            Back to Cart
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">Checkout</h1>
              <p className="text-muted-foreground">
                Complete your order to get fresh produce delivered to your door
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="liberia">🇱🇷 Liberia</SelectItem>
                          <SelectItem value="uganda">🇺🇬 Uganda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Options */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Delivery Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Delivery Method</Label>
                    <Select value={formData.deliveryMethod} onValueChange={(value) => handleInputChange("deliveryMethod", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pickup">Pickup (Free)</SelectItem>
                        <SelectItem value="standard">Standard Delivery (L$ 10)</SelectItem>
                        <SelectItem value="express">Express Delivery (L$ 25)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
                    <Input
                      id="deliveryInstructions"
                      value={formData.deliveryInstructions}
                      onChange={(e) => handleInputChange("deliveryInstructions", e.target.value)}
                      placeholder="Leave at door, call on arrival, etc."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Options */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Method Selection */}
                  <div>
                    <Label>Payment Method</Label>
                    <div className="grid grid-cols-1 gap-3 mt-2">
                      {/* Mobile Money Option */}
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.paymentMethod === "mobile_money"
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                        onClick={() => handleInputChange("paymentMethod", "mobile_money")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center">
                            {formData.paymentMethod === "mobile_money" && (
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                            )}
                          </div>
                          <Smartphone className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">Mobile Money</p>
                            <p className="text-sm text-muted-foreground">
                              Pay with MTN, Orange Money, Airtel Money, etc.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Payment Option */}
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.paymentMethod === "card"
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                        onClick={() => handleInputChange("paymentMethod", "card")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center">
                            {formData.paymentMethod === "card" && (
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                            )}
                          </div>
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Credit/Debit Card</p>
                            <p className="text-sm text-muted-foreground">
                              Visa, Mastercard, American Express
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cash on Delivery Option */}
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.paymentMethod === "cash_on_delivery"
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                        onClick={() => handleInputChange("paymentMethod", "cash_on_delivery")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center">
                            {formData.paymentMethod === "cash_on_delivery" && (
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                            )}
                          </div>
                          <Banknote className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="font-medium">Cash on Delivery</p>
                            <p className="text-sm text-muted-foreground">
                              Pay when your order arrives
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Money Fields */}
                  {formData.paymentMethod === "mobile_money" && (
                    <div className="space-y-4 border-t pt-4">
                      <div>
                        <Label>Mobile Money Provider</Label>
                        <Select 
                          value={formData.mobileMoneyProvider} 
                          onValueChange={(value) => handleInputChange("mobileMoneyProvider", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your mobile money provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableProviders().map((provider) => (
                              <SelectItem key={provider.id} value={provider.id}>
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={provider.icon} 
                                    alt={provider.name}
                                    className="w-5 h-5 object-contain"
                                  />
                                  <span>{provider.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {formData.mobileMoneyProvider && (
                        <div>
                          <Label htmlFor="mobileMoneyNumber">Mobile Money Number</Label>
                          <div className="flex">
                            <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 dark:bg-gray-800">
                              <span className="text-sm text-muted-foreground">
                                {getAvailableProviders().find(p => p.id === formData.mobileMoneyProvider)?.prefix}
                              </span>
                            </div>
                            <Input
                              id="mobileMoneyNumber"
                              value={formData.mobileMoneyNumber}
                              onChange={(e) => handleInputChange("mobileMoneyNumber", e.target.value)}
                              placeholder="Enter your mobile money number"
                              className="rounded-l-none"
                              required
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            You'll receive a payment prompt on this number
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Payment Fields */}
                  {formData.paymentMethod === "card" && (
                    <div className="space-y-4 border-t pt-4">
                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          value={formData.cardName}
                          onChange={(e) => handleInputChange("cardName", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                            placeholder="MM/YY"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange("cvv", e.target.value)}
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash on Delivery Info */}
                  {formData.paymentMethod === "cash_on_delivery" && (
                    <div className="border-t pt-4">
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Banknote className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-amber-800 dark:text-amber-200">
                              Cash on Delivery Instructions
                            </h4>
                            <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1">
                              <li>• Please have the exact amount ready: L$ {total.toFixed(2)}</li>
                              <li>• Payment is due upon delivery</li>
                              <li>• Our delivery agent will provide a receipt</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Message */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    Your payment information is secure and encrypted
                  </div>
                </CardContent>
              </Card>
            </form>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="border-0 shadow-lg sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.farmName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × {item.currency}{item.price}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {item.currency}{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Order Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>L$ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>L$ {shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>L$ {tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>L$ {total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                  onClick={handleSubmit}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      {formData.paymentMethod === "mobile_money" && <Smartphone className="mr-2 h-4 w-4" />}
                      {formData.paymentMethod === "card" && <Lock className="mr-2 h-4 w-4" />}
                      {formData.paymentMethod === "cash_on_delivery" && <Banknote className="mr-2 h-4 w-4" />}
                      {getPaymentMethodText()}
                    </>
                  )}
                </Button>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Secure checkout powered by SaharaMarket
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

