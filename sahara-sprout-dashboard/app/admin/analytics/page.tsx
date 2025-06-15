"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Users,
  DollarSign,
  Zap,
  MapPin,
  Calendar,
  Download,
  Target,
  Percent
} from "lucide-react"

// Mock analytics data - in real app this would come from API
const analyticsData = {
  overview: {
    totalRevenue: 234580,
    revenueGrowth: 12.5,
    totalFarmers: 247,
    farmerGrowth: 8.3,
    systemsInstalled: 189,
    systemGrowth: 15.2,
    avgSystemEfficiency: 87.4
  },
  regionalData: [
    { region: "Liberia", farmers: 156, revenue: 145320, installations: 124 },
    { region: "Sierra Leone", farmers: 67, revenue: 62180, installations: 43 },
    { region: "Guinea", farmers: 24, revenue: 27080, installations: 22 }
  ],
  monthlyMetrics: [
    { month: "Jan 2025", applications: 12, installations: 8, revenue: 18500 },
    { month: "Feb 2025", applications: 18, installations: 14, revenue: 24800 },
    { month: "Mar 2025", applications: 24, installations: 19, revenue: 31200 },
    { month: "Apr 2025", applications: 31, installations: 26, revenue: 38900 },
    { month: "May 2025", applications: 28, installations: 22, revenue: 35400 },
    { month: "Jun 2025", applications: 35, installations: 28, revenue: 42600 }
  ],
  planMetrics: [
    { plan: "Essential Plan", subscribers: 112, revenue: 89600, conversion: 78 },
    { plan: "Growth Plan", subscribers: 89, revenue: 124580, conversion: 84 },
    { plan: "Professional Plan", subscribers: 46, revenue: 119400, conversion: 91 }
  ]
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into business performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.overview.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              +{analyticsData.overview.revenueGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalFarmers}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              +{analyticsData.overview.farmerGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Systems Installed</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.systemsInstalled}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              +{analyticsData.overview.systemGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg System Efficiency</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.avgSystemEfficiency}%</div>
            <p className="text-xs text-muted-foreground">
              Above industry standard
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="plans">Plan Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>Key metrics over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.monthlyMetrics.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{month.month}</p>
                        <p className="text-sm text-muted-foreground">
                          {month.applications} applications, {month.installations} installations
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${month.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Distribution</CardTitle>
                <CardDescription>Farmer distribution by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.regionalData.map((region, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="font-medium">{region.region}</span>
                        </div>
                        <Badge variant="secondary">{region.farmers} farmers</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground pl-6">
                        <span>Revenue: ${region.revenue.toLocaleString()}</span>
                        <span>Installations: {region.installations}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {analyticsData.regionalData.map((region, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {region.region}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-2xl font-bold">{region.farmers}</p>
                      <p className="text-sm text-muted-foreground">Active Farmers</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">${region.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{region.installations}</p>
                      <p className="text-sm text-muted-foreground">Systems Installed</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Conversion Rate: {Math.round((region.installations / region.farmers) * 100)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Growth Trends</CardTitle>
              <CardDescription>Monthly growth analysis across key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold text-blue-600">+{analyticsData.overview.revenueGrowth}%</p>
                    <p className="text-sm text-muted-foreground">Revenue Growth</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold text-green-600">+{analyticsData.overview.farmerGrowth}%</p>
                    <p className="text-sm text-muted-foreground">Farmer Growth</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <p className="text-2xl font-bold text-orange-600">+{analyticsData.overview.systemGrowth}%</p>
                    <p className="text-sm text-muted-foreground">Installation Growth</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Monthly Progression</h3>
                  <div className="space-y-2">
                    {analyticsData.monthlyMetrics.map((month, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                        <span className="font-medium w-24">{month.month}</span>
                        <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                          <span>{month.applications} Applications</span>
                          <span>{month.installations} Installations</span>
                          <span>${month.revenue.toLocaleString()} Revenue</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {analyticsData.planMetrics.map((plan, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{plan.plan}</CardTitle>
                  <CardDescription>Performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-2xl font-bold">{plan.subscribers}</p>
                      <p className="text-sm text-muted-foreground">Active Subscribers</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">${plan.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        <span className="text-lg font-bold">{plan.conversion}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Avg Revenue per User: ${Math.round(plan.revenue / plan.subscribers)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
