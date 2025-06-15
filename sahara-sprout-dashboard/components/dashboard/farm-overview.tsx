"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Droplets, 
  Thermometer, 
  Wind, 
  Zap, 
  Sprout, 
  TrendingUp, 
  TrendingDown,
  Battery,
  Wifi,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause
} from "lucide-react"

export function FarmOverview() {
  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Environmental Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Environment</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">28°C</span>
                <Badge variant="secondary">Optimal</Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Humidity:</span>
                  <span>65%</span>
                </div>
                <div className="flex justify-between">
                  <span>Wind:</span>
                  <span>12 km/h</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Water Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Usage</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">2,450L</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -15%
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Today's usage</span>
                  <span>85% of target</span>
                </div>
                <Progress value={85} className="h-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Battery className="w-3 h-3 mr-1" />
                    <span>Battery:</span>
                  </div>
                  <span>87%</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Wifi className="w-3 h-3 mr-1" />
                    <span>Signal:</span>
                  </div>
                  <span>Strong</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crop Health Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crop Health</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">94%</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Excellent
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                6 zones monitored • All healthy
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zone Status */}
      <Card>
        <CardHeader>
          <CardTitle>Autonomous Irrigation Zones</CardTitle>
          <CardDescription>
            Real-time monitoring from ESP32 edge AI system via SIM7600 4G/WiFi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 1, name: "Tomatoes", crop: "Cherry Tomatoes", moisture: 68, status: "optimal", lastWatered: "2h ago", aiStatus: "monitoring" },
              { id: 2, name: "Peppers", crop: "Bell Peppers", moisture: 42, status: "irrigating", lastWatered: "Active now", aiStatus: "irrigating" },
              { id: 3, name: "Lettuce", crop: "Mixed Greens", moisture: 75, status: "optimal", lastWatered: "1h ago", aiStatus: "monitoring" },
              { id: 4, name: "Herbs", crop: "Basil & Parsley", moisture: 55, status: "optimal", lastWatered: "4h ago", aiStatus: "monitoring" },
              { id: 5, name: "Carrots", crop: "Orange Carrots", moisture: 51, status: "optimal", lastWatered: "6h ago", aiStatus: "monitoring" },
              { id: 6, name: "Onions", crop: "Red Onions", moisture: 38, status: "scheduled", lastWatered: "12h ago", aiStatus: "scheduling" }
            ].map((zone) => (
              <div key={zone.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/10">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Zone {zone.id} - {zone.name}</p>
                      <p className="text-sm text-muted-foreground">{zone.crop}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{zone.moisture}% moisture</p>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {zone.lastWatered}
                    </p>
                  </div>
                  
                  <div className="w-20">
                    <Progress 
                      value={zone.moisture} 
                      className={`h-2 ${
                        zone.moisture < 40 ? 'bg-red-100' : 
                        zone.moisture < 60 ? 'bg-yellow-100' : 'bg-green-100'
                      }`}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>40%</span>
                      <span>60%</span>
                    </div>
                  </div>
                  
                  <Badge 
                    variant="secondary"
                    className={
                      zone.status === 'optimal' ? 'bg-green-100 text-green-800' :
                      zone.status === 'irrigating' ? 'bg-blue-100 text-blue-800' :
                      zone.status === 'scheduled' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {zone.status === 'optimal' ? 'Optimal' :
                     zone.status === 'irrigating' ? 'Irrigating' :
                     zone.status === 'scheduled' ? 'Scheduled' : 'Monitoring'}
                  </Badge>
                  
                  <Badge variant="outline" className="text-xs">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    Edge AI
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-2">
              <span className="text-xs text-white font-bold">AI</span>
            </div>
            Multi-Agent AI Insights
          </CardTitle>
          <CardDescription>
            Edge AI irrigation data feeds into crop advisory, market intelligence, and supply chain agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                priority: "info",
                title: "Irrigation Pattern Analysis",
                description: "Zone 2 early irrigation triggered by weather prediction - feeding data to yield forecasting model",
                action: "View Analytics",
                icon: Droplets,
                agent: "Irrigation Agent"
              },
              {
                priority: "medium", 
                title: "Crop Advisor Recommendation",
                description: "Moisture patterns suggest Zone 4 herbs ready for harvest in 3-5 days based on irrigation efficiency",
                action: "View Crops",
                icon: Sprout,
                agent: "Crop Advisor"
              },
              {
                priority: "high",
                title: "Market Intelligence Alert",
                description: "Current irrigation efficiency indicates 15% yield increase - optimal selling window in 2 weeks",
                action: "View Market",
                icon: TrendingUp,
                agent: "Market Intelligence"
              }
            ].map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/5">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    rec.priority === 'high' ? 'bg-green-100' :
                    rec.priority === 'medium' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    <rec.icon className={`h-4 w-4 ${
                      rec.priority === 'high' ? 'text-green-600' :
                      rec.priority === 'medium' ? 'text-blue-600' : 'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{rec.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {rec.agent}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {rec.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
