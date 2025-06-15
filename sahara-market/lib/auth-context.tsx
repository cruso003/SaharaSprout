"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'buyer' | 'farmer'
  joinedDate: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, role?: 'buyer' | 'farmer') => Promise<void>
  logout: () => void
  signup: (name: string, email: string, password: string, role: 'buyer' | 'farmer') => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('sahara-user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        localStorage.removeItem('sahara-user')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string, role: 'buyer' | 'farmer' = 'buyer') => {
    setIsLoading(true)
    
    // Simulate API call - in real app this would be an actual API request
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock authentication - in real app this would validate against backend
    if (email && password) {
      const mockUser: User = {
        id: `user_${Date.now()}`,
        name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email,
        avatar: `/api/placeholder/60/60`,
        role,
        joinedDate: new Date().toISOString().split('T')[0]
      }
      
      setUser(mockUser)
      localStorage.setItem('sahara-user', JSON.stringify(mockUser))
    } else {
      throw new Error('Invalid credentials')
    }
    
    setIsLoading(false)
  }

  const signup = async (name: string, email: string, password: string, role: 'buyer' | 'farmer') => {
    setIsLoading(true)
    
    // Simulate API call - in real app this would be an actual API request
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock user creation - in real app this would create user in backend
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      avatar: `/api/placeholder/60/60`,
      role,
      joinedDate: new Date().toISOString().split('T')[0]
    }
    
    setUser(newUser)
    localStorage.setItem('sahara-user', JSON.stringify(newUser))
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('sahara-user')
  }

  const value = {
    user,
    isLoading,
    login,
    logout,
    signup
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
