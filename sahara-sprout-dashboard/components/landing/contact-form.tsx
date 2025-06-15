"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, User, Sprout, Calendar } from "lucide-react"
import { Textarea } from "../ui/textarea"

interface ContactFormProps {
  selectedPlan: string
  onSubmit: (formData: ContactFormData) => void
  onCancel: () => void
  recommendations?: any // Optional recommendations from questionnaire
}

export interface ContactFormData {
  // Personal Information
  fullName: string
  phone: string
  email: string
  whatsapp: string
  
  // Farm Information
  farmLocation: string
  farmSize: string
  farmSizeUnit: string
  cropTypes: string
  currentSetup: string
  
  // Installation Preferences
  preferredContactTime: string
  installationUrgency: string
  additionalNotes: string
  
  // Selected Plan
  selectedPlan: string
  estimatedMonthlyBudget: string
}

export function ContactForm({ selectedPlan, onSubmit, onCancel, recommendations }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: "",
    phone: "",
    email: "",
    whatsapp: "",
    farmLocation: "",
    farmSize: "",
    farmSizeUnit: "hectares",
    cropTypes: "",
    currentSetup: "",
    preferredContactTime: "",
    installationUrgency: "",
    additionalNotes: "",
    selectedPlan: selectedPlan,
    estimatedMonthlyBudget: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.farmLocation.trim()) {
      newErrors.farmLocation = "Farm location is required"
    }

    if (!formData.farmSize.trim()) {
      newErrors.farmSize = "Farm size is required"
    }

    if (!formData.cropTypes.trim()) {
      newErrors.cropTypes = "Please specify what crops you grow"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSubmit(formData)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const getPlanDisplayName = (planId: string) => {
    const plans = {
      basic: "Smart Irrigation",
      professional: "AI-Powered Farming", 
      cooperative: "Community Farming"
    }
    return plans[planId as keyof typeof plans] || planId
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 dark:from-green-950 dark:via-emerald-950 dark:to-blue-950 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Complete Your Application
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            You're one step away from transforming your farm with SaharaSprout
          </p>
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-700 dark:text-green-300">
              Selected Plan: {getPlanDisplayName(selectedPlan)}
            </span>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Help us understand your farm and schedule your installation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => updateFormData("fullName", e.target.value)}
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="+231 777 123 456"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="farmer@example.com"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Number (optional)</Label>
                  <Input
                    id="whatsapp"
                    placeholder="+231 777 123 456"
                    value={formData.whatsapp}
                    onChange={(e) => updateFormData("whatsapp", e.target.value)}
                  />
                </div>
              </div>

              {/* Farm Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sprout className="h-5 w-5" />
                  Farm Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmLocation">Farm Location *</Label>
                    <Input
                      id="farmLocation"
                      placeholder="e.g., Kakata, Margibi County, Liberia"
                      value={formData.farmLocation}
                      onChange={(e) => updateFormData("farmLocation", e.target.value)}
                      className={errors.farmLocation ? "border-red-500" : ""}
                    />
                    {errors.farmLocation && (
                      <p className="text-sm text-red-500">{errors.farmLocation}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farmSize">Farm Size *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="farmSize"
                        placeholder="2.5"
                        value={formData.farmSize}
                        onChange={(e) => updateFormData("farmSize", e.target.value)}
                        className={`flex-1 ${errors.farmSize ? "border-red-500" : ""}`}
                      />
                      <Select value={formData.farmSizeUnit} onValueChange={(value) => updateFormData("farmSizeUnit", value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hectares">Hectares</SelectItem>
                          <SelectItem value="acres">Acres</SelectItem>
                          <SelectItem value="plots">Plots</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.farmSize && (
                      <p className="text-sm text-red-500">{errors.farmSize}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cropTypes">Crops You Grow *</Label>
                    <Input
                      id="cropTypes"
                      placeholder="e.g., Tomatoes, Peppers, Cassava"
                      value={formData.cropTypes}
                      onChange={(e) => updateFormData("cropTypes", e.target.value)}
                      className={errors.cropTypes ? "border-red-500" : ""}
                    />
                    {errors.cropTypes && (
                      <p className="text-sm text-red-500">{errors.cropTypes}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentSetup">Current Irrigation Setup</Label>
                    <Select value={formData.currentSetup} onValueChange={(value) => updateFormData("currentSetup", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current setup" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-irrigation">No irrigation system</SelectItem>
                        <SelectItem value="manual-watering">Manual watering only</SelectItem>
                        <SelectItem value="basic-irrigation">Basic irrigation system</SelectItem>
                        <SelectItem value="advanced-system">Advanced irrigation system</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Installation Preferences */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Installation Preferences
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferredContactTime">Best Time to Contact You</Label>
                    <Select value={formData.preferredContactTime} onValueChange={(value) => updateFormData("preferredContactTime", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (8am - 12pm)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12pm - 5pm)</SelectItem>
                        <SelectItem value="evening">Evening (5pm - 8pm)</SelectItem>
                        <SelectItem value="anytime">Anytime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="installationUrgency">Installation Timeline</Label>
                    <Select value={formData.installationUrgency} onValueChange={(value) => updateFormData("installationUrgency", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="When would you like to start?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">As soon as possible</SelectItem>
                        <SelectItem value="1-2-weeks">Within 1-2 weeks</SelectItem>
                        <SelectItem value="1-month">Within 1 month</SelectItem>
                        <SelectItem value="planning">Just planning for now</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Additional Notes (optional)</Label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Any specific requirements, questions, or concerns about the installation..."
                    value={formData.additionalNotes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData("additionalNotes", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-6"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      Complete Application
                      <CheckCircle className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="px-8"
                >
                  Go Back
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <Card className="mt-8 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-800 dark:text-green-200">
              What happens next?
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Contact Within 24 Hours</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">Our agricultural specialist will call you to discuss your needs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Free Farm Assessment</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">We'll visit your farm to plan the perfect installation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Installation & Training</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">Professional setup and hands-on training included</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
