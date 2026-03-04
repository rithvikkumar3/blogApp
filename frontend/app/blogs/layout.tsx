import SideBar from '@/components/sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import React, { ReactNode } from 'react'


interface BlogsProps {
  children: ReactNode
}

const HomeLayout: React.FC<BlogsProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex w-full">
        <SideBar />

        <main className="flex-1 transition-all duration-300">
          <div className="w-full min-h-[calc(100vh-45px)] px-4">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default HomeLayout