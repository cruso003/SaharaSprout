"use client"

import { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export function DashboardLayout({ 
  children, 
  title = "Farm Dashboard", 
  description 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 shrink-0 border-r">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header title={title} description={description} />
          
          <main className="flex-1 overflow-auto">
            <div className="container max-w-none px-6 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
