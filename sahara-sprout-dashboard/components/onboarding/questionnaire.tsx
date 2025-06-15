"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Droplets,
  Sprout,
  ShoppingCart,
  Wrench,
  MapPin,
  Users,
  Smartphone,
  BarChart3,
  Globe,
  Zap,
  DollarSign,
  TrendingUp,
  Star
} from "lucide-react"

interface OnboardingStep {
  id: string
  title: string
  description: string
  question: string
  options: {
    id: string
    title: string
    description: string
    icon: any
    value: string
    color: string
  }[]
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "farming-goals",
    title: "What are your main farming goals?",
    description: "Help us understand what you want to achieve with SaharaSprout",
    question: "Select your primary objective:",
    options: [
      {
        id: "water-efficiency",
        title: "Save Water & Reduce Costs",
        description: "Smart irrigation to optimize water usage and cut expenses",
        icon: Droplets,
        value: "water-efficiency",
        color: "blue"
      },
      {
        id: "yield-increase",
        title: "Increase Crop Yields",
        description: "AI-powered farming to maximize harvest quality and quantity",
        icon: BarChart3,
        value: "yield-increase",
        color: "green"
      },
      {
        id: "market-access",
        title: "Access Better Markets",
        description: "Connect directly with buyers and get premium prices",
        icon: ShoppingCart,
        value: "market-access",
        color: "purple"
      },
      {
        id: "complete-solution",
        title: "Complete Smart Farm Transformation",
        description: "Full automation with AI recommendations and marketplace access",
        icon: Zap,
        value: "complete-solution",
        color: "orange"
      }
    ]
  },
  {
    id: "current-setup",
    title: "What's your current irrigation setup?",
    description: "This helps us recommend the right hardware for your farm",
    question: "Describe your current system:",
    options: [
      {
        id: "advanced-system",
        title: "Modern Irrigation System",
        description: "Drip irrigation or sprinkler system already installed",
        icon: CheckCircle,
        value: "advanced-system",
        color: "green"
      },
      {
        id: "basic-irrigation",
        title: "Basic Irrigation Setup",
        description: "Simple watering system, manually controlled",
        icon: Wrench,
        value: "basic-irrigation",
        color: "blue"
      },
      {
        id: "manual-only",
        title: "Manual Watering",
        description: "Hand watering or basic hose system",
        icon: Users,
        value: "manual-only",
        color: "orange"
      },
      {
        id: "no-system",
        title: "No Irrigation System",
        description: "Relying on rainfall or planning to start from scratch",
        icon: MapPin,
        value: "no-system",
        color: "purple"
      }
    ]
  },
  {
    id: "farm-size",
    title: "What's the size of your farming operation?",
    description: "This helps us suggest the right subscription plan and hardware scale",
    question: "Select your farm size:",
    options: [
      {
        id: "small-farm",
        title: "Small Farm (0.5 - 3 hectares)",
        description: "Family farming or small commercial operation",
        icon: Sprout,
        value: "small-farm",
        color: "green"
      },
      {
        id: "medium-farm",
        title: "Medium Farm (3 - 10 hectares)",
        description: "Commercial farming with multiple crop zones",
        icon: MapPin,
        value: "medium-farm",
        color: "blue"
      },
      {
        id: "large-farm",
        title: "Large Farm (10+ hectares)",
        description: "Large commercial operation or cooperative",
        icon: Globe,
        value: "large-farm",
        color: "purple"
      },
      {
        id: "multiple-farms",
        title: "Multiple Properties",
        description: "Managing several farm locations or cooperative network",
        icon: Users,
        value: "multiple-farms",
        color: "orange"
      }
    ]
  },
  {
    id: "technical-comfort",
    title: "How comfortable are you with technology?",
    description: "This helps us provide the right level of support and training",
    question: "Rate your technical experience:",
    options: [
      {
        id: "beginner",
        title: "Beginner",
        description: "Prefer simple solutions with hands-on guidance",
        icon: Users,
        value: "beginner",
        color: "orange"
      },
      {
        id: "intermediate",
        title: "Intermediate",
        description: "Comfortable with smartphones and learning new apps",
        icon: Smartphone,
        value: "intermediate",
        color: "blue"
      },
      {
        id: "advanced",
        title: "Advanced",
        description: "Tech-savvy and want full control over settings",
        icon: Wrench,
        value: "advanced",
        color: "purple"
      }
    ]
  },
  {
    id: "budget-range",
    title: "What's your investment budget for smart farming?",
    description: "This helps us recommend the best plan and financing options for you",
    question: "Select your monthly budget range:",
    options: [
      {
        id: "budget-low",
        title: "$5-15 per month",
        description: "Starting small with basic smart irrigation and flexible financing",
        icon: DollarSign,
        value: "budget-low",
        color: "green"
      },
      {
        id: "budget-medium",
        title: "$15-30 per month",
        description: "Ready to invest in AI-powered farming with good returns",
        icon: TrendingUp,
        value: "budget-medium",
        color: "blue"
      },
      {
        id: "budget-high",
        title: "$30+ per month",
        description: "Want the complete solution with all premium features",
        icon: Star,
        value: "budget-high",
        color: "purple"
      },
      {
        id: "budget-flexible",
        title: "Flexible - Pay as profits grow",
        description: "Interested in pay-as-you-harvest or group financing options",
        icon: Sprout,
        value: "budget-flexible",
        color: "orange"
      }
    ]
  }
]

