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
  const { loading, blogLoading, blogs } = useAppData()

  if (loading) return <Loading />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Latest Blogs
        </h1>

        <Button
          onClick={toggleSidebar}
          className="flex items-center gap-2 px-4"
        >
          <Filter size={18} />
          <span>Filter Blogs</span>
        </Button>
      </div>

      {/* Content */}
      {blogLoading ? (
        <Loading />
      ) : blogs?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            No Blogs Yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {blogs.map((e) => (
            <BlogCard
              key={e.id} 
              image={e.image}
              title={e.title}
              description={e.description}
              id={e.id}
              time={e.created_at}
            />
          ))}
        </div>
      )}

    </div>
  )
}

export default Blogs