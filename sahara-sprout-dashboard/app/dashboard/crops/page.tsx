"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Sprout,
  Calendar,
  Droplets,
  Thermometer,
  Bug,
  Leaf,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  TrendingUp
} from "lucide-react"

// Mock crop data - in real app this would come from farm management system
const cropData = {
  activeCrops: [
    {
      id: "crop-1",
      name: "Jasmine Rice",
      variety: "Fragrant Rice",
      zone: "Zone A",
      area: "1.2 hectares",
      plantedDate: "2025-03-15",
      expectedHarvest: "2025-07-20",
      stage: "Flowering",
      health: 95,
      soilMoisture: 68,
      growth: 75,
      issues: [],
      notes: "Excellent growth, on track for high yield"
    },
    {
      id: "crop-2", 
      name: "Sweet Cassava",
      variety: "TMS 30572",
      zone: "Zone B",
      area: "0.8 hectares",
      plantedDate: "2025-01-10",
      expectedHarvest: "2025-09-10",
      stage: "Root Development",
      health: 87,
      soilMoisture: 72,
      growth: 60,
      issues: ["Minor pest activity"],
      notes: "Monitor for cassava mosaic virus"
    },
    {
      id: "crop-3",
      name: "Mixed Vegetables",
      variety: "Tomatoes, Peppers, Okra",
      zone: "Zone C",
      area: "0.5 hectares",
      plantedDate: "2025-05-01",
      expectedHarvest: "2025-07-01",
      stage: "Fruiting",
      health: 92,
      soilMoisture: 65,
      growth: 85,
      issues: [],
      notes: "Ready for harvest in 2 weeks"
    }
  ],
  recommendations: [
    {
      type: "watering",
      priority: "high",
      crop: "Jasmine Rice",
      message: "Increase watering frequency during flowering stage",
      action: "Adjust irrigation schedule"
    },
    {
      type: "fertilizer",
      priority: "medium", 
      crop: "Sweet Cassava",
      message: "Apply phosphorus-rich fertilizer for root development",
      action: "Schedule fertilizer application"
    },
    {
      type: "pest",
      priority: "low",
      crop: "Mixed Vegetables",
      message: "Monitor for aphids on tomato plants",
      action: "Inspect weekly"
    }
  ],
  upcomingTasks: [
    {
      task: "Harvest Mixed Vegetables",
      date: "2025-07-01",
      priority: "high",
      zone: "Zone C"
    },
    {
      task: "Apply Fertilizer to Cassava",
      date: "2025-06-20",
      priority: "medium",
      zone: "Zone B"
    },
    {
      task: "Pest Inspection",
      date: "2025-06-18",
      priority: "low",
      zone: "All Zones"
    }
  ]
}

