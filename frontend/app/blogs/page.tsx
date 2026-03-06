"use client"

import BlogCard from '@/components/BlogCard'
import Loading from '@/components/loading'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { useAppData } from '@/context/AppContext'
import { Filter } from 'lucide-react'
import React from 'react'

const Blogs = () => {
  const { toggleSidebar } = useSidebar()
  const { blogLoading, blogs } = useAppData()

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Latest Blogs
        </h1>

        <Button
          variant="outline"
          onClick={toggleSidebar}
          className="flex items-center gap-2 px-4"
        >
          <Filter size={16} />
          <span>Filter</span>
        </Button>
      </div>

      {/* Content */}
      {blogLoading ? (
        <Loading />
      ) : blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-muted-foreground text-lg">No blogs found</p>
          <p className="text-muted-foreground text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              image={blog.image}
              title={blog.title}
              description={blog.description}
              id={blog.id}
              createdAt={blog.created_at}
            />
          ))}
        </div>
      )}

    </div>
  )
}

export default Blogs