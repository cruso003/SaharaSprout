"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OnboardingQuestionnaire } from "@/components/onboarding/questionnaire"
import { ContactForm, ContactFormData } from "@/components/landing/contact-form"
import { LandingHeader } from "@/components/layout/landing-header"
import { MarketingFooter } from "@/components/layout/marketing-footer"
import { 
  Droplets, 
  Sprout, 
  Brain, 
  ShoppingCart,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  Users,
  TrendingUp,
  Zap,
  Smartphone,
  Wifi,
  Battery,
  BarChart3,
  MapPin,
  Globe,
  Shield,
  Award,
  Clock,
  DollarSign
} from "lucide-react"

type ViewState = "landing" | "questionnaire" | "contact-form" | "success"
type OnboardingContext = "general" | "water-efficiency" | "ai-farming" | "marketplace" | "financing" | "features"

export default function LandingPage() {
  const [currentView, setCurrentView] = useState<ViewState>("landing")
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [onboardingResults, setOnboardingResults] = useState<any>(null)
  const [isYearly, setIsYearly] = useState(false)
  const [showFinancingOptions, setShowFinancingOptions] = useState(false)
  const [onboardingContext, setOnboardingContext] = useState<OnboardingContext>("general")
  const [contactFormData, setContactFormData] = useState<ContactFormData | null>(null)

  // Generate prefilled data based on context
  const getPrefilledData = (context: OnboardingContext): Record<string, string> => {
    switch (context) {
      case "water-efficiency":
        return { "farming-goals": "water-efficiency" }
      case "ai-farming":
        return { "farming-goals": "yield-increase" }
      case "marketplace":
        return { "farming-goals": "market-access" }
      case "financing":
        return { "current-setup": "no-system" }
      case "features":
        return { "farming-goals": "complete-solution" }
      default:
        return {}
    }
  }

  // Skip questionnaire and proceed directly with plan selection
  const handleSkipToSignup = (planId: string) => {
    handleGetStarted("general", planId)
  }

  // Context-aware handlers  
  const handleGetStarted = (context: OnboardingContext = "general", planId?: string) => {
    // If a specific plan is selected from pricing, go straight to contact form
    if (planId) {
      const defaultResults = {
        answers: { "direct-plan-selection": planId },
        recommendations: {
          plan: planId,
          hardwareNeeds: ["Complete irrigation system", "Smart controller", "Sensor network"],
          setupComplexity: "moderate",
          estimatedCost: planId === "basic" ? "$150-250" : planId === "professional" ? "$300-500" : "$500-800",
          setupTime: planId === "basic" ? "2-3 hours" : planId === "professional" ? "4-6 hours" : "1-2 days",
          financingRecommendation: "",
          canAfford: true,
          budgetConstraint: false
        }
      }
      setOnboardingResults(defaultResults)
      setSelectedPlan(planId)
      setCurrentView("contact-form")
      return
    }
    
    // For general "Get Started" or specific contexts, show questionnaire to help with plan selection
    setOnboardingContext(context)
    setCurrentView("questionnaire")
  }

  const handleOnboardingComplete = (answers: any) => {
    // Process answers and generate recommendations
    const results = generateRecommendations(answers)
    setOnboardingResults(results)
    // Go directly to contact form with the recommended plan
    const recommendedPlan = results.recommendations?.plan || 'basic'
    setSelectedPlan(recommendedPlan)
    setCurrentView("contact-form")
  }

  const handleContactFormSubmit = async (formData: ContactFormData) => {
    try {
      // Store contact form data
      setContactFormData(formData)
      
      // In a real application, this would be an API call to your backend
      const applicationData = {
        ...formData,
        onboardingAnswers: onboardingResults?.answers || {},
        recommendations: onboardingResults?.recommendations || {},
        timestamp: new Date().toISOString(),
        source: 'landing-page'
      }

      // Simulate API call to submit application
      console.log('Submitting application data:', applicationData)
      
      // Store in localStorage for now (in production, this would go to a database)
      if (typeof window !== 'undefined') {
        localStorage.setItem('applicationData', JSON.stringify(applicationData))
      }

      // TODO: Implement actual backend submission
      // await fetch('/api/applications', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(applicationData)
      // })

      // TODO: Send email notification to sales team
      // await fetch('/api/notifications/new-application', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     customerName: formData.fullName,
      //     selectedPlan: formData.selectedPlan,
      //     farmLocation: formData.farmLocation,
      //     phone: formData.phone,
      //     email: formData.email
      //   })
      // })

      // Show success view
      setCurrentView("success")
      
    } catch (error) {
      console.error('Error submitting application:', error)
      // In a real application, show an error message to the user
      alert('There was an error submitting your application. Please try again or contact us directly.')
    }
  }

  const handleContactFormCancel = () => {
    // If user came from questionnaire, go back to questionnaire
    // If user came directly from pricing, go back to landing
    if (onboardingResults?.answers && !onboardingResults.answers["direct-plan-selection"]) {
      setCurrentView("questionnaire")
    } else {
      setCurrentView("landing")
    }
  }

  const generateRecommendations = (userAnswers: any) => {
    // Debug: Log all answers to see what we're working with
    console.log("🔍 DEBUG: User answers:", userAnswers)
    console.log("🔍 DEBUG: userAnswers type:", typeof userAnswers)
    console.log("🔍 DEBUG: userAnswers constructor:", userAnswers.constructor.name)
    console.log("🔍 DEBUG: JSON.stringify(userAnswers):", JSON.stringify(userAnswers))
    
    // Smart recommendation logic based on answers
    let recommendedPlan = "basic"
    let hardwareNeeds: string[] = []
    let setupComplexity = "simple"
    let estimatedCost = "$150-250"
    let setupTime = "2-3 hours"
    let financingRecommendation = ""
    let canAfford = true

    // Get user's answers - handle both direct answers and nested structure
    const answers: Record<string, string> = (userAnswers.answers || userAnswers) as Record<string, string>
    console.log("🔬 DEBUG: Extracted answers object:", answers)
    console.log("🔬 DEBUG: Available answer keys:", Object.keys(answers))
    console.log("🔬 DEBUG: answers['farming-goals']:", answers["farming-goals"])
    console.log("🔬 DEBUG: answers['current-setup']:", answers["current-setup"])
    console.log("🔬 DEBUG: answers['farm-size']:", answers["farm-size"])
    console.log("🔬 DEBUG: answers['technical-comfort']:", answers["technical-comfort"])
    console.log("🔬 DEBUG: answers['budget-range']:", answers["budget-range"])
    
    const farmingGoals = answers["farming-goals"]
    const currentSetup = answers["current-setup"]
    const farmSize = answers["farm-size"]
    const techComfort = answers["technical-comfort"]
    const budgetRange = answers["budget-range"]
    
    console.log("🎯 DEBUG: Extracted values:", {
      farmingGoals,
      currentSetup, 
      farmSize,
      techComfort,
      budgetRange
    })

    // First, determine the ideal plan based on goals (without budget constraints)
    let idealPlan = "basic"
    if (farmingGoals === "complete-solution") {
      idealPlan = "enterprise"
      console.log("🚀 Setting idealPlan to enterprise due to complete-solution goal")
    } else if (farmingGoals === "yield-increase") {
      idealPlan = "professional"
      console.log("🚀 Setting idealPlan to professional due to yield-increase goal")
    } else if (farmingGoals === "market-access") {
      idealPlan = "enterprise"
      console.log("🚀 Setting idealPlan to enterprise due to market-access goal")
    } else {
      idealPlan = "basic" // water-efficiency or other goals
      console.log("🚀 Setting idealPlan to basic due to water-efficiency or other goal")
    }

    console.log("💡 Initial idealPlan:", idealPlan)

    // Upgrade ideal plan based on farm size
    if (farmSize === "large-farm" && idealPlan === "basic") {
      idealPlan = "professional"
      console.log("📈 Upgraded idealPlan to professional due to large farm size")
    } else if (farmSize === "multiple-farms") {
      idealPlan = "enterprise"
      console.log("📈 Upgraded idealPlan to enterprise due to multiple farms")
    }

    // Upgrade ideal plan based on tech comfort
    if (techComfort === "advanced" && idealPlan === "basic") {
      idealPlan = "professional"
      console.log("🛠️ Upgraded idealPlan to professional due to advanced tech comfort")
    }

    console.log("🎯 Final idealPlan after upgrades:", idealPlan)

    // Now apply budget constraints and financing logic
    const planPrices = {
      basic: 15,
      professional: 25,
      enterprise: 40
    }

    // Determine what they can afford based on budget
    let affordablePlan = "basic"
    switch (budgetRange) {
      case "budget-low":
        affordablePlan = "basic" // $5-15 range
        break
      case "budget-medium":
        affordablePlan = "professional" // $15-30 range
        break
      case "budget-high":
        affordablePlan = "enterprise" // $30+ range
        break
      case "budget-flexible":
        affordablePlan = idealPlan // Can get ideal plan with financing
        break
    }

    // Compare ideal vs affordable plan
    if (idealPlan !== affordablePlan && budgetRange !== "budget-flexible") {
      canAfford = false
      recommendedPlan = affordablePlan
      
      // Generate financing recommendation
      if (idealPlan === "enterprise" && affordablePlan === "basic") {
        financingRecommendation = "With our Pay-as-You-Harvest option, you can start with Community Farming for just $10/month and pay the rest from increased profits!"
      } else if (idealPlan === "professional" && affordablePlan === "basic") {
        financingRecommendation = "Consider our Group Financing option - team up with 5 nearby farmers and get AI-Powered Farming for just $15/month each!"
      } else if (idealPlan === "enterprise" && affordablePlan === "professional") {
        financingRecommendation = "Our 6-Month Trial lets you try Community Farming and pay the difference only after seeing results!"
      }
    } else {
      recommendedPlan = idealPlan
    }

    // Apply special financing logic for flexible budget users
    if (budgetRange === "budget-flexible") {
      recommendedPlan = idealPlan
      if (idealPlan === "enterprise") {
        financingRecommendation = "Perfect! Start with $5/month and pay the rest from your 40% higher yields through our Pay-as-You-Harvest program."
      } else if (idealPlan === "professional") {
        financingRecommendation = "Great choice! Our Group Financing can get you AI-Powered Farming for just $15/month when you join with other farmers."
      }
    }

    // Downgrade for beginners if needed (avoid overwhelming them)
    if (techComfort === "beginner" && recommendedPlan === "enterprise") {
      recommendedPlan = "professional"
      financingRecommendation = "We're starting you with AI-Powered Farming to ensure a smooth learning experience. You can upgrade to Community Farming anytime!"
    }

    // Set plan-specific details
    if (recommendedPlan === "enterprise") {
      estimatedCost = "$500-800"
      setupComplexity = "comprehensive"
      setupTime = "1-2 days with technician"
    } else if (recommendedPlan === "professional") {
      estimatedCost = "$300-500"
      setupComplexity = "moderate"
      setupTime = "4-6 hours"
    } else {
      estimatedCost = "$150-250"
      setupComplexity = "simple"
      setupTime = "2-3 hours"
    }

    // Hardware recommendations based on current setup
    if (currentSetup === "no-system") {
      hardwareNeeds = ["Complete irrigation system", "Solar power kit", "Sensor network", "Control hub"]
      setupComplexity = "comprehensive"
      setupTime = "1-2 days with technician"
      // Increase cost for complete system
      if (recommendedPlan === "basic") estimatedCost = "$200-350"
      if (recommendedPlan === "professional") estimatedCost = "$400-600"
      if (recommendedPlan === "enterprise") estimatedCost = "$600-900"
    } else if (currentSetup === "basic-irrigation" || currentSetup === "manual-only") {
      hardwareNeeds = ["Smart controller hub", "Moisture sensors", "Valve automation", "Mobile connectivity"]
      setupComplexity = "moderate"
      setupTime = "4-6 hours"
    } else if (currentSetup === "advanced-system") {
      hardwareNeeds = ["Smart controller upgrade", "Sensor integration", "AI module"]
      setupComplexity = "simple"
      setupTime = "2-3 hours"
      // Reduce cost for upgrade only
      if (recommendedPlan === "basic") estimatedCost = "$100-200"
      if (recommendedPlan === "professional") estimatedCost = "$200-350"
      if (recommendedPlan === "enterprise") estimatedCost = "$350-500"
    }

    // Final adjustments for special cases
    if (farmingGoals === "complete-solution" && farmSize === "multiple-farms" && budgetRange === "budget-high") {
      recommendedPlan = "enterprise"
      estimatedCost = "$800-1200"
      setupComplexity = "comprehensive"
      setupTime = "2-3 days with technician team"
    }

    // Ensure we have a valid plan
    if (!["basic", "professional", "enterprise"].includes(recommendedPlan)) {
      recommendedPlan = "basic" // fallback
    }

    console.log("🎯 FINAL RECOMMENDATION:", {
      recommendedPlan,
      idealPlan,
      farmingGoals,
      farmSize,
      techComfort,
      budgetRange,
      budgetConstraint: idealPlan !== recommendedPlan && budgetRange !== "budget-flexible"
    })

    return {
      answers: userAnswers,
      recommendations: {
        plan: recommendedPlan,
        idealPlan: idealPlan !== recommendedPlan ? idealPlan : undefined,
        hardwareNeeds,
        setupComplexity,
        estimatedCost,
        setupTime,
        financingRecommendation,
        canAfford,
        budgetConstraint: idealPlan !== recommendedPlan && budgetRange !== "budget-flexible"
      }
    }
  }

  // Render questionnaire view
  if (currentView === "questionnaire") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 dark:from-green-950 dark:via-emerald-950 dark:to-blue-950">
        <LandingHeader onGetStarted={() => handleGetStarted("general")} />
        <div className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                Let's find the perfect solution for your farm
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Answer a few questions to get personalized recommendations
              </p>
            </div>
            <OnboardingQuestionnaire 
              onComplete={handleOnboardingComplete}
              prefilledData={getPrefilledData(onboardingContext)}
            />
          </div>
        </div>
        <MarketingFooter />
      </div>
    )
  }

  // Render contact form view
  if (currentView === "contact-form") {
    return (
      <ContactForm 
        selectedPlan={selectedPlan}
        onSubmit={handleContactFormSubmit}
        onCancel={handleContactFormCancel}
        recommendations={onboardingResults?.recommendations}
      />
    )
  }

  // Render success view
  if (currentView === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 dark:from-green-950 dark:via-emerald-950 dark:to-blue-950">
        <LandingHeader onGetStarted={() => handleGetStarted("general")} />
        <div className="pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="bg-white dark:bg-card rounded-2xl shadow-2xl p-12">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              
              <h1 className="text-4xl font-bold text-foreground mb-6">
                🎉 Application Submitted Successfully!
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8">
                Thank you, {contactFormData?.fullName}! Your application for the{" "}
                <span className="font-semibold text-green-600">
                  {selectedPlan === "basic" ? "Smart Irrigation" : 
                   selectedPlan === "professional" ? "AI-Powered Farming" : 
                   "Community Farming"}
                </span>{" "}
                plan has been received.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8 text-left">
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    1
                  </div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Contact Within 24 Hours</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Our agricultural specialist will call you at {contactFormData?.phone} to discuss your farm's specific needs.
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    2
                  </div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Free Farm Assessment</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    We'll visit your farm in {contactFormData?.farmLocation} to plan the perfect installation for your {contactFormData?.farmSize} {contactFormData?.farmSizeUnit}.
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    3
                  </div>
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Installation & Training</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Professional installation with hands-on training to ensure you get the most from your SaharaSprout system.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 mb-8">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">🚀 Start Preparing Your Farm</h3>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  While you wait for our call, here are some things you can do to prepare:
                </p>
                <ul className="text-left text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Clear any debris from your irrigation areas</li>
                  <li>• Make note of any specific problem areas in your farm</li>
                  <li>• Prepare a list of questions about your {contactFormData?.cropTypes}</li>
                  <li>• Think about your long-term farming goals</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setCurrentView("landing")}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3"
                >
                  Return to Homepage
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open(`mailto:${contactFormData?.email}?subject=SaharaSprout Application Confirmation&body=Thank you for your application! We'll be in touch soon.`, '_blank')}
                  className="px-8 py-3"
                >
                  Email Confirmation
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-muted-foreground">
                  Need immediate assistance? Contact us at{" "}
                  <a href="tel:+231777123456" className="text-green-600 hover:underline">
                    +231 777 123 456
                  </a>{" "}
                  or{" "}
                  <a href="mailto:support@saharasprout.com" className="text-green-600 hover:underline">
                    support@saharasprout.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <MarketingFooter />
      </div>
    )
  }

  const plans = [
    {
      id: "basic",
      name: "Smart Irrigation",
      monthlyPrice: 15,
      yearlyPrice: 150,
      description: "Perfect for small farms wanting water efficiency",
      features: [
        "Up to 3 hectares",
        "Smart irrigation control",
        "Moisture monitoring",
        "Weather integration", 
        "Mobile app access",
        "SMS alerts",
        "Basic analytics",
        "24/7 remote monitoring"
      ],
      popular: false,
      button: "bg-blue-600 hover:bg-blue-700"
    },
    {
      id: "professional", 
      name: "AI-Powered Farming",
      monthlyPrice: 25,
      yearlyPrice: 250,
      description: "Advanced farming with AI recommendations",
      features: [
        "Up to 10 hectares",
        "Everything in Basic",
        "NPK soil analysis",
        "AI crop recommendations",
        "Advanced analytics",
        "Web dashboard",
        "Priority support",
        "Yield predictions",
        "Market price alerts",
        "Pest detection AI"
      ],
      popular: true,
      button: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
    },
    {
      id: "cooperative",
      name: "Community Farming",
      monthlyPrice: 40,
      yearlyPrice: 400,
      description: "Perfect for cooperatives and farming communities",
      features: [
        "Unlimited farms",
        "Everything in Professional",
        "Marketplace access",
        "Community dashboard",
        "Bulk buying discounts",
        "Training programs",
        "Dedicated support",
        "Group financing options",
        "Knowledge sharing platform",
        "Cooperative management tools"
      ],
      popular: false,
      button: "bg-purple-600 hover:bg-purple-700"
    }
  ]

  const getPrice = (plan: typeof plans[0]) => {
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
    const savings = isYearly ? Math.round(((plan.monthlyPrice * 12) - plan.yearlyPrice) / (plan.monthlyPrice * 12) * 100) : 0
    return {
      amount: price,
      period: isYearly ? "/year" : "/month",
      savings: savings
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader onGetStarted={() => handleGetStarted("general")} />
      
      {/* Hero Section with Video Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-emerald-800 to-green-900 pt-20">
        {/* Background Image/Video Placeholder */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1560493676-04071c5f467b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')]"></div>
          {/* Animated Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-emerald-600/60 z-20"></div>
        </div>
        
        <div className="relative z-30 mx-auto max-w-7xl px-6 lg:px-8 py-32 sm:py-40">
          <div className="mx-auto max-w-4xl text-center">
            {/* Logo Animation */}
            <div className="flex items-center justify-center mb-8 animate-bounce">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
                <Sprout className="h-12 w-12 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-6xl font-bold tracking-tight text-white sm:text-8xl mb-8 animate-fade-in">
              Your Farm's
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Smart Future
              </span>
              <span className="block text-4xl sm:text-5xl mt-4 text-green-100">
                Starts Today
              </span>
            </h1>
            
            <p className="mt-8 text-2xl leading-relaxed text-green-50 max-w-3xl mx-auto">
              Watch your crops thrive with 40% less water, get AI recommendations that boost yields by 30%, 
              and sell directly to buyers at premium prices.
            </p>
            
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-6 text-xl rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 animate-pulse"
                onClick={() => handleGetStarted("general")}
              >
                🚀 Transform My Farm Now
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-12 py-6 text-xl rounded-full backdrop-blur-sm bg-white/10"
              >
                <Play className="mr-3 h-6 w-6" />
                See It In Action (2 min)
              </Button>
            </div>
            
            {/* Real-time Demo Stats */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="text-4xl font-bold text-yellow-400 mb-2 animate-count-up group-hover:scale-110 transition-transform duration-300">1,247</div>
                <div className="text-green-100 group-hover:text-white transition-colors duration-300">Active Farms</div>
                <div className="text-xs text-green-200 mt-1 group-hover:text-green-100 transition-colors duration-300">Growing daily</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="text-4xl font-bold text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">2.3M</div>
                <div className="text-green-100 group-hover:text-white transition-colors duration-300">Liters Saved</div>
                <div className="text-xs text-green-200 mt-1 group-hover:text-green-100 transition-colors duration-300">This month</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="text-4xl font-bold text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300">$180K</div>
                <div className="text-green-100 group-hover:text-white transition-colors duration-300">Extra Income</div>
                <div className="text-xs text-green-200 mt-1 group-hover:text-green-100 transition-colors duration-300">Generated</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="text-4xl font-bold text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-300">15</div>
                <div className="text-green-100 group-hover:text-white transition-colors duration-300">Countries</div>
                <div className="text-xs text-green-200 mt-1 group-hover:text-green-100 transition-colors duration-300">And expanding</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Transformation Section */}
      <section className="py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              See The Transformation
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real farms, real results. Here's what happens when farmers switch to SaharaSprout.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Before Image */}
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition-all duration-500"></div>
              <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl">
                <div className="bg-red-100 p-4 text-center group-hover:bg-red-200 transition-colors duration-300">
                  <span className="text-red-600 font-bold text-lg">BEFORE: Traditional Farming</span>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Traditional farming - dry, struggling crops"
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="p-6 bg-red-50 group-hover:bg-red-100 transition-colors duration-300">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="transform transition-transform duration-300 group-hover:scale-105">
                      <div className="text-2xl font-bold text-red-600">-30%</div>
                      <div className="text-sm text-gray-600">Lower Yields</div>
                    </div>
                    <div className="transform transition-transform duration-300 group-hover:scale-105">
                      <div className="text-2xl font-bold text-red-600">+60%</div>
                      <div className="text-sm text-gray-600">Water Waste</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center transform transition-transform duration-300 group-hover:scale-105">
                    <div className="text-lg font-medium text-red-700">$1,200/month income</div>
                  </div>
                </div>
              </div>
            </div>

            {/* After Image */}
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition-all duration-500"></div>
              <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl">
                <div className="bg-green-100 p-4 text-center group-hover:bg-green-200 transition-colors duration-300">
                  <span className="text-green-600 font-bold text-lg">AFTER: SaharaSprout Smart Farming</span>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Smart farming - lush, healthy crops with automated irrigation"
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="p-6 bg-green-50 group-hover:bg-green-100 transition-colors duration-300">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="transform transition-transform duration-300 group-hover:scale-105">
                      <div className="text-2xl font-bold text-green-600">+35%</div>
                      <div className="text-sm text-gray-600">Higher Yields</div>
                    </div>
                    <div className="transform transition-transform duration-300 group-hover:scale-105">
                      <div className="text-2xl font-bold text-green-600">-40%</div>
                      <div className="text-sm text-gray-600">Water Usage</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center transform transition-transform duration-300 group-hover:scale-105">
                    <div className="text-lg font-medium text-green-700">$2,100/month income</div>
                    <div className="text-sm text-green-600 font-medium">+75% increase!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Transformation Arrow */}
          <div className="flex justify-center mt-8">
            <div className="bg-gradient-to-r from-orange-500 to-green-500 rounded-full p-4 shadow-lg animate-bounce hover:animate-none hover:scale-110 hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <ArrowRight className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Interactive Steps */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              How SaharaSprout Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From installation to harvest - see exactly how our smart farming system transforms your operations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative group cursor-pointer">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 h-full hover:scale-105 transition-transform duration-500 hover:shadow-2xl">
                <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <div className="text-center mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1581093458791-9d42e0d5e6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Easy installation process"
                    className="w-full h-48 object-cover rounded-lg mb-4 transition-transform duration-500 group-hover:scale-110"
                  />
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-200 transition-colors duration-300">Easy Setup</h3>
                  <p className="text-blue-100 group-hover:text-white transition-colors duration-300">
                    Our team installs sensors and smart controllers on your farm. Solar-powered, works anywhere.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">2-hour installation</span>
                  </div>
                  <div className="flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300 delay-100">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">No electrical requirements</span>
                  </div>
                  <div className="flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300 delay-200">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Works offline</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group cursor-pointer">
              <div className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-2xl p-8 h-full hover:scale-105 transition-transform duration-500 hover:shadow-2xl">
                <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <div className="text-center mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Smart monitoring in action"
                    className="w-full h-48 object-cover rounded-lg mb-4 transition-transform duration-500 group-hover:scale-110"
                  />
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-green-200 transition-colors duration-300">Smart Monitoring</h3>
                  <p className="text-green-100 group-hover:text-white transition-colors duration-300">
                    AI analyzes soil, weather, and crop data 24/7. Get instant alerts and recommendations on your phone.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Real-time soil analysis</span>
                  </div>
                  <div className="flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300 delay-100">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Weather predictions</span>
                  </div>
                  <div className="flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300 delay-200">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Crop health tracking</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group cursor-pointer">
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 h-full hover:scale-105 transition-transform duration-500 hover:shadow-2xl">
                <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <div className="text-center mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1595273670150-bd0c3c392e1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Farmer celebrating increased profits"
                    className="w-full h-48 object-cover rounded-lg mb-4 transition-transform duration-500 group-hover:scale-110"
                  />
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-200 transition-colors duration-300">Higher Profits</h3>
                  <p className="text-purple-100 group-hover:text-white transition-colors duration-300">
                    Sell directly to buyers through our marketplace. Get premium prices with AI-generated professional photos.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Direct buyer connections</span>
                  </div>
                  <div className="flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300 delay-100">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Professional product photos</span>
                  </div>
                  <div className="flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300 delay-200">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">25% better prices</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50/50 to-indigo-100/50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              See It Working Live
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Watch a real SaharaSprout farm in action. This is happening right now in Mali.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Live Dashboard Mockup */}
            <div className="relative group">
              <div className="bg-white dark:bg-card rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 group-hover:shadow-3xl group-hover:scale-105">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg group-hover:scale-105 transition-transform duration-300">Amara's Farm - Mali</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse group-hover:scale-125 transition-transform duration-300"></div>
                      <span className="text-sm">Live</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg group-hover:scale-105 transition-transform duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="h-5 w-5 text-blue-600 group-hover:animate-pulse" />
                        <span className="font-medium">Soil Moisture</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">68%</div>
                      <div className="text-sm text-gray-600">Optimal range</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg group-hover:scale-105 transition-transform duration-300 delay-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-5 w-5 text-green-600 group-hover:animate-pulse" />
                        <span className="font-medium">Battery</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">94%</div>
                      <div className="text-sm text-gray-600">Solar charged</div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg group-hover:scale-105 transition-transform duration-300 delay-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-5 w-5 text-yellow-600 group-hover:animate-pulse" />
                      <span className="font-medium">AI Recommendation</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      "Rainfall expected tomorrow. Reduce irrigation by 30% for tomato zones."
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4 bg-white dark:bg-card rounded-xl shadow-lg p-4 animate-bounce hover:animate-none hover:scale-110 transition-all duration-300">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">+$320</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">This week</div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-card rounded-xl shadow-lg p-4 animate-pulse hover:animate-none hover:scale-110 transition-all duration-300">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">-2,400L</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Water saved</div>
                </div>
              </div>
            </div>
            
            {/* Live Stats */}
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  Real Impact, Real Time
                </h3>
                <p className="text-lg text-foreground/80 mb-6">
                  This data is streaming live from Amara's 3-hectare tomato farm in Mali. 
                  See how SaharaSprout is helping her save water and increase profits.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">35% Yield Increase</div>
                    <div className="text-foreground/70">Since installing SaharaSprout 6 months ago</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                    <Droplets className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">40% Water Savings</div>
                    <div className="text-foreground/70">Equivalent to 15,000 liters per week</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">+$1,800 Monthly Income</div>
                    <div className="text-foreground/70">Through marketplace sales and efficiency</div>
                  </div>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                onClick={() => handleGetStarted("general")}
              >
                Get Your Live Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories with Photos */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              Farmers Love SaharaSprout
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Meet the farmers who transformed their lives with smart agriculture
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Success Story 1 */}
            <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer group hover:scale-105">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Amara with her thriving tomato crops"
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium group-hover:scale-110 transition-transform duration-300">
                  6 Months with SaharaSprout
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4 group-hover:scale-105 transition-transform duration-300">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400 group-hover:animate-pulse" />
                  ))}
                </div>
                <blockquote className="text-muted-foreground mb-4 italic group-hover:text-foreground transition-colors duration-300">
                  "My tomato yield increased by 40% and I'm selling directly to restaurants in Bamako. 
                  SaharaSprout paid for itself in 4 months!"
                </blockquote>
                <div className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-green-600 dark:text-green-400 font-bold">AD</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Amara Diallo</div>
                    <div className="text-muted-foreground">Tomato Farmer, Mali</div>
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">Income: +75%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Story 2 */}
            <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer group hover:scale-105">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1566281796817-81e95551a22b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Kwame in his pepper fields"
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium group-hover:scale-110 transition-transform duration-300">
                  1 Year with SaharaSprout
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4 group-hover:scale-105 transition-transform duration-300">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400 group-hover:animate-pulse" />
                  ))}
                </div>
                <blockquote className="text-muted-foreground mb-4 italic group-hover:text-foreground transition-colors duration-300">
                  "The AI told me exactly when to plant and harvest. Now I have buyers lined up 
                  waiting for my peppers. Amazing technology!"
                </blockquote>
                <div className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">KA</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Kwame Asante</div>
                    <div className="text-muted-foreground">Pepper Farmer, Ghana</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Income: +120%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Story 3 */}
            <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer group hover:scale-105">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1594736797933-d0b5b5ee80b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Fatou at her cooperative farm"
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium group-hover:scale-110 transition-transform duration-300">
                  2 Years with SaharaSprout
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4 group-hover:scale-105 transition-transform duration-300">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400 group-hover:animate-pulse" />
                  ))}
                </div>
                <blockquote className="text-muted-foreground mb-4 italic group-hover:text-foreground transition-colors duration-300">
                  "Our women's cooperative now manages 50 hectares with SaharaSprout. 
                  We're teaching other communities how to use it!"
                </blockquote>
                <div className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">FK</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Fatou Kone</div>
                    <div className="text-muted-foreground">Cooperative Leader, Burkina Faso</div>
                    <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Community Impact: 200 families</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Video Testimonials CTA */}
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-gray-300 hover:border-green-600 hover:text-green-600"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Video Testimonials
            </Button>
          </div>
        </div>
      </section>

      {/* Financing Options Section */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Flexible Financing for Every Farmer
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              We understand that cash flow can be tight, especially when starting your smart farming journey. 
              That's why we offer multiple ways to get started - even if your farm hasn't begun generating extra income yet.
            </p>
          </div>
          
          {/* Financing Options Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {/* Pay-as-You-Harvest */}
            <div className="bg-white dark:bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer border-2 border-green-200 dark:border-green-800">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sprout className="h-8 w-8 text-green-600 dark:text-green-400 group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-green-600 transition-colors duration-300">Pay-as-You-Harvest</h3>
              <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 mb-4">
                Start with just $5/month. Pay the remaining balance from your increased harvest profits.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-sm text-green-700 dark:text-green-300">
                  <div className="font-medium">Example: Professional Plan</div>
                  <div>• Start: $5/month</div>
                  <div>• Pay remaining $20 from harvest profits</div>
                  <div>• Total: $25/month (same as regular)</div>
                </div>
              </div>
            </div>

            {/* Cooperative Financing */}
            <div className="bg-white dark:bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer border-2 border-blue-200 dark:border-blue-800">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-blue-600 transition-colors duration-300">Group Financing</h3>
              <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 mb-4">
                Join with 5+ farmers in your area. Share costs and get group discounts.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <div className="font-medium">Group Benefits</div>
                  <div>• 30% discount on all plans</div>
                  <div>• Shared installation costs</div>
                  <div>• Community support & training</div>
                </div>
              </div>
            </div>

            {/* Equipment Financing */}
            <div className="bg-white dark:bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer border-2 border-purple-200 dark:border-purple-800">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400 group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-purple-600 transition-colors duration-300">6-Month Trial</h3>
              <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 mb-4">
                Try SaharaSprout for 6 months. If you don't see 25% yield increase, we'll refund the difference.
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-sm text-purple-700 dark:text-purple-300">
                  <div className="font-medium">Risk-Free Trial</div>
                  <div>• 6 months to prove ROI</div>
                  <div>• Money-back guarantee</div>
                  <div>• Free technical support</div>
                </div>
              </div>
            </div>
          </div>

          {/* Success Promise */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Technology That Pays For Itself
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              We believe smart farming shouldn't drain your resources. Our pricing is designed specifically 
              for African farmers - affordable monthly costs that quickly pay for themselves through increased yields and water savings.
            </p>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center bg-white dark:bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-green-600 transition-colors duration-300">Pay As You Grow</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">Start with basic irrigation for just $15/month. Upgrade when you're ready for AI features.</p>
              </div>
              <div className="text-center bg-white dark:bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-blue-600 transition-colors duration-300">ROI in 4 Months</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">Typical farmers see 35% yield increases and 40% water savings. System pays for itself quickly.</p>
              </div>
              <div className="text-center bg-white dark:bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-purple-600 dark:text-purple-400 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-purple-600 transition-colors duration-300">Community Discounts</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">Join cooperatives for group pricing and shared resources. Stronger together.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-foreground mb-6">
              Everything You Need to Transform Your Farm
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From smart irrigation to AI recommendations and marketplace access - 
              all the tools you need to increase yields and boost profits.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Smart Irrigation */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors duration-300">Smart Irrigation Control</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 mb-4">
                  Automatic watering based on soil moisture, weather forecasts, and crop needs. 
                  Save up to 40% on water usage while improving crop health.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full group-hover:border-blue-600 group-hover:text-blue-600"
                  onClick={() => handleGetStarted("water-efficiency")}
                >
                  Get Started with Smart Irrigation
                </Button>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-6 w-6 text-green-600 dark:text-green-400 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-green-600 transition-colors duration-300">AI Crop Recommendations</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 mb-4">
                  Get personalized advice on planting, fertilizing, and harvesting times. 
                  AI analyzes your soil, climate, and market conditions to maximize yields.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full group-hover:border-green-600 group-hover:text-green-600"
                  onClick={() => handleGetStarted("ai-farming")}
                >
                  Get Started with AI Farming
                </Button>
              </CardContent>
            </Card>

            {/* Marketplace Access */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="h-6 w-6 text-purple-600 dark:text-purple-400 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-purple-600 transition-colors duration-300">Direct Market Access</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 mb-4">
                  Connect directly with buyers and restaurants. Skip middlemen and get 
                  up to 25% better prices for your high-quality crops.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full group-hover:border-purple-600 group-hover:text-purple-600"
                  onClick={() => handleGetStarted("marketplace")}
                >
                  Get Started with Marketplace
                </Button>
              </CardContent>
            </Card>

            {/* Mobile App */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="h-6 w-6 text-orange-600 dark:text-orange-400 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-orange-600 transition-colors duration-300">Mobile App Control</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 mb-4">
                  Monitor and control your farm from anywhere. Get instant alerts, 
                  view analytics, and manage irrigation remotely via SMS or app.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full group-hover:border-orange-600 group-hover:text-orange-600"
                  onClick={() => handleGetStarted("features")}
                >
                  Get Started with Mobile Control
                </Button>
              </CardContent>
            </Card>

            {/* Weather Integration */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-6 w-6 text-cyan-600 dark:text-cyan-400 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-cyan-600 transition-colors duration-300">Weather Intelligence</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 mb-4">
                  Advanced weather forecasting and climate monitoring. Plan irrigation 
                  schedules around rainfall and temperature changes.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full group-hover:border-cyan-600 group-hover:text-cyan-600"
                  onClick={() => handleGetStarted("features")}
                >
                  Get Started with Weather AI
                </Button>
              </CardContent>
            </Card>

            {/* Solar Powered */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-yellow-600 transition-colors duration-300">Solar Powered System</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 mb-4">
                  Completely off-grid operation with solar power. No electricity bills, 
                  works anywhere in Africa, even in remote locations.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full group-hover:border-yellow-600 group-hover:text-yellow-600"
                  onClick={() => handleGetStarted("features")}
                >
                  Get Started with Solar Power
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Affordable pricing for African farmers
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Smart irrigation technology that pays for itself. Designed to help small-scale farmers succeed.
            </p>
            
            {/* Billing Toggle */}
            <div className="mt-8 flex items-center justify-center">
              <div className="flex items-center bg-muted rounded-lg p-1">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    !isYearly 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    isYearly 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Yearly
                  <span className="ml-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 gap-x-8">
            {plans.map((plan) => {
              const pricing = getPrice(plan)
              return (
                <Card 
                  key={plan.id} 
                  className={`relative bg-card border-border group cursor-pointer transform transition-all duration-500 ${
                    plan.popular ? 'ring-2 ring-green-600 scale-105 shadow-xl hover:scale-110' : 'shadow-lg hover:scale-105'
                  } hover:shadow-2xl hover:-translate-y-2`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white group-hover:scale-110 transition-transform duration-300">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold text-foreground group-hover:text-green-600 transition-colors duration-300">{plan.name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold tracking-tight text-foreground group-hover:scale-110 transition-transform duration-300">
                          ${pricing.amount}
                        </span>
                        <span className="text-lg font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">{pricing.period}</span>
                      </div>
                      {isYearly && pricing.savings > 0 && (
                        <div className="mt-1">
                          <span className="text-sm text-green-600 dark:text-green-400 font-medium group-hover:animate-pulse">
                            Save {pricing.savings}% vs monthly
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 group-hover:scale-125 group-hover:animate-pulse transition-all duration-300" />
                          <span className="text-sm text-foreground group-hover:text-green-600 transition-colors duration-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${plan.button} text-white group-hover:scale-105 transition-transform duration-300 group-hover:shadow-lg mb-3`}
                      onClick={() => handleGetStarted("general", plan.id)}
                    >
                      Get Started
                    </Button>
                    <div className="text-center">
                      <button 
                        className="text-xs text-muted-foreground hover:text-green-600 transition-colors duration-300 underline"
                        onClick={() => setShowFinancingOptions(!showFinancingOptions)}
                      >
                        💰 Need financing? See flexible options
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Financing Options - Show conditionally */}
      {showFinancingOptions && (
        <section className="py-16 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-t-2 border-green-200 dark:border-green-800">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                💰 Flexible Financing Options
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
                We understand that cash flow can be tight, especially when starting your smart farming journey. 
                That's why we offer multiple ways to get started - even if your farm hasn't begun generating extra income yet.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setShowFinancingOptions(false)}
                className="mb-8"
              >
                Hide Options
              </Button>
            </div>
            
            {/* Financing Options Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
              {/* Pay-as-You-Harvest */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Sprout className="h-8 w-8 text-green-600 dark:text-green-400 group-hover:animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-green-600 transition-colors duration-300">Pay-as-You-Harvest</h3>
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 mb-4">
                    Start with just $5/month. Pay the remaining balance from your increased harvest profits.
                  </p>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-sm text-green-700 dark:text-green-300">
                      <div className="font-medium">Example: Professional Plan</div>
                      <div>• Start: $5/month</div>
                      <div>• Pay remaining $20 from harvest profits</div>
                      <div>• Total: $25/month (same as regular)</div>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    onClick={() => handleGetStarted("financing")}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>

              {/* Group Financing */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-blue-600 transition-colors duration-300">Group Financing</h3>
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 mb-4">
                    Join with 5+ farmers in your area. Share costs and get group discounts.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <div className="font-medium">Group Benefits</div>
                      <div>• 30% discount on all plans</div>
                      <div>• Shared installation costs</div>
                      <div>• Community support & training</div>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleGetStarted("financing")}
                  >
                    Find Groups
                  </Button>
                </CardContent>
              </Card>

              {/* Risk-Free Trial */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400 group-hover:animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-purple-600 transition-colors duration-300">6-Month Risk-Free Trial</h3>
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 mb-4">
                    Try SaharaSprout for 6 months. If you don't see 25% yield increase, we'll refund the difference.
                  </p>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      <div className="font-medium">Money-Back Guarantee</div>
                      <div>• 6 months to prove ROI</div>
                      <div>• Full refund if no 25% yield increase</div>
                      <div>• Free technical support included</div>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleGetStarted("financing")}
                  >
                    Start Trial
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Success Promise */}
            <div className="text-center">
              <div className="bg-white dark:bg-card rounded-xl p-8 shadow-lg max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  🌱 Technology That Pays For Itself
                </h3>
                <p className="text-muted-foreground mb-6">
                  Our pricing is designed specifically for African farmers - affordable monthly costs 
                  that quickly pay for themselves through increased yields and water savings.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">4 Months</div>
                    <div className="text-sm text-muted-foreground">Average ROI Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">35%</div>
                    <div className="text-sm text-muted-foreground">Typical Yield Increase</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">40%</div>
                    <div className="text-sm text-muted-foreground">Water Savings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to transform your farm?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-green-100">
              Join thousands of farmers already using SaharaSprout to increase yields, 
              save water, and boost profits.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button 
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-50 px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                onClick={() => handleGetStarted("general")}
              >
                Start Free Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 text-lg rounded-full"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-foreground mb-6">
                Empowering African Farmers with Smart Technology
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                SaharaSprout was founded with a simple mission: to help African farmers increase their yields, 
                reduce water usage, and access better markets using affordable smart farming technology.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Our team of agricultural engineers and AI specialists has worked directly with farmers across 
                15 African countries to develop solutions that work in real-world conditions - from remote villages 
                to commercial operations.
              </p>
              <div className="grid grid-cols-2 gap-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">1,247</div>
                  <div className="text-muted-foreground">Active Farms</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">15</div>
                  <div className="text-muted-foreground">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">$2.3M</div>
                  <div className="text-muted-foreground">Extra Income Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">40%</div>
                  <div className="text-muted-foreground">Average Water Savings</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1594736797933-d0b5b5ee80b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="African farmers using SaharaSprout technology"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-card rounded-xl shadow-lg p-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">Founded 2025</div>
                  <div className="text-sm text-muted-foreground">Monrovia, Liberia</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mission Statement */}
          <div className="mt-20 text-center max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-foreground mb-6">Our Mission</h3>
            <p className="text-xl text-muted-foreground leading-relaxed">
              "To democratize smart farming technology across Africa, making it affordable and accessible 
              for every farmer - from smallholder operations to large cooperatives. We believe that with 
              the right tools, African agriculture can feed the continent and the world."
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Badge variant="outline" className="text-sm px-4 py-2">Climate Resilient</Badge>
              <Badge variant="outline" className="text-sm px-4 py-2">Farmer-First Design</Badge>
              <Badge variant="outline" className="text-sm px-4 py-2">Local Support</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-foreground mb-6">
              Get in Touch
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ready to transform your farm? Have questions? Our team is here to help you 
              every step of the way.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Contact Methods */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="h-8 w-8 text-green-600 dark:text-green-400 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-green-600 transition-colors duration-300">WhatsApp Support</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 mb-4">
                  Get instant help from our agricultural specialists
                </p>
                <Button variant="outline" className="group-hover:border-green-600 group-hover:text-green-600">
                  +231 777 123 456
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors duration-300">Visit Our Office</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 mb-4">
                  Liberia Innovation Hub<br />
                  Broad Street, Monrovia, Liberia
                </p>
                <Button variant="outline" className="group-hover:border-blue-600 group-hover:text-blue-600">
                  Get Directions
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-purple-600 dark:text-purple-400 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-purple-600 transition-colors duration-300">Schedule Demo</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 mb-4">
                  See SaharaSprout in action at your farm
                </p>
                <Button 
                  variant="outline" 
                  className="group-hover:border-purple-600 group-hover:text-purple-600"
                  onClick={() => handleGetStarted("general")}
                >
                  Book Visit
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Regional Offices */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center text-foreground mb-8">Regional Support</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <h4 className="font-semibold text-foreground mb-2">West Africa HQ</h4>
                <p className="text-sm text-muted-foreground">Liberia, Sierra Leone, Guinea</p>
                <p className="text-sm text-green-600 font-medium">+231 777 123 456</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-foreground mb-2">East Africa</h4>
                <p className="text-sm text-muted-foreground">Kenya, Tanzania, Uganda</p>
                <p className="text-sm text-green-600 font-medium">+254 700 123 456</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-foreground mb-2">West Africa</h4>
                <p className="text-sm text-muted-foreground">Ghana, Mali, Burkina Faso</p>
                <p className="text-sm text-green-600 font-medium">+233 20 123 4567</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-foreground mb-2">Central Africa</h4>
                <p className="text-sm text-muted-foreground">Cameroon, Chad</p>
                <p className="text-sm text-green-600 font-medium">+237 6 123 45678</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