export default function CropsPage() {
  const [selectedCrop, setSelectedCrop] = useState<any>(null)
  const [showAddCrop, setShowAddCrop] = useState(false)

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case "germination":
        return "bg-yellow-100 text-yellow-800"
      case "vegetative":
        return "bg-green-100 text-green-800"
      case "flowering":
        return "bg-purple-100 text-purple-800"
      case "fruiting":
        return "bg-orange-100 text-orange-800"
      case "root development":
        return "bg-blue-100 text-blue-800"
      case "maturity":
        return "bg-emerald-100 text-emerald-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getHealthStatus = (health: number) => {
    if (health >= 90) return { status: "Excellent", color: "text-green-600" }
    if (health >= 80) return { status: "Good", color: "text-blue-600" }
    if (health >= 70) return { status: "Fair", color: "text-yellow-600" }
    return { status: "Poor", color: "text-red-600" }
  }

  const getDaysUntilHarvest = (harvestDate: string) => {
    const harvest = new Date(harvestDate)
    const today = new Date()
    const diffTime = harvest.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Crop Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage your crops throughout their lifecycle
          </p>
        </div>
        <Dialog open={showAddCrop} onOpenChange={setShowAddCrop}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Crop
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Crop</DialogTitle>
              <DialogDescription>
                Register a new crop planting in your farm
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="crop-name">Crop Name</Label>
                <Input id="crop-name" placeholder="e.g., Jasmine Rice" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="variety">Variety</Label>
                <Input id="variety" placeholder="e.g., Fragrant Rice" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zone">Zone</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zone-a">Zone A</SelectItem>
                    <SelectItem value="zone-b">Zone B</SelectItem>
                    <SelectItem value="zone-c">Zone C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="area">Area (hectares)</Label>
                <Input id="area" type="number" placeholder="1.0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="planted-date">Planting Date</Label>
                <Input id="planted-date" type="date" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddCrop(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowAddCrop(false)}>
                Add Crop
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Crops</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cropData.activeCrops.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {cropData.activeCrops.reduce((acc, crop) => acc + parseFloat(crop.area), 0)} hectares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Health</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(cropData.activeCrops.reduce((acc, crop) => acc + crop.health, 0) / cropData.activeCrops.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              +5% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Harvest</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Mixed Vegetables in 2 weeks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cropData.activeCrops.reduce((acc, crop) => acc + crop.issues.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Minor pest activity detected
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="crops" className="space-y-4">
        <TabsList>
          <TabsTrigger value="crops">Active Crops</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="crops" className="space-y-4">
          <div className="grid gap-4">
            {cropData.activeCrops.map((crop) => {
              const healthStatus = getHealthStatus(crop.health)
              const daysUntilHarvest = getDaysUntilHarvest(crop.expectedHarvest)
              
              return (
                <Card key={crop.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Sprout className="h-5 w-5 text-green-500" />
                          {crop.name}
                        </CardTitle>
                        <CardDescription>{crop.variety} • {crop.zone} • {crop.area}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={getStageColor(crop.stage)}>
                          {crop.stage}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedCrop(crop)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Health Status</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={crop.health} className="w-16 h-2" />
                          <span className={`font-medium ${healthStatus.color}`}>
                            {healthStatus.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Growth Progress</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={crop.growth} className="w-16 h-2" />
                          <span className="font-medium">{crop.growth}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Soil Moisture</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Droplets className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{crop.soilMoisture}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Harvest In</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{daysUntilHarvest} days</span>
                        </div>
                      </div>
                    </div>
                    
                    {crop.issues.length > 0 && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Issues Detected:</span>
                        </div>
                        <ul className="mt-1 text-sm text-yellow-700">
                          {crop.issues.map((issue, index) => (
                            <li key={index}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {crop.notes && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">{crop.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Recommendations</CardTitle>
              <CardDescription>Smart suggestions to optimize your crop performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cropData.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="mt-1">
                      {rec.type === "watering" && <Droplets className="h-4 w-4 text-blue-500" />}
                      {rec.type === "fertilizer" && <Leaf className="h-4 w-4 text-green-500" />}
                      {rec.type === "pest" && <Bug className="h-4 w-4 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{rec.crop}</span>
                        <Badge variant="secondary" className={getPriorityColor(rec.priority)}>
                          {rec.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rec.message}</p>
                      <Button variant="outline" size="sm">
                        {rec.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Important farming activities scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cropData.upcomingTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{task.task}</p>
                        <p className="text-sm text-muted-foreground">{task.zone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{new Date(task.date).toLocaleDateString()}</span>
                      <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crop History</CardTitle>
              <CardDescription>Past plantings and harvest records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-12 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Crop history tracking coming soon...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  View detailed records of past harvests and yields
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Crop Detail Dialog */}
      {selectedCrop && (
        <Dialog open={!!selectedCrop} onOpenChange={() => setSelectedCrop(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedCrop.name} Details</DialogTitle>
              <DialogDescription>
                Manage crop information and update status
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Textarea defaultValue={selectedCrop.notes} rows={3} />
              </div>
              <div className="grid gap-2">
                <Label>Current Stage</Label>
                <Select defaultValue={selectedCrop.stage.toLowerCase()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="germination">Germination</SelectItem>
                    <SelectItem value="vegetative">Vegetative</SelectItem>
                    <SelectItem value="flowering">Flowering</SelectItem>
                    <SelectItem value="fruiting">Fruiting</SelectItem>
                    <SelectItem value="maturity">Maturity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedCrop(null)}>
                Cancel
              </Button>
              <Button onClick={() => setSelectedCrop(null)}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
