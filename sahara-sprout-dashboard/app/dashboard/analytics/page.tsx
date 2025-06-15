"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Droplets,
  Thermometer,
  Zap,
  Sprout,
  Calendar,
  Download,
  Target,
  Activity,
  AlertTriangle
} from "lucide-react"

// Mock analytics data - in real app this would come from farm sensors
const analyticsData = {
  overview: {
    totalYield: 2.4,
    yieldIncrease: 23.5,
    waterSaved: 35,
    energyGenerated: 890,
    soilHealth: 85,
    cropHealth: 92
  },
  weeklyMetrics: [
    { day: "Mon", soilMoisture: 65, temperature: 28, humidity: 72, yield: 45 },
    { day: "Tue", soilMoisture: 62, temperature: 30, humidity: 68, yield: 52 },
    { day: "Wed", soilMoisture: 68, temperature: 27, humidity: 75, yield: 48 },
    { day: "Thu", soilMoisture: 70, temperature: 29, humidity: 70, yield: 58 },
    { day: "Fri", soilMoisture: 66, temperature: 31, humidity: 65, yield: 61 },
    { day: "Sat", soilMoisture: 64, temperature: 32, humidity: 62, yield: 55 },
    { day: "Sun", soilMoisture: 67, temperature: 28, humidity: 74, yield: 49 }
  ],
  cropZones: [
    { 
      zone: "Zone A - Rice",
      area: "1.2 hectares",
      health: 95,
      soilMoisture: 68,
      expectedHarvest: "3 weeks",
      status: "excellent"
    },
    { 
      zone: "Zone B - Cassava",
      area: "0.8 hectares",
      health: 87,
      soilMoisture: 72,
      expectedHarvest: "8 weeks",
      status: "good"
    },
    { 
      zone: "Zone C - Vegetables",
      area: "0.5 hectares",
      health: 92,
      soilMoisture: 65,
      expectedHarvest: "2 weeks",
      status: "excellent"
    }
  ],
  weatherForecast: [
    { day: "Today", temp: 29, condition: "Sunny", rain: 0 },
    { day: "Tomorrow", temp: 31, condition: "Partly Cloudy", rain: 10 },
    { day: "Day 3", temp: 27, condition: "Rainy", rain: 85 },
    { day: "Day 4", temp: 28, condition: "Cloudy", rain: 20 },
    { day: "Day 5", temp: 30, condition: "Sunny", rain: 5 }
  ]
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800"
      case "good":
        return "bg-blue-100 text-blue-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Farm Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your farm's performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Yield</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalYield} tons</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              +{analyticsData.overview.yieldIncrease}% from last season
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Efficiency</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.waterSaved}% saved</div>
            <p className="text-xs text-muted-foreground">
              Compared to traditional irrigation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solar Energy</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.energyGenerated} kWh</div>
            <p className="text-xs text-muted-foreground">
              Generated this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soil Health</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.soilHealth}%</div>
            <Progress value={analyticsData.overview.soilHealth} className="w-full h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="zones">Crop Zones</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Performance</CardTitle>
                <CardDescription>Key metrics over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.weeklyMetrics.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{day.day}</p>
                        <p className="text-sm text-muted-foreground">
                          {day.temperature}°C • {day.humidity}% humidity
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{day.soilMoisture}%</p>
                        <p className="text-sm text-muted-foreground">Soil Moisture</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current status of farm systems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span>Irrigation System</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>Solar Power</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">98% Efficiency</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>Sensors</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">All Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      <span>Climate Control</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Monitoring</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="zones" className="space-y-4">
          <div className="grid gap-4">
            {analyticsData.cropZones.map((zone, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{zone.zone}</CardTitle>
                    <Badge variant="secondary" className={getStatusColor(zone.status)}>
                      {zone.status}
                    </Badge>
                  </div>
                  <CardDescription>{zone.area}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Crop Health</p>
                      <div className="flex items-center gap-2">
                        <Progress value={zone.health} className="w-16 h-2" />
                        <span className="font-medium">{zone.health}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Soil Moisture</p>
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{zone.soilMoisture}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Harvest</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{zone.expectedHarvest}</span>
                      </div>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weather" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>5-Day Weather Forecast</CardTitle>
              <CardDescription>Plan your farming activities based on weather predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                {analyticsData.weatherForecast.map((forecast, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <p className="font-medium">{forecast.day}</p>
                    <div className="my-2">
                      <Thermometer className="h-8 w-8 mx-auto text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold">{forecast.temp}°C</p>
                    <p className="text-sm text-muted-foreground">{forecast.condition}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      <span className="text-xs">{forecast.rain}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Yield Trends</CardTitle>
                <CardDescription>Crop production over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>This Month</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-bold">+15%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>This Quarter</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-bold">+23%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>This Year</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-bold">+31%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Efficiency</CardTitle>
                <CardDescription>Water and energy usage optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Water Usage Efficiency</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Solar Energy Utilization</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Fertilizer Efficiency</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