const getColorClasses = (color: string, isSelected: boolean) => {
  if (isSelected) {
    switch (color) {
      case "blue":
        return {
          card: "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-blue-500/20",
          icon: "bg-blue-500 text-white",
          badge: "bg-blue-500 text-white"
        }
      case "green":
        return {
          card: "border-green-500 bg-green-50/50 dark:bg-green-900/10 ring-2 ring-green-500/20",
          icon: "bg-green-500 text-white",
          badge: "bg-green-500 text-white"
        }
      case "purple":
        return {
          card: "border-purple-500 bg-purple-50/50 dark:bg-purple-900/10 ring-2 ring-purple-500/20",
          icon: "bg-purple-500 text-white",
          badge: "bg-purple-500 text-white"
        }
      case "orange":
        return {
          card: "border-orange-500 bg-orange-50/50 dark:bg-orange-900/10 ring-2 ring-orange-500/20",
          icon: "bg-orange-500 text-white",
          badge: "bg-orange-500 text-white"
        }
      default:
        return {
          card: "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-blue-500/20",
          icon: "bg-blue-500 text-white",
          badge: "bg-blue-500 text-white"
        }
    }
  }
  
  switch (color) {
    case "blue":
      return {
        card: "border-border hover:border-blue-300 dark:hover:border-blue-600",
        icon: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
        badge: "hidden"
      }
    case "green":
      return {
        card: "border-border hover:border-green-300 dark:hover:border-green-600",
        icon: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
        badge: "hidden"
      }
    case "purple":
      return {
        card: "border-border hover:border-purple-300 dark:hover:border-purple-600",
        icon: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
        badge: "hidden"
      }
    case "orange":
      return {
        card: "border-border hover:border-orange-300 dark:hover:border-orange-600",
        icon: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
        badge: "hidden"
      }
    default:
      return {
        card: "border-border hover:border-blue-300 dark:hover:border-blue-600",
        icon: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
        badge: "hidden"
      }
  }
}

export function OnboardingQuestionnaire({ 
  onComplete, 
  prefilledData = {} 
}: { 
  onComplete: (results: any) => void
  prefilledData?: Record<string, string>
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>(prefilledData)
  const [selectedOption, setSelectedOption] = useState<string>(prefilledData[onboardingSteps[0]?.id] || "")

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100

  const handleNext = () => {
    if (selectedOption) {
      const newAnswers = { ...answers, [onboardingSteps[currentStep].id]: selectedOption }
      setAnswers(newAnswers)
      
      if (currentStep < onboardingSteps.length - 1) {
        setCurrentStep(currentStep + 1)
        setSelectedOption("")
      } else {
        // Generate recommendations and complete
        const recommendations = generateRecommendations(newAnswers)
        onComplete({ answers: newAnswers, recommendations })
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setSelectedOption(answers[onboardingSteps[currentStep - 1].id] || "")
    }
  }

  const generateRecommendations = (answers: Record<string, string>) => {
    const goals = answers["farming-goals"]
    const setup = answers["current-setup"]
    const size = answers["farm-size"]
    const tech = answers["technical-comfort"]

    // Logic to determine recommended plan and hardware
    let recommendedPlan = "basic"
    let hardwareNeeds: string[] = []
    let setupComplexity = "simple"

    if (goals === "complete-solution" || size === "multiple-farms") {
      recommendedPlan = "cooperative"
    } else if (goals === "yield-increase" || goals === "market-access" || size === "large-farm") {
      recommendedPlan = "professional"
    }

    if (setup === "manual-only" || setup === "no-system") {
      hardwareNeeds = ["Complete irrigation system", "Solar power kit", "Sensor network", "Smart controller hub"]
      setupComplexity = tech === "beginner" ? "guided" : "standard"
    } else if (setup === "basic-irrigation") {
      hardwareNeeds = ["Smart control hub", "Sensor upgrade", "Valve automation"]
      setupComplexity = "upgrade"
    } else {
      hardwareNeeds = ["Smart controller upgrade", "Advanced sensors"]
      setupComplexity = "simple"
    }

    return {
      plan: recommendedPlan,
      hardwareNeeds,
      setupComplexity,
      estimatedCost: recommendedPlan === "basic" ? "$150-250" : recommendedPlan === "professional" ? "$300-450" : "$500-700",
      setupTime: setupComplexity === "guided" ? "2-3 days with support" : "1-2 days"
    }
  }

  const currentStepData = onboardingSteps[currentStep]

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-4xl px-6">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Sprout className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep + 1} of {onboardingSteps.length}
              </span>
            </div>
            <Badge variant="outline" className="text-sm">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8 border-2 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sprout className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold mb-2">
              {currentStepData.title}
            </CardTitle>
            <CardDescription className="text-lg">
              {currentStepData.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <h3 className="text-lg font-semibold mb-6 text-center">
              {currentStepData.question}
            </h3>
            
            {/* Options Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {currentStepData.options.map((option) => {
                const isSelected = selectedOption === option.value
                const colorClasses = getColorClasses(option.color, isSelected)
                const IconComponent = option.icon
                
                return (
                  <Card
                    key={option.id}
                    className={`cursor-pointer hover:scale-105 transition-all duration-300 ${colorClasses.card}`}
                    onClick={() => setSelectedOption(option.value)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${colorClasses.icon}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-foreground truncate">
                              {option.title}
                            </h4>
                            {isSelected && (
                              <Badge className={colorClasses.badge}>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Selected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!selectedOption}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <span>
                  {currentStep === onboardingSteps.length - 1 ? "Complete & Apply" : "Next"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need help? We're here to guide you through every step of transforming your farm.
          </p>
        </div>
      </div>
    </div>
  )
}
