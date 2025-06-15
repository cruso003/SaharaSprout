"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, Zap, Droplets, Brain, Users, Star, TrendingUp, DollarSign, Clock, Lightbulb, Shield, Sparkles, Target, Award, Check } from "lucide-react"

interface OnboardingRecommendationsProps {
  results: {
    answers: Record<string, string>
    recommendations: {
      plan: string
      idealPlan?: string
      hardwareNeeds: string[]
      setupComplexity: string
      estimatedCost: string
      setupTime: string
      financingRecommendation?: string
      canAfford?: boolean
      budgetConstraint?: boolean
    }
  }
  onProceed: (selectedPlan?: string) => void
}

export function OnboardingRecommendations({ results, onProceed }: OnboardingRecommendationsProps) {
  const { answers, recommendations } = results
  const [selectedPlan, setSelectedPlan] = useState(recommendations.plan)
  const [showAllPlans, setShowAllPlans] = useState(false)
  
  const planDetails = {
    basic: {
      name: "Smart Irrigation",
      description: "Perfect for small farms wanting water efficiency",
      monthlyPrice: 15,
      yearlyPrice: 150,
      color: "blue",
      icon: Droplets,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50",
      features: [
        "Up to 3 hectares",
        "Smart irrigation control", 
        "Moisture monitoring",
        "Weather integration",
        "Mobile app access",
        "SMS alerts",
        "Basic analytics",
        "24/7 remote monitoring"
      ]
    },
    professional: {
      name: "AI-Powered Farming", 
      description: "Advanced farming with AI recommendations",
      monthlyPrice: 25,
      yearlyPrice: 250,
      color: "green",
      icon: Brain,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50",
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
      ]
    },
    enterprise: {
      name: "Community Farming",
      description: "Perfect for cooperatives and farming communities", 
      monthlyPrice: 40,
      yearlyPrice: 400,
      color: "purple",
      icon: Users,
      gradient: "from-purple-500 to-violet-500",
      bgGradient: "from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50",
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
      ]
    }
  }

  const plan = planDetails[recommendations.plan as keyof typeof planDetails] || planDetails.basic
  const PlanIcon = plan.icon

  const getInsightFromAnswers = () => {
    const insights = []
    
    // Extract answers from the results object
    const userAnswers = results?.answers || {}
    
    console.log("🔍 Recommendations - User answers:", userAnswers)
    console.log("🔍 Recommendations - Available keys:", Object.keys(userAnswers))
    
    // Check farming goals
    const farmingGoals = userAnswers["farming-goals"]
    if (farmingGoals === "water-efficiency") {
      insights.push("💧 Water conservation is your priority - this plan will reduce water usage by 40%")
    } else if (farmingGoals === "yield-increase") {
      insights.push("🌱 AI recommendations will help boost your yields by 30-35%")
    } else if (farmingGoals === "market-access") {
      insights.push("🏪 Direct marketplace access will increase your profits by 25%")
    } else if (farmingGoals === "complete-solution") {
      insights.push("🚀 Complete farming transformation with all advanced features")
    }
    
    // Check farm size
    const farmSize = userAnswers["farm-size"]
    if (farmSize === "small") {
      insights.push("🏡 Perfect sizing for small farms - cost-effective and easy to manage")
    } else if (farmSize === "medium") {
      insights.push("🏢 Ideal for medium farms with room to grow and expand")
    } else if (farmSize === "large-farm") {
      insights.push("🏭 Optimized for large-scale operations with advanced monitoring")
    } else if (farmSize === "multiple-farms") {
      insights.push("🌍 Multi-farm management with centralized control and analytics")
    }
    
    // Check current setup
    const currentSetup = userAnswers["current-setup"]
    if (currentSetup === "no-system") {
      insights.push("🛠️ Complete system included - everything you need to get started")
    } else if (currentSetup === "basic-irrigation") {
      insights.push("⬆️ Smart upgrade to your existing irrigation with minimal disruption")
    } else if (currentSetup === "manual-only") {
      insights.push("🤖 Automated control will save you hours of manual work daily")
    } else if (currentSetup === "advanced-system") {
      insights.push("✨ Enhanced AI features will supercharge your existing setup")
    }
    
    // Check technical comfort
    const techComfort = userAnswers["technical-comfort"]
    if (techComfort === "beginner") {
      insights.push("👨‍🏫 Designed for beginners - simple setup with full training included")
    } else if (techComfort === "intermediate") {
      insights.push("⚙️ Perfect balance of features and ease-of-use for your skill level")
    } else if (techComfort === "advanced") {
      insights.push("🔧 Advanced features and customization options for tech-savvy farmers")
    }
    
    // Check budget considerations
    const budgetRange = userAnswers["budget-range"]
    if (budgetRange === "budget-low") {
      insights.push("💰 Budget-friendly option that delivers maximum value for your investment")
    } else if (budgetRange === "budget-flexible") {
      insights.push("💳 Flexible payment options available to fit your cash flow")
    } else if (budgetRange === "budget-high") {
      insights.push("🏆 Premium features justified by rapid ROI and superior results")
    }
    
    // Add plan-specific insights
    if (recommendations.plan === "basic") {
      insights.push("🎯 Foundation plan that covers all essential smart irrigation needs")
    } else if (recommendations.plan === "professional") {
      insights.push("🧠 AI-powered insights will optimize every aspect of your farming")
    } else if (recommendations.plan === "enterprise") {
      insights.push("🏘️ Community features enable knowledge sharing and group benefits")
    }
    
    // Add budget constraint insight if applicable
    if (recommendations.budgetConstraint && recommendations.idealPlan) {
      insights.push("📈 You can upgrade to your ideal plan anytime as your farm grows")
    }
    
    // If no specific insights, add default ones
    if (insights.length === 0) {
      insights.push("✅ This plan is recommended based on your farming goals and setup")
      insights.push("📊 Proven to deliver results for farmers with similar needs")
      insights.push("🔄 Easy to upgrade or modify as your requirements change")
    }
    
    return insights
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 dark:from-green-950 dark:via-emerald-950 dark:to-blue-950">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Animated Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce hover:animate-none hover:scale-110 transition-all duration-300">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Perfect Match Found!
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Based on your answers, we've crafted the ideal SaharaSprout solution to 
              <span className="font-semibold text-green-600 dark:text-green-400"> transform your farm</span> and 
              <span className="font-semibold text-blue-600 dark:text-blue-400"> boost your profits</span>.
            </p>
          </div>

          {/* Why This Plan Section */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              {/* Recommended Plan Card */}
              <Card className={`relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br ${plan.bgGradient} hover:scale-105 transition-all duration-500 group`}>
                {/* Gradient Border Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-10 animate-pulse"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-green-400 to-blue-400 rounded-full opacity-5 animate-pulse delay-1000"></div>
                
                <CardHeader className="text-center pb-6 relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Badge className={`bg-gradient-to-r ${plan.gradient} text-white border-0 px-4 py-2 shadow-lg animate-pulse hover:animate-none hover:scale-110 transition-all duration-300`}>
                      <Award className="h-4 w-4 mr-2" />
                      Recommended for You
                    </Badge>
                  </div>
                  
                  <div className={`w-20 h-20 bg-gradient-to-r ${plan.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <PlanIcon className="h-10 w-10 text-white" />
                  </div>
                  
                  <CardTitle className="text-4xl font-bold mb-3 group-hover:scale-105 transition-transform duration-300">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-6 group-hover:scale-105 transition-transform duration-300">
                    <div className="text-5xl font-bold">
                      <span className="text-3xl text-muted-foreground">$</span>
                      <span className={`bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                        {plan.monthlyPrice}
                      </span>
                      <span className="text-xl text-muted-foreground">/month</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Badge variant="outline" className="border-green-600 text-green-600 dark:border-green-400 dark:text-green-400">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Save $30/year
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10">
                  {/* Features Grid */}
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                      <h4 className="font-bold text-lg flex items-center gap-2 group-hover:scale-105 transition-transform duration-300">
                        <Star className="h-5 w-5 text-yellow-500" />
                        What's Included
                      </h4>
                      <div className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <div 
                            key={index} 
                            className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300 hover:scale-105"
                          >
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Expected Results */}
                      <div className="bg-white/60 dark:bg-black/30 backdrop-blur-sm rounded-xl p-6 hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-300 hover:scale-105">
                        <h5 className="font-bold text-lg mb-4 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                          Expected Results
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                            <span className="text-sm font-medium">Yield Increase:</span>
                            <Badge className="bg-green-600 text-white">+35%</Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <span className="text-sm font-medium">Water Savings:</span>
                            <Badge className="bg-blue-600 text-white">-40%</Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                            <span className="text-sm font-medium">ROI Timeline:</span>
                            <Badge className="bg-purple-600 text-white">4-6 months</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Setup Details */}
                      <div className="bg-white/60 dark:bg-black/30 backdrop-blur-sm rounded-xl p-6 hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-300 hover:scale-105">
                        <h5 className="font-bold text-lg mb-4 flex items-center gap-2">
                          <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          Setup Details
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Installation:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">{recommendations.setupTime}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Complexity:</span>
                            <Badge variant="outline" className="capitalize">{recommendations.setupComplexity}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Total Cost:</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">{recommendations.estimatedCost}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    <Button 
                      className={`w-full h-14 text-lg font-bold bg-gradient-to-r ${plan.gradient} hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 text-white`}
                      onClick={() => onProceed(selectedPlan)}
                    >
                      <Sparkles className="mr-3 h-5 w-5" />
                      Start with {planDetails[selectedPlan as keyof typeof planDetails]?.name || plan.name}
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </Button>
                    
                    {!showAllPlans && (
                      <Button 
                        variant="outline" 
                        className="w-full h-12 text-base border-2 hover:scale-105 transition-all duration-300"
                        onClick={() => setShowAllPlans(true)}
                      >
                        Or choose a different plan
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Why This Plan Sidebar */}
            <div className="space-y-6">
              {/* Budget Constraint Alert */}
              {recommendations.budgetConstraint && recommendations.idealPlan && (
                <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800 hover:scale-105 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      Budget Optimization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                        <p className="text-sm mb-2">
                          <strong>Your ideal plan:</strong> {planDetails[recommendations.idealPlan as keyof typeof planDetails]?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          We've recommended {plan.name} to fit your budget, but you can upgrade anytime or explore our financing options below.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Financing Options */}
              {recommendations.financingRecommendation && (
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 hover:scale-105 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Flexible Financing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {recommendations.financingRecommendation}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950/20"
                      onClick={() => {
                        // Open financing options in a new tab
                        const financingUrl = '/financing'
                        if (window.open(financingUrl, '_blank')) {
                          // Successfully opened in new tab
                        } else {
                          // Fallback to same window if popup blocked
                          window.location.href = financingUrl
                        }
                      }}
                    >
                      Explore Financing Options
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800 hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    Why This Plan?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getInsightFromAnswers().map((insight, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-white/60 dark:bg-black/20 rounded-lg hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-300">
                        <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{insight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Your Guarantee
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium">30-day money back</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium">Free installation & training</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium">24/7 technical support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* All Plans Selection - Show when user wants to see other options */}
          {showAllPlans && (
            <div className="mb-12">
              <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold mb-4">Choose Your Perfect Plan</CardTitle>
                  <CardDescription className="text-lg">
                    Compare all our plans and select the one that fits your needs best
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {Object.entries(planDetails).map(([planKey, planInfo]) => {
                      const PlanIcon = planInfo.icon
                      const isRecommended = planKey === recommendations.plan
                      const isSelected = planKey === selectedPlan
                      
                      return (
                        <Card 
                          key={planKey}
                          className={`relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 ${
                            isSelected 
                              ? `border-${planInfo.color}-500 dark:border-${planInfo.color}-400 shadow-lg` 
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          } ${isRecommended ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''}`}
                          onClick={() => setSelectedPlan(planKey)}
                        >
                          {isRecommended && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-3 py-1 shadow-lg">
                                <Award className="h-3 w-3 mr-1" />
                                Recommended
                              </Badge>
                            </div>
                          )}
                          
                          {isSelected && (
                            <div className="absolute -top-3 -right-3">
                              <div className={`w-8 h-8 bg-gradient-to-r ${planInfo.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          )}
                          
                          <CardHeader className="text-center pb-4">
                            <div className={`w-16 h-16 bg-gradient-to-r ${planInfo.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg hover:scale-110 transition-transform duration-300`}>
                              <PlanIcon className="h-8 w-8 text-white" />
                            </div>
                            
                            <CardTitle className="text-2xl font-bold mb-2">{planInfo.name}</CardTitle>
                            <CardDescription className="text-sm mb-4">{planInfo.description}</CardDescription>
                            
                            <div className="text-center">
                              <div className="text-3xl font-bold">
                                <span className="text-lg text-muted-foreground">$</span>
                                <span className={`bg-gradient-to-r ${planInfo.gradient} bg-clip-text text-transparent`}>
                                  {planInfo.monthlyPrice}
                                </span>
                                <span className="text-base text-muted-foreground">/month</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                or ${planInfo.yearlyPrice}/year (save 17%)
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent>
                            <div className="space-y-2 mb-6">
                              {planInfo.features.slice(0, 4).map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                              {planInfo.features.length > 4 && (
                                <div className="text-sm text-muted-foreground font-medium">
                                  +{planInfo.features.length - 4} more features
                                </div>
                              )}
                            </div>
                            
                            <Button 
                              className={`w-full ${
                                isSelected 
                                  ? `bg-gradient-to-r ${planInfo.gradient} text-white hover:shadow-lg` 
                                  : 'variant-outline'
                              } transition-all duration-300 hover:scale-105`}
                              variant={isSelected ? "default" : "outline"}
                              onClick={() => setSelectedPlan(planKey)}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  Selected
                                </>
                              ) : (
                                'Select Plan'
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                  
                  <div className="text-center mt-8">
                    <Button 
                      size="lg"
                      className={`px-12 py-6 text-lg font-bold bg-gradient-to-r ${planDetails[selectedPlan as keyof typeof planDetails]?.gradient || plan.gradient} hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 text-white`}
                      onClick={() => onProceed(selectedPlan)}
                    >
                      <Sparkles className="mr-3 h-5 w-5" />
                      Get Started with {planDetails[selectedPlan as keyof typeof planDetails]?.name || plan.name}
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Hardware Requirements Section */}
          <Card className="mb-8 bg-white/80 dark:bg-card/80 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Hardware & Setup Requirements
              </CardTitle>
              <CardDescription className="text-center text-lg">
                Everything you need to get started with your smart farming system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Hardware Package
                  </h4>
                  <div className="space-y-3">
                    {recommendations.hardwareNeeds.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-300">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Installation Details
                  </h4>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-xl">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Setup Time:</span>
                        <Badge className="bg-green-600 text-white">{recommendations.setupTime}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Complexity:</span>
                        <Badge variant="outline" className="capitalize">{recommendations.setupComplexity}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Investment:</span>
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">{recommendations.estimatedCost}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Payback Period:</span>
                        <Badge className="bg-blue-600 text-white">4-6 months</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Stories & Social Proof */}
          <Card className="mb-8 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Farmers Like You Are Already Succeeding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white/60 dark:bg-black/20 rounded-xl hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">87%</span>
                  </div>
                  <h4 className="font-bold mb-2">Higher Yields</h4>
                  <p className="text-sm text-muted-foreground">Average yield increase in first season</p>
                </div>
                
                <div className="text-center p-6 bg-white/60 dark:bg-black/20 rounded-xl hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,247</span>
                  </div>
                  <h4 className="font-bold mb-2">Happy Farmers</h4>
                  <p className="text-sm text-muted-foreground">Using SaharaSprout across Africa</p>
                </div>
                
                <div className="text-center p-6 bg-white/60 dark:bg-black/20 rounded-xl hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">4.9</span>
                  </div>
                  <h4 className="font-bold mb-2">Star Rating</h4>
                  <p className="text-sm text-muted-foreground">Average farmer satisfaction score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Final CTA */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Farm?</h2>
                <p className="text-xl mb-8 text-green-50">
                  Join thousands of farmers already using SaharaSprout to increase yields and profits.
                </p>
                
                <Button 
                  size="lg" 
                  className="bg-white text-green-600 hover:bg-gray-50 dark:bg-gray-100 dark:text-green-600 dark:hover:bg-white py-6 px-12 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" 
                  onClick={() => onProceed(selectedPlan)}
                >
                  <Sparkles className="mr-2 h-6 w-6" />
                  Get Started with {planDetails[selectedPlan as keyof typeof planDetails]?.name || plan.name}
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
                
                <div className="flex items-center justify-center gap-8 mt-8 text-green-50">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <span className="text-sm">30-day guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    <span className="text-sm">Free installation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    <span className="text-sm">24/7 support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
