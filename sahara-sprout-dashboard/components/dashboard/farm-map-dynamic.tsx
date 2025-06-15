"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from '@googlemaps/js-api-loader'
import { useFarm, getZoneCenter, getZoneStatusColor } from "@/lib/context/farm-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  MapPin, 
  Droplets, 
  Zap, 
  Activity,
  Satellite,
  Layers,
  Eye,
  EyeOff,
  CheckCircle,
  TestTube,
  Calendar,
  Info,
  ChevronDown,
  ChevronUp,
  Building
} from "lucide-react"

export function FarmMap() {
  const { currentFarm, isLoading, updateFarm } = useFarm()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const polygonsRef = useRef<google.maps.Polygon[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  
  const [mapType, setMapType] = useState<'satellite' | 'terrain'>('satellite')
  const [showSensors, setShowSensors] = useState(true)
  const [showZones, setShowZones] = useState(true)
  const [showNpkSensor, setShowNpkSensor] = useState(true)
  const [zonesCollapsed, setZonesCollapsed] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (map.current || !currentFarm) return // initialize map only once
    
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['geometry', 'drawing']
    })

    loader.load().then(async () => {
      if (mapContainer.current && currentFarm) {
        map.current = new google.maps.Map(mapContainer.current, {
          center: { 
            lat: currentFarm.location.coordinates.lat, 
            lng: currentFarm.location.coordinates.lng 
          },
          zoom: 18,
          mapTypeId: mapType === 'satellite' ? google.maps.MapTypeId.SATELLITE : google.maps.MapTypeId.TERRAIN,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          gestureHandling: 'greedy'
        })

        setMapLoaded(true)
        addMapData()
      }
    }).catch(e => {
      console.error('Error loading Google Maps:', e)
    })
  }, [currentFarm])

  // Handle map type changes
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setMapTypeId(mapType === 'satellite' ? google.maps.MapTypeId.SATELLITE : google.maps.MapTypeId.TERRAIN)
    }
  }, [mapType, mapLoaded])

  // Handle zone and sensor visibility changes
  useEffect(() => {
    if (map.current && mapLoaded && currentFarm) {
      addMapData()
    }
  }, [showZones, showSensors, showNpkSensor, mapLoaded, currentFarm])

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []
    polygonsRef.current.forEach(polygon => polygon.setMap(null))
    polygonsRef.current = []
  }

  const addMapData = () => {
    if (!map.current || !mapLoaded || !currentFarm) return
    
    // Clear existing markers and polygons
    clearMarkers()

    // Add zone polygons
    if (showZones) {
      currentFarm.zones.forEach((zone) => {
        const polygon = new google.maps.Polygon({
          paths: zone.coordinates.map(coord => ({ lat: coord[1], lng: coord[0] })),
          strokeColor: getZoneStatusColor(zone.status),
          strokeOpacity: 0.8,
          strokeWeight: 3,
          fillColor: getZoneStatusColor(zone.status),
          fillOpacity: 0.4,
          clickable: true
        })
        
        polygon.setMap(map.current!)
        polygonsRef.current.push(polygon)
      })
    }

    // Add moisture sensors
    if (showSensors) {
      currentFarm.zones.forEach((zone) => {
        const sensorCenter = getZoneCenter(zone.coordinates)
        
        const marker = new google.maps.Marker({
          position: { lat: sensorCenter[1], lng: sensorCenter[0] },
          map: map.current!,
          title: `${zone.name}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#2563eb',
            fillOpacity: 0.9,
            strokeWeight: 2,
            strokeColor: '#ffffff'
          },
          label: {
            text: zone.id.slice(-1), // Use last character of zone ID
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px'
          }
        })

        markersRef.current.push(marker)

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 220px; padding: 8px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
              <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 4px;">${zone.name}</h3>
              <p style="margin: 4px 0 8px 0; color: #4b5563; font-size: 13px; font-style: italic;">${zone.crop}</p>
              <div style="margin: 8px 0; color: #374151; font-size: 13px; line-height: 1.4;">
                <div style="margin: 4px 0; display: flex; justify-content: space-between;">
                  <span style="font-weight: 600; color: #1f2937;">Moisture:</span> 
                  <span style="color: ${zone.moisture > 60 ? '#10b981' : zone.moisture > 40 ? '#f59e0b' : '#ef4444'}; font-weight: 600;">${zone.moisture}%</span>
                </div>
                <div style="margin: 4px 0; display: flex; justify-content: space-between;">
                  <span style="font-weight: 600; color: #1f2937;">Status:</span> 
                  <span style="color: ${getZoneStatusColor(zone.status)}; font-weight: 600; text-transform: capitalize;">${zone.status}</span>
                </div>
                <div style="margin: 4px 0; display: flex; justify-content: space-between;">
                  <span style="font-weight: 600; color: #1f2937;">Area:</span> 
                  <span style="color: #4b5563; font-weight: 500;">${zone.area}</span>
                </div>
              </div>
              <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; text-align: center;">
                Click for detailed information
              </div>
            </div>
          `
        })

        marker.addListener('click', () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.close()
          }
          infoWindow.open(map.current!, marker)
          infoWindowRef.current = infoWindow
        })
      })
    }

    // Add ESP32 Hub marker
    if (currentFarm.devices.length > 0) {
      const hubDevice = currentFarm.devices.find(d => d.type === 'esp32_hub')
      if (hubDevice) {
        const hubMarker = new google.maps.Marker({
          position: { lat: hubDevice.coordinates.lat, lng: hubDevice.coordinates.lng },
          map: map.current!,
          title: hubDevice.name,
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: '#dc2626',
            fillOpacity: 0.9,
            strokeWeight: 2,
            strokeColor: '#ffffff'
          }
        })

        markersRef.current.push(hubMarker)

        // Add ESP32 Hub info window
        const hubInfoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 250px; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
              <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600; border-bottom: 2px solid #dc2626; padding-bottom: 4px;">
                ⚡ ${hubDevice.name}
              </h3>
              <div style="margin: 8px 0; color: #374151; font-size: 13px; line-height: 1.5;">
                <div style="margin: 4px 0; display: flex; justify-content: space-between;">
                  <span style="font-weight: 600; color: #1f2937;">Status:</span>
                  <span style="color: #10b981; font-weight: 600;">● ${hubDevice.status}</span>
                </div>
                <div style="margin: 4px 0; display: flex; justify-content: space-between;">
                  <span style="font-weight: 600; color: #1f2937;">Battery:</span>
                  <span style="color: ${(hubDevice.battery || 0) > 50 ? '#10b981' : (hubDevice.battery || 0) > 20 ? '#f59e0b' : '#ef4444'}; font-weight: 600;">${hubDevice.battery || 87}%</span>
                </div>
                <div style="margin: 4px 0; display: flex; justify-content: space-between;">
                  <span style="font-weight: 600; color: #1f2937;">Connectivity:</span>
                  <span style="color: #3b82f6; font-weight: 600;">${hubDevice.connectivity || '4G'}</span>
                </div>
              </div>
              <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; text-align: center;">
                Central irrigation controller for ${currentFarm.name}
              </div>
            </div>
          `
        })

        hubMarker.addListener('click', () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.close()
          }
          hubInfoWindow.open(map.current!, hubMarker)
          infoWindowRef.current = hubInfoWindow
        })
      }
    }

    // Add NPK sensor marker
    if (showNpkSensor && currentFarm.npkSensor) {
      const npkMarker = new google.maps.Marker({
        position: { 
          lat: currentFarm.npkSensor.coordinates.lat, 
          lng: currentFarm.npkSensor.coordinates.lng 
        },
        map: map.current!,
        title: 'Portable NPK Sensor',
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 8,
          fillColor: '#7c3aed',
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: '#ffffff'
        },
        label: {
          text: 'NPK',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '10px'
        }
      })

      markersRef.current.push(npkMarker)

      // Add NPK info window
      const npkInfoWindow = new google.maps.InfoWindow({
        content: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 280px; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600; border-bottom: 2px solid #7c3aed; padding-bottom: 4px;">
              🧪 Portable NPK Sensor
            </h3>
            <p style="margin: 4px 0 8px 0; color: #4b5563; font-size: 13px; font-weight: 500;">
              📍 Currently monitoring soil nutrients
            </p>
            <div style="margin: 8px 0; color: #374151; font-size: 13px; line-height: 1.5;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 8px 0;">
                <div style="background: #f3f4f6; padding: 6px; border-radius: 4px; text-align: center;">
                  <div style="font-weight: 600; color: #1f2937; font-size: 12px;">Nitrogen</div>
                  <div style="color: #059669; font-weight: 700;">${currentFarm.npkSensor.lastReading.nitrogen}mg/kg</div>
                </div>
                <div style="background: #f3f4f6; padding: 6px; border-radius: 4px; text-align: center;">
                  <div style="font-weight: 600; color: #1f2937; font-size: 12px;">Phosphorus</div>
                  <div style="color: #0891b2; font-weight: 700;">${currentFarm.npkSensor.lastReading.phosphorus}mg/kg</div>
                </div>
                <div style="background: #f3f4f6; padding: 6px; border-radius: 4px; text-align: center;">
                  <div style="font-weight: 600; color: #1f2937; font-size: 12px;">Potassium</div>
                  <div style="color: #dc2626; font-weight: 700;">${currentFarm.npkSensor.lastReading.potassium}mg/kg</div>
                </div>
                <div style="background: #f3f4f6; padding: 6px; border-radius: 4px; text-align: center;">
                  <div style="font-weight: 600; color: #1f2937; font-size: 12px;">pH Level</div>
                  <div style="color: #7c3aed; font-weight: 700;">${currentFarm.npkSensor.lastReading.ph}</div>
                </div>
              </div>
              <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600; color: #1f2937;">Battery:</span>
                <span style="color: ${currentFarm.npkSensor.batteryLevel > 50 ? '#10b981' : currentFarm.npkSensor.batteryLevel > 20 ? '#f59e0b' : '#ef4444'}; font-weight: 600;">${currentFarm.npkSensor.batteryLevel}%</span>
              </div>
            </div>
            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; text-align: center;">
              Portable 7-in-1 soil analyzer
            </div>
          </div>
        `
      })

      npkMarker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close()
        }
        npkInfoWindow.open(map.current!, npkMarker)
        infoWindowRef.current = npkInfoWindow
      })
    }
  }

  // Function to fit map to farm bounds
  const fitToFarm = () => {
    if (!map.current || !currentFarm) return
    
    const bounds = new google.maps.LatLngBounds()
    currentFarm.zones.forEach(zone => {
      zone.coordinates.forEach(coord => {
        bounds.extend({ lat: coord[1], lng: coord[0] })
      })
    })
    
    map.current.fitBounds(bounds)
  }

  // Function to move NPK sensor to a specific zone
  const moveNpkSensorToZone = (zoneId: string) => {
    if (!currentFarm) return
    
    const targetZone = currentFarm.zones.find(zone => zone.id === zoneId)
    if (!targetZone) return
    
    // Update NPK sensor location
    const newCoordinates = getZoneCenter(targetZone.coordinates)
    const updatedFarm = {
      ...currentFarm,
      npkSensor: {
        ...currentFarm.npkSensor,
        currentZoneId: zoneId,
        coordinates: { lat: newCoordinates[1], lng: newCoordinates[0] },
        lastMoved: new Date()
      }
    }
    
    updateFarm(updatedFarm)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-[600px] w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!currentFarm) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Farm Selected</h3>
          <p className="text-muted-foreground">Please select a farm to view the interactive map.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Farm Map - {currentFarm.name}</CardTitle>
              <CardDescription>
                Google Maps view - {currentFarm.location.city}, {currentFarm.location.country}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Activity className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={mapType === 'satellite' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setMapType('satellite')}
            >
              <Satellite className="w-4 h-4 mr-2" />
              Satellite
            </Button>
            <Button 
              variant={mapType === 'terrain' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setMapType('terrain')}
            >
              <Layers className="w-4 h-4 mr-2" />
              Terrain
            </Button>
            <Button 
              variant={showZones ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setShowZones(!showZones)}
            >
              {showZones ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
              Zones
            </Button>
            <Button 
              variant={showSensors ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setShowSensors(!showSensors)}
            >
              {showSensors ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
              Moisture Sensors
            </Button>
            <Button 
              variant={showNpkSensor ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setShowNpkSensor(!showNpkSensor)}
            >
              {showNpkSensor ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
              NPK Sensor
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fitToFarm}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Fit to Farm
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div 
                ref={mapContainer} 
                className="w-full h-[600px] rounded-lg bg-slate-50"
              />
            </CardContent>
          </Card>
        </div>

        {/* Farm Details Sidebar */}
        <div className="space-y-4">
          {/* Hub Status */}
          {currentFarm.devices.find(d => d.type === 'esp32_hub') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-green-600" />
                  ESP32 Hub Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const hub = currentFarm.devices.find(d => d.type === 'esp32_hub')!
                  return (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">System Status</span>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {hub.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Battery Level</span>
                        <span className="text-sm font-medium">{hub.battery || 87}%</span>
                      </div>
                      <Progress value={hub.battery || 87} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Connectivity</span>
                        <Badge variant="outline">
                          <Activity className="w-3 h-3 mr-1" />
                          {hub.connectivity || '4G'}
                        </Badge>
                      </div>
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          )}

          {/* Farm Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Farm Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600">Total Area</p>
                  <p className="font-semibold text-blue-800">{currentFarm.totalArea}</p>
               </div>
               <div className="text-center p-3 bg-green-50 rounded-lg">
                 <p className="text-xs text-green-600">Active Zones</p>
                 <p className="font-semibold text-green-800">{currentFarm.zones.length}</p>
               </div>
               <div className="text-center p-3 bg-purple-50 rounded-lg">
                 <p className="text-xs text-purple-600">Moisture Sensors</p>
                 <p className="font-semibold text-purple-800">{currentFarm.zones.length}</p>
               </div>
               <div className="text-center p-3 bg-orange-50 rounded-lg">
                 <p className="text-xs text-orange-600">NPK Sensor</p>
                 <p className="font-semibold text-orange-800">1 Portable</p>
               </div>
             </div>
           </CardContent>
         </Card>

         {/* Zone List */}
         <Card>
           <CardHeader>
             <div className="flex items-center justify-between">
               <div>
                 <CardTitle className="text-lg">Irrigation Zones</CardTitle>
                 <CardDescription>
                   Click zones on map for details
                 </CardDescription>
               </div>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setZonesCollapsed(!zonesCollapsed)}
               >
                 {zonesCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
               </Button>
             </div>
           </CardHeader>
           <CardContent>
             <Collapsible open={!zonesCollapsed} onOpenChange={(open) => setZonesCollapsed(!open)}>
               <CollapsibleContent className="space-y-3">
                 {currentFarm.zones.map((zone) => (
                   <Dialog key={zone.id}>
                     <DialogTrigger asChild>
                       <div className="p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50">
                         <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center space-x-2">
                             <div 
                               className={`w-3 h-3 rounded-full ${
                                 zone.status === 'optimal' ? 'bg-green-500' :
                                 zone.status === 'irrigating' ? 'bg-blue-500' :
                                 zone.status === 'scheduled' ? 'bg-orange-500' :
                                 'bg-gray-500'
                               }`}
                             />
                             <span className="font-medium">{zone.name}</span>
                           </div>
                           <Badge 
                             variant="secondary"
                             className={
                               zone.status === 'optimal' ? 'bg-green-100 text-green-800' :
                               zone.status === 'irrigating' ? 'bg-blue-100 text-blue-800' :
                               zone.status === 'scheduled' ? 'bg-orange-100 text-orange-800' :
                               'bg-gray-100 text-gray-800'
                             }
                           >
                             {zone.status}
                           </Badge>
                         </div>
                         <div className="text-sm text-muted-foreground">
                           <div>{zone.crop}</div>
                           <div className="flex justify-between mt-1">
                             <span>Moisture: {zone.moisture}%</span>
                             <span>Area: {zone.area}</span>
                           </div>
                         </div>
                       </div>
                     </DialogTrigger>
                     
                     <DialogContent className="max-w-2xl">
                       <DialogHeader>
                         <DialogTitle className="flex items-center">
                           <div 
                             className={`w-4 h-4 rounded-full mr-2 ${
                               zone.status === 'optimal' ? 'bg-green-500' :
                               zone.status === 'irrigating' ? 'bg-blue-500' :
                               zone.status === 'scheduled' ? 'bg-orange-500' :
                               'bg-gray-500'
                             }`}
                           />
                           {zone.name}
                         </DialogTitle>
                         <DialogDescription>
                           {zone.crop} • {zone.area} • Status: {zone.status}
                         </DialogDescription>
                       </DialogHeader>
                       
                       <Tabs defaultValue="status" className="w-full">
                         <TabsList className="grid w-full grid-cols-3">
                           <TabsTrigger value="status">Status</TabsTrigger>
                           <TabsTrigger value="sensors">Sensors</TabsTrigger>
                           <TabsTrigger value="npk">NPK Sampling</TabsTrigger>
                         </TabsList>
                         
                         <TabsContent value="status" className="space-y-4">
                           <Card>
                             <CardHeader>
                               <CardTitle className="text-base">Moisture Status</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-3">
                               <div className="flex justify-between text-sm">
                                 <span>Current Moisture:</span>
                                 <span className="font-medium">{zone.moisture}%</span>
                               </div>
                               <Progress value={zone.moisture} className="h-3" />
                               <div className="flex justify-between text-xs text-muted-foreground">
                                 <span>Irrigation starts at {currentFarm.settings.irrigationThresholds.start}%</span>
                                 <span>Stops at {currentFarm.settings.irrigationThresholds.stop}%</span>
                               </div>
                               
                               <div className="grid grid-cols-2 gap-4 mt-4">
                                 <div className="text-center p-3 bg-muted/50 rounded-lg">
                                   <p className="text-xs text-muted-foreground">Irrigation Mode</p>
                                   <p className="font-semibold text-green-600">
                                     {currentFarm.settings.autoIrrigation ? 'Autonomous' : 'Manual'}
                                   </p>
                                 </div>
                                 <div className="text-center p-3 bg-muted/50 rounded-lg">
                                   <p className="text-xs text-muted-foreground">Next Action</p>
                                   <p className="font-semibold">
                                     {zone.status === 'irrigating' ? `Stop at ${currentFarm.settings.irrigationThresholds.stop}%` : 
                                      zone.status === 'scheduled' ? 'Start irrigation' : 
                                      'Monitor'}
                                   </p>
                                 </div>
                               </div>
                             </CardContent>
                           </Card>
                         </TabsContent>
                         
                         <TabsContent value="sensors" className="space-y-4">
                           <Card>
                             <CardHeader>
                               <CardTitle className="text-base">Moisture Sensor</CardTitle>
                             </CardHeader>
                             <CardContent>
                               <div className="p-3 border rounded-lg">
                                 <div className="flex items-center justify-between">
                                   <div className="flex items-center space-x-3">
                                     <MapPin className="w-4 h-4 text-muted-foreground" />
                                     <div>
                                       <p className="font-medium">Moisture Sensor - {zone.name}</p>
                                       <p className="text-xs text-muted-foreground">
                                         📍 Zone center coordinates
                                       </p>
                                     </div>
                                   </div>
                                   <div className="text-right">
                                     <p className="font-medium">{zone.moisture}%</p>
                                     <Badge variant="outline" className="text-xs">
                                       <Activity className="w-3 h-3 mr-1" />
                                       active
                                     </Badge>
                                   </div>
                                 </div>
                               </div>
                             </CardContent>
                           </Card>
                         </TabsContent>
                         
                         <TabsContent value="npk" className="space-y-4">
                           <Card>
                             <CardHeader>
                               <CardTitle className="text-base flex items-center">
                                 <TestTube className="w-4 h-4 mr-2" />
                                 NPK Testing Status
                               </CardTitle>
                               <CardDescription>
                                 Use the portable 7-in-1 NPK sensor for soil analysis
                               </CardDescription>
                             </CardHeader>
                             <CardContent>
                               <div className="p-3 border rounded-lg">
                                 <div className="flex items-center justify-between">
                                   <div className="flex items-center space-x-3">
                                     <TestTube className="w-4 h-4 text-purple-600" />
                                     <div>
                                       <p className="font-medium">Last NPK Test</p>
                                       <p className="text-xs text-muted-foreground">
                                         Zone center recommended for testing
                                       </p>
                                     </div>
                                   </div>
                                   <div className="text-right">
                                     <p className="text-sm">{zone.lastNpkTest}</p>
                                     <Badge 
                                       variant={zone.npkStatus === 'current' ? 'secondary' : 
                                              zone.npkStatus === 'due' ? 'outline' : 'destructive'}
                                       className={
                                         zone.npkStatus === 'current' ? 'bg-green-100 text-green-800' :
                                         zone.npkStatus === 'due' ? 'bg-yellow-100 text-yellow-800' :
                                         'bg-red-100 text-red-800'
                                       }
                                     >
                                       <Calendar className="w-3 h-3 mr-1" />
                                       {zone.npkStatus}
                                     </Badge>
                                   </div>
                                 </div>
                               </div>
                               
                               {currentFarm.npkSensor && currentFarm.npkSensor.currentZoneId === zone.id && (
                                 <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                                   <div className="flex items-start space-x-2">
                                     <TestTube className="w-4 h-4 text-purple-600 mt-0.5" />
                                     <div className="text-sm">
                                       <p className="font-medium text-purple-900">NPK Sensor Currently Here!</p>
                                       <p className="text-purple-700 mt-1">
                                         The portable NPK sensor is currently positioned in this zone for testing.
                                       </p>
                                       <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                         <div>N: {currentFarm.npkSensor.lastReading.nitrogen}mg/kg</div>
                                         <div>P: {currentFarm.npkSensor.lastReading.phosphorus}mg/kg</div>
                                         <div>K: {currentFarm.npkSensor.lastReading.potassium}mg/kg</div>
                                         <div>pH: {currentFarm.npkSensor.lastReading.ph}</div>
                                       </div>
                                     </div>
                                   </div>
                                 </div>
                               )}
                               
                               {(!currentFarm.npkSensor || currentFarm.npkSensor.currentZoneId !== zone.id) && (
                                 <div className="mt-4">
                                   <Button 
                                     onClick={() => moveNpkSensorToZone(zone.id)}
                                     className="w-full"
                                     variant="outline"
                                   >
                                     <MapPin className="w-4 h-4 mr-2" />
                                     Move NPK Sensor Here
                                   </Button>
                                   {currentFarm.npkSensor && (
                                     <p className="text-xs text-muted-foreground mt-2 text-center">
                                       Currently in another zone
                                     </p>
                                   )}
                                 </div>
                               )}
                               
                               <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                 <div className="flex items-start space-x-2">
                                   <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                                   <div className="text-sm">
                                     <p className="font-medium text-blue-900">NPK Testing Instructions</p>
                                     <p className="text-blue-700 mt-1">
                                       Move the portable 7-in-1 NPK sensor to this zone's center coordinates. Test monthly or when crop performance changes. Results feed into AI crop recommendations.
                                     </p>
                                   </div>
                                 </div>
                               </div>
                             </CardContent>
                           </Card>
                         </TabsContent>
                       </Tabs>
                     </DialogContent>
                   </Dialog>
                 ))}
               </CollapsibleContent>
             </Collapsible>
           </CardContent>
         </Card>
       </div>
     </div>

     {/* Map Legend */}
     <Card>
       <CardHeader>
         <CardTitle>Map Legend</CardTitle>
         <CardDescription>
           Visual indicators for {currentFarm.name} - {currentFarm.location.city}, {currentFarm.location.country}
         </CardDescription>
       </CardHeader>
       <CardContent>
         <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
           <div className="flex items-center space-x-2">
             <div className="w-4 h-4 rounded bg-green-500"></div>
             <span className="text-sm">Optimal Zones</span>
           </div>
           <div className="flex items-center space-x-2">
             <div className="w-4 h-4 rounded bg-blue-500"></div>
             <span className="text-sm">Currently Irrigating</span>
           </div>
           <div className="flex items-center space-x-2">
             <div className="w-4 h-4 rounded bg-orange-500"></div>
             <span className="text-sm">Irrigation Scheduled</span>
           </div>
           <div className="flex items-center space-x-2">
             <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">1</div>
             <span className="text-sm">Moisture Sensors</span>
           </div>
           <div className="flex items-center space-x-2">
             <div className="w-4 h-4 rounded bg-purple-600 flex items-center justify-center text-white text-xs font-bold">N</div>
             <span className="text-sm">Portable NPK Sensor</span>
           </div>
         </div>
         
         <div className="mt-4 p-3 bg-green-50 rounded-lg">
           <div className="flex items-start space-x-2">
             <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
             <div className="text-sm">
               <p className="font-medium text-green-900">{currentFarm.name}</p>
               <p className="text-green-700 mt-1">
                 Total area: {currentFarm.totalArea} • {currentFarm.zones.length} irrigation zones • 
                 Location: {currentFarm.location.city}, {currentFarm.location.region}, {currentFarm.location.country}
               </p>
             </div>
           </div>
         </div>
       </CardContent>
     </Card>
   </div>
 )
}
