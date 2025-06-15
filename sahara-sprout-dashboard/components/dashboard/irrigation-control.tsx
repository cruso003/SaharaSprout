"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Droplets, 
  Settings, 
  Clock,
  MapPin,
  Zap,
  AlertTriangle,
  CheckCircle,
  Timer,
  Brain,
  Gauge,
  Activity,
  Pause,
  Play
} from "lucide-react"

export function IrrigationControl() {
  const zones = [
    { 
      id: 1, 
      name: "Tomatoes", 
      crop: "Cherry Tomatoes", 
      moisture: 68, 
      status: "optimal", 
      lastWatered: "2h ago",
      autoMode: true,
      aiPrediction: "No irrigation needed",
      nextIrrigation: "in 4 hours",
      threshold: { low: 40, high: 60 }
    },
    { 
      id: 2, 
      name: "Peppers", 
      crop: "Bell Peppers", 
      moisture: 42, 
      status: "irrigating", 
      lastWatered: "Currently active",
      autoMode: true,
      aiPrediction: "Early irrigation triggered",
      nextIrrigation: "Active",
      threshold: { low: 40, high: 60 }
    },
    { 
      id: 3, 
      name: "Lettuce", 
      crop: "Mixed Greens", 
      moisture: 75, 
      status: "optimal", 
      lastWatered: "1h ago",
      autoMode: true,
      aiPrediction: "No irrigation needed",
      nextIrrigation: "in 3 hours",
      threshold: { low: 40, high: 60 }
    },
    { 
      id: 4, 
      name: "Herbs", 
      crop: "Basil & Parsley", 
      moisture: 55, 
      status: "optimal", 
      lastWatered: "4h ago",
      autoMode: true,
      aiPrediction: "Monitor weather conditions",
      nextIrrigation: "in 2 hours",
      threshold: { low: 40, high: 60 }
    },
    { 
      id: 5, 
      name: "Carrots", 
      crop: "Orange Carrots", 
      moisture: 51, 
      status: "optimal", 
      lastWatered: "6h ago",
      autoMode: true,
      aiPrediction: "No irrigation needed",
      nextIrrigation: "in 6 hours",
      threshold: { low: 40, high: 60 }
    },
    { 
      id: 6, 
      name: "Onions", 
      crop: "Red Onions", 
      moisture: 38, 
      status: "scheduled", 
      lastWatered: "12h ago",
      autoMode: true,
      aiPrediction: "Irrigation scheduled",
      nextIrrigation: "in 15 minutes",
      threshold: { low: 40, high: 60 }
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'bg-green-100 text-green-800'
      case 'irrigating':
        return 'bg-blue-100 text-blue-800'
      case 'scheduled':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle className="w-3 h-3" />
      case 'irrigating':
        return <Activity className="w-3 h-3" />
      case 'scheduled':
        return <Clock className="w-3 h-3" />
      default:
        return <CheckCircle className="w-3 h-3" />
    }
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Autonomous</div>
            <p className="text-xs text-muted-foreground">
              Edge AI active • Last sync: 2 min ago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Zones</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Zone 2 currently irrigating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connectivity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4G</div>
            <p className="text-xs text-muted-foreground">
              SIM7600 • Signal: Strong
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Usage</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,450L</div>
            <p className="text-xs text-muted-foreground">
              85% of daily target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-600" />
            Edge AI Irrigation System
          </CardTitle>
          <CardDescription>
            TensorFlow Lite model running on ESP32 with 40-60% moisture threshold automation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Rule-Based Foundation</p>
              <p className="text-xs text-muted-foreground">
                Irrigation starts at 40% moisture • Stops at 60% moisture
              </p>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Predictive AI Enhancement</p>
              <p className="text-xs text-muted-foreground">
                Early irrigation triggers based on weather & soil conditions
              </p>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Brain className="w-3 h-3 mr-1" />
                Learning
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Local Processing</p>
              <p className="text-xs text-muted-foreground">
                Sub-30 second decisions • Works offline 7+ days
              </p>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Gauge className="w-3 h-3 mr-1" />
                Optimal
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>Zone Monitoring</CardTitle>
          <CardDescription>
            Real-time status from autonomous irrigation zones (monitoring only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {zones.map((zone) => (
              <div key={zone.id} className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Zone {zone.id} - {zone.name}</p>
                        <p className="text-sm text-muted-foreground">{zone.crop}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Badge 
                    variant="secondary"
                    className={getStatusColor(zone.status)}
                  >
                    {getStatusIcon(zone.status)}
                    <span className="ml-1 capitalize">{zone.status}</span>
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Soil Moisture</p>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={zone.moisture} 
                          className="flex-1 h-3"
                        />
                        <span className="text-sm font-medium">{zone.moisture}%</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Low: {zone.threshold.low}%</span>
                        <span>High: {zone.threshold.high}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">Last Irrigation</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {zone.lastWatered}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">Next Irrigation</p>
                    <p className="text-sm text-muted-foreground">{zone.nextIrrigation}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">AI Prediction</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Brain className="w-3 h-3 mr-1" />
                      {zone.aiPrediction}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="bg-green-50">
                      <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                      Autonomous Mode Active
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      <Settings className="w-3 h-3 mr-1" />
                      Local LCD Only
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Override (Restricted) */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="text-orange-600 flex items-center">
            <AlertTriangle className="w-5 w-5 mr-2" />
            Emergency Override
          </CardTitle>
          <CardDescription>
            Limited remote controls - System primarily operates autonomously via local LCD interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium text-orange-800">System Emergency Stop</p>
                <p className="text-sm text-orange-600">Stops all irrigation immediately via 4G command</p>
              </div>
              <Button variant="destructive" size="sm">
                <Pause className="w-4 h-4 mr-2" />
                Emergency Stop
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
              <p className="font-medium text-blue-800 mb-1">💡 Primary Control Location</p>
              <p className="text-blue-700">
                Full system control and configuration available on the local LCD display at the farm. 
                This dashboard provides monitoring and limited emergency functions only.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
