"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Farm, User, sampleFarms, sampleUsers } from '@/lib/types/farm'

interface FarmContextType {
  currentUser: User | null
  currentFarm: Farm | null
  farms: Farm[]
  switchFarm: (farmId: string) => void
  updateFarm: (farm: Farm) => void
  isLoading: boolean
}

const FarmContext = createContext<FarmContextType | undefined>(undefined)

export function FarmProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentFarm, setCurrentFarm] = useState<Farm | null>(null)
  const [farms, setFarms] = useState<Farm[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading user and farm data
    // In a real app, this would be API calls
    setTimeout(() => {
      const user = sampleUsers[0] // Mock current user
      setCurrentUser(user)
      
      // Load farms user has access to
      const userFarms = sampleFarms.filter(farm => user.farms.includes(farm.id))
      setFarms(userFarms)
      
      // Set current farm
      const currentFarmData = userFarms.find(farm => farm.id === user.currentFarmId) || userFarms[0]
      setCurrentFarm(currentFarmData)
      
      setIsLoading(false)
    }, 1000)
  }, [])

  const switchFarm = (farmId: string) => {
    const farm = farms.find(f => f.id === farmId)
    if (farm) {
      setCurrentFarm(farm)
      
      // Update user's current farm preference
      if (currentUser) {
        const updatedUser = { ...currentUser, currentFarmId: farmId }
        setCurrentUser(updatedUser)
        // In a real app, this would be an API call
        console.log('Switched to farm:', farm.name)
      }
    }
  }

  const updateFarm = (updatedFarm: Farm) => {
    setFarms(prev => prev.map(farm => 
      farm.id === updatedFarm.id ? updatedFarm : farm
    ))
    
    if (currentFarm?.id === updatedFarm.id) {
      setCurrentFarm(updatedFarm)
    }
  }

  return (
    <FarmContext.Provider value={{
      currentUser,
      currentFarm,
      farms,
      switchFarm,
      updateFarm,
      isLoading
    }}>
      {children}
    </FarmContext.Provider>
  )
}

export function useFarm() {
  const context = useContext(FarmContext)
  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider')
  }
  return context
}

// Helper functions for zone and device management
export function getZoneCenter(coordinates: [number, number][]): [number, number] {
  const lngs = coordinates.map(coord => coord[0])
  const lats = coordinates.map(coord => coord[1])
  return [
    (Math.min(...lngs) + Math.max(...lngs)) / 2,
    (Math.min(...lats) + Math.max(...lats)) / 2
  ]
}

export function getZoneStatusColor(status: string): string {
  switch (status) {
    case 'optimal': return '#10b981'
    case 'irrigating': return '#3b82f6'
    case 'scheduled': return '#f59e0b'
    case 'maintenance': return '#ef4444'
    default: return '#6b7280'
  }
}
