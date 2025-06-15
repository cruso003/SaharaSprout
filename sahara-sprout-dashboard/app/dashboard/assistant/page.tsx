"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bot,
  Send,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  Droplets,
  Bug,
  Leaf,
  Cloud,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  Brain,
  Target
} from "lucide-react"

// Mock AI assistant data and responses
const assistantData = {
  quickSuggestions: [
    {
      title: "Optimize Irrigation",
      description: "Based on weather forecast and soil moisture",
      action: "What's the best watering schedule for this week?",
      icon: Droplets,
      category: "irrigation"
    },
    {
      title: "Pest Management",
      description: "Identify and prevent common crop pests",
      action: "How can I protect my crops from pests naturally?",
      icon: Bug,
      category: "pest_control"
    },
    {
      title: "Crop Health",
      description: "Analyze plant health and nutrition needs",
      action: "Why are my tomato leaves turning yellow?",
      icon: Leaf,
      category: "plant_health"
    },
    {
      title: "Weather Planning",
      description: "Plan activities based on weather patterns",
      action: "Should I harvest before the upcoming rain?",
      icon: Cloud,
      category: "weather"
    }
  ],
  recentConversations: [
    {
      id: "conv-1",
      title: "Rice Flowering Stage Care",
      lastMessage: "Thank you! I'll adjust the irrigation schedule as recommended.",
      timestamp: "2 hours ago",
      category: "irrigation"
    },
    {
      id: "conv-2",
      title: "Cassava Pest Prevention",
      lastMessage: "The neem oil treatment should be applied every 3 days.",
      timestamp: "1 day ago", 
      category: "pest_control"
    },
    {
      id: "conv-3",
      title: "Fertilizer Schedule",
      lastMessage: "Perfect timing for the phosphorus application!",
      timestamp: "3 days ago",
      category: "nutrition"
    }
  ],
  insights: [
    {
      type: "optimization",
      title: "Water Usage Reduction",
      description: "You can reduce water usage by 15% by adjusting irrigation timing to early morning hours.",
      impact: "high",
      actionRequired: true
    },
    {
      type: "prediction",
      title: "Harvest Timing",
      description: "Your rice crop will be ready for harvest in 18-20 days based on current growth patterns.",
      impact: "medium",
      actionRequired: false
    },
    {
      type: "alert",
      title: "Weather Alert",
      description: "Heavy rain expected in 3 days. Consider protective measures for flowering crops.",
      impact: "high",
      actionRequired: true
    }
  ]
}

const mockResponses = {
  "irrigation": "Based on your current soil moisture levels (68%) and the upcoming weather forecast, I recommend adjusting your irrigation schedule. Your rice is in the flowering stage, which requires consistent moisture. Here's my suggestion:\n\n🌅 **Morning (6-7 AM)**: Deep watering for 20 minutes\n🌆 **Evening (6-7 PM)**: Light watering for 10 minutes\n\n**Why this timing?**\n- Reduces water evaporation\n- Allows plants to absorb water efficiently\n- Prevents fungal diseases\n\nWould you like me to set up an automated schedule for your irrigation system?",
  
  "pest_control": "Great question! For natural pest protection, I recommend an integrated approach:\n\n🌿 **Companion Planting**:\n- Plant marigolds around tomatoes\n- Use basil near peppers\n- Intercrop with aromatic herbs\n\n🏠 **Natural Solutions**:\n- Neem oil spray (2-3 times per week)\n- Diatomaceous earth for soil pests\n- Beneficial insects like ladybugs\n\n📋 **Monitoring Schedule**:\n- Daily visual inspections\n- Weekly detailed plant checks\n- Monthly soil health assessment\n\nShall I create a custom pest management plan for your specific crops?",
  
  "plant_health": "Yellow tomato leaves can indicate several issues. Let me help you diagnose:\n\n🔍 **Most Likely Causes**:\n1. **Nitrogen Deficiency** (most common)\n   - Yellowing starts from bottom leaves\n   - Solution: Apply nitrogen-rich fertilizer\n\n2. **Overwatering**\n   - Yellowing with wilting\n   - Solution: Reduce watering frequency\n\n3. **Natural Aging**\n   - Lower leaves yellow first\n   - Normal process, remove affected leaves\n\n💡 **Quick Diagnosis**:\n- Check soil moisture\n- Inspect leaf patterns\n- Review fertilization schedule\n\nCan you describe the pattern of yellowing? This will help me provide a more specific solution.",
  
  "weather": "Excellent question! Based on the weather forecast showing 85% chance of rain in 3 days, here's my recommendation:\n\n🌾 **For Rice (Zone A)**:\n- Harvest can wait - rice benefits from pre-harvest rain\n- Monitor for lodging if winds are strong\n\n🥕 **For Vegetables (Zone C)**:\n- Harvest immediately if fruits are 80%+ ripe\n- Cover plants if still developing\n\n🏃‍♂️ **Immediate Actions**:\n- Clear drainage channels\n- Stake tall plants\n- Harvest what's ready\n- Apply protective covers\n\nWould you like me to create a detailed pre-rain checklist for each of your zones?"
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Array<{id: string, type: 'user' | 'assistant', content: string, timestamp: Date}>>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(() => {
      const category = selectedCategory || "irrigation"
      const response = mockResponses[category as keyof typeof mockResponses] || "I'm here to help with your farming needs! Please let me know what specific assistance you need."
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 2000)
  }

  const handleQuickSuggestion = (suggestion: typeof assistantData.quickSuggestions[0]) => {
    setSelectedCategory(suggestion.category)
    handleSendMessage(suggestion.action)
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-500" />
            AI Farming Assistant
          </h1>
          <p className="text-muted-foreground">
            Get intelligent recommendations and expert farming advice
          </p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chat Interface */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Quick Suggestions
              </CardTitle>
              <CardDescription>Get instant help with common farming questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {assistantData.quickSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    onClick={() => handleQuickSuggestion(suggestion)}
                  >
                    <div className="flex items-start gap-3">
                      <suggestion.icon className="h-5 w-5 mt-0.5 text-blue-500" />
                      <div className="text-left">
                        <div className="font-medium">{suggestion.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {suggestion.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                Chat with AI Assistant
              </CardTitle>
              <CardDescription>Ask any farming-related question</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Messages */}
                <div className="h-96 overflow-y-auto space-y-4 p-4 border rounded-lg bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                      <p>Hello! I'm your AI farming assistant.</p>
                      <p className="text-sm">Ask me anything about your crops, irrigation, pest control, or farming practices!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white border'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          <div className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-blue-100' : 'text-muted-foreground'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border p-3 rounded-lg">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about your crops, irrigation, pests, or any farming question..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => handleSendMessage(inputMessage)}
                    disabled={!inputMessage.trim() || isTyping}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                AI Insights
              </CardTitle>
              <CardDescription>Smart recommendations for your farm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assistantData.insights.map((insight, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className={getImpactColor(insight.impact)}>
                        {insight.impact} impact
                      </Badge>
                      {insight.actionRequired && (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    {insight.actionRequired && (
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        Take Action
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Conversations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500" />
                Recent Conversations
              </CardTitle>
              <CardDescription>Your recent chat history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assistantData.recentConversations.map((conv) => (
                  <div key={conv.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium text-sm">{conv.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {conv.lastMessage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">{conv.timestamp}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                AI Performance
              </CardTitle>
              <CardDescription>How AI is helping your farm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Questions Answered</span>
                  <span className="font-bold">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-bold text-green-600">94%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Time Saved</span>
                  <span className="font-bold text-blue-600">23 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Yield Improvement</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="font-bold text-green-600">+15%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
