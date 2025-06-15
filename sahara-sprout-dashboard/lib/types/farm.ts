// Farm data types for SaharaSprout SaaS platform

export interface Coordinates {
  lat: number
  lng: number
}

export interface Zone {
  id: string
  farmId: string
  name: string
  crop: string
  coordinates: [number, number][] // Polygon coordinates
  moisture: number
  status: 'optimal' | 'irrigating' | 'scheduled' | 'maintenance'
  area: string
  lastNpkTest: string
  npkStatus: 'current' | 'due' | 'overdue'
  createdAt: Date
  updatedAt: Date
}

export interface Device {
  id: string
  farmId: string
  type: 'esp32_hub' | 'moisture_sensor' | 'npk_sensor'
  name: string
  coordinates: Coordinates
  status: 'online' | 'offline' | 'maintenance'
  battery?: number
  connectivity?: '4G' | 'WiFi' | 'LoRa'
  lastSeen: Date
}

export interface NPKReading {
  nitrogen: number
  phosphorus: number
  potassium: number
  ph: number
  moisture: number
  temperature: number
  conductivity: number
  timestamp: Date
}

export interface PortableNPKSensor {
  deviceId: string
  currentZoneId: string | null
  coordinates: Coordinates
  lastReading: NPKReading
  status: 'active' | 'idle' | 'charging'
  batteryLevel: number
  lastMoved: Date
}

export interface FarmLocation {
  country: string
  region: string
  city: string
  address?: string
  coordinates: Coordinates
  timezone: string
}

export interface Farm {
  id: string
  name: string
  ownerId: string
  location: FarmLocation
  totalArea: string
  establishedDate: Date
  zones: Zone[]
  devices: Device[]
  npkSensor: PortableNPKSensor
  subscription: {
    plan: 'basic' | 'premium' | 'enterprise'
    status: 'active' | 'suspended' | 'cancelled'
    expiresAt: Date
  }
  settings: {
    irrigationThresholds: {
      start: number // e.g., 40%
      stop: number  // e.g., 60%
    }
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
    autoIrrigation: boolean
  }
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  name: string
  role: 'owner' | 'manager' | 'viewer'
  farms: string[] // Array of farm IDs they can access
  currentFarmId: string | null
  createdAt: Date
}

// Sample farm data for development
export const sampleFarms: Farm[] = [
  {
    id: 'farm_kakata_001',
    name: 'Kakata Demonstration Farm',
    ownerId: 'user_001',
    location: {
      country: 'Liberia',
      region: 'Margibi County',
      city: 'Kakata',
      coordinates: { lat: 6.51875, lng: -10.34675 },
      timezone: 'GMT'
    },
    totalArea: '1,200 m²',
    establishedDate: new Date('2024-03-15'),
    zones: [
      {
        id: 'zone_001',
        farmId: 'farm_kakata_001',
        name: 'Tomatoes',
        crop: 'Cherry Tomatoes',
        coordinates: [
          [-10.3475, 6.5190],
          [-10.3470, 6.5190],
          [-10.3470, 6.5185],
          [-10.3475, 6.5185]
        ],
        moisture: 68,
        status: 'optimal',
        area: '250 m²',
        lastNpkTest: '2 weeks ago',
        npkStatus: 'due',
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date()
      },
      {
        id: 'zone_002',
        farmId: 'farm_kakata_001',
        name: 'Peppers',
        crop: 'Bell Peppers',
        coordinates: [
          [-10.3470, 6.5190],
          [-10.3465, 6.5190],
          [-10.3465, 6.5185],
          [-10.3470, 6.5185]
        ],
        moisture: 42,
        status: 'irrigating',
        area: '180 m²',
        lastNpkTest: '3 weeks ago',
        npkStatus: 'overdue',
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date()
      },
      {
        id: 'zone_003',
        farmId: 'farm_kakata_001',
        name: 'Lettuce',
        crop: 'Mixed Greens',
        coordinates: [
          [-10.3465, 6.5190],
          [-10.3460, 6.5190],
          [-10.3460, 6.5185],
          [-10.3465, 6.5185]
        ],
        moisture: 75,
        status: 'optimal',
        area: '120 m²',
        lastNpkTest: '1 week ago',
        npkStatus: 'current',
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date()
      },
      {
        id: 'zone_004',
        farmId: 'farm_kakata_001',
        name: 'Herbs',
        crop: 'Basil & Parsley',
        coordinates: [
          [-10.3475, 6.5185],
          [-10.3470, 6.5185],
          [-10.3470, 6.5180],
          [-10.3475, 6.5180]
        ],
        moisture: 55,
        status: 'optimal',
        area: '90 m²',
        lastNpkTest: '5 days ago',
        npkStatus: 'current',
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date()
      },
      {
        id: 'zone_005',
        farmId: 'farm_kakata_001',
        name: 'Carrots',
        crop: 'Orange Carrots',
        coordinates: [
          [-10.3470, 6.5185],
          [-10.3465, 6.5185],
          [-10.3465, 6.5180],
          [-10.3470, 6.5180]
        ],
        moisture: 51,
        status: 'optimal',
        area: '200 m²',
        lastNpkTest: '10 days ago',
        npkStatus: 'current',
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date()
      },
      {
        id: 'zone_006',
        farmId: 'farm_kakata_001',
        name: 'Onions',
        crop: 'Red Onions',
        coordinates: [
          [-10.3465, 6.5185],
          [-10.3460, 6.5185],
          [-10.3460, 6.5180],
          [-10.3465, 6.5180]
        ],
        moisture: 38,
        status: 'scheduled',
        area: '160 m²',
        lastNpkTest: '3 weeks ago',
        npkStatus: 'overdue',
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date()
      }
    ],
    devices: [
      {
        id: 'esp32_hub_001',
        farmId: 'farm_kakata_001',
        type: 'esp32_hub',
        name: 'Main ESP32 Hub',
        coordinates: { lat: 6.51875, lng: -10.34675 },
        status: 'online',
        battery: 87,
        connectivity: '4G',
        lastSeen: new Date()
      }
    ],
    npkSensor: {
      deviceId: 'npk_portable_001',
      currentZoneId: 'zone_002',
      coordinates: { lat: 6.51875, lng: -10.34675 },
      lastReading: {
        nitrogen: 45,
        phosphorus: 23,
        potassium: 67,
        ph: 6.8,
        moisture: 42,
        temperature: 24,
        conductivity: 120,
        timestamp: new Date()
      },
      status: 'active',
      batteryLevel: 73,
      lastMoved: new Date()
    },
    subscription: {
      plan: 'premium',
      status: 'active',
      expiresAt: new Date('2025-03-15')
    },
    settings: {
      irrigationThresholds: {
        start: 40,
        stop: 60
      },
      notifications: {
        email: true,
        sms: true,
        push: true
      },
      autoIrrigation: true
    },
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date()
  }
]

export const sampleUsers: User[] = [
  {
    id: 'user_001',
    email: 'farmer@kakata.farm',
    name: 'Samuel Kpayee',
    role: 'owner',
    farms: ['farm_kakata_001'],
    currentFarmId: 'farm_kakata_001',
    createdAt: new Date('2024-03-15')
  }
]
