import SideBar from '@/components/sidebar'
import React, { ReactNode } from 'react'

interface BlogsLayoutProps {
  children: ReactNode
}

const BlogsLayout: React.FC<BlogsLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-1 overflow-hidden bg-[#0a0a0a] min-h-0">
      <SideBar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

export default BlogsLayout