import SideBar from '@/components/sidebar'
import React, { ReactNode } from 'react'

interface BlogsLayoutProps {
  children: ReactNode
}

const BlogsLayout: React.FC<BlogsLayoutProps> = ({ children }) => {
  return (
    <div className="flex w-full">
      <SideBar />
      <main className="flex-1 transition-all duration-300">
        <div className="w-full min-h-[calc(100vh-65px)]">
          {children}
        </div>
      </main>
    </div>
  )
}

export default BlogsLayout