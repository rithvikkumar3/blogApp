"use client"

import BlogCard from '@/components/BlogCard'
import Loading from '@/components/loading'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { useAppData } from '@/context/AppContext'
import { SlidersHorizontal, Film, Clapperboard } from 'lucide-react'
import React from 'react'

const Blogs = () => {
  const { toggleSidebar } = useSidebar()
  const { blogLoading, blogs } = useAppData()

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-white/5">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#f5c518] blur-[120px] opacity-[0.04] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">

            {/* Left — headline */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#f5c518]">
                <Clapperboard size={16} strokeWidth={2} />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Film Reviews
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                What will you<br />
                <span className="text-[#f5c518]">watch next?</span>
              </h1>
              <p className="text-[#666666] text-sm max-w-md">
                Honest reviews, hot takes, and deep dives into the films that matter.
              </p>
            </div>

            {/* Right — filter button */}
            <Button
              variant="outline"
              onClick={toggleSidebar}
              className="flex items-center gap-2 px-5 h-10 border-white/10 bg-white/5 text-[#888888] hover:bg-white/10 hover:text-white hover:border-white/20 rounded-lg transition-all shrink-0"
            >
              <SlidersHorizontal size={15} />
              <span className="text-sm">Filter by Genre</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {blogLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loading />
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <Film className="w-7 h-7 text-[#444444]" />
            </div>
            <div>
              <p className="text-[#888888] text-lg font-medium">No reviews found</p>
              <p className="text-[#444444] text-sm mt-1">Try a different genre or search term</p>
            </div>
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="text-[#555555] text-xs uppercase tracking-widest mb-6 font-medium">
              {blogs.length} {blogs.length === 1 ? "review" : "reviews"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {blogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  image={blog.image}
                  title={blog.title}
                  description={blog.description}
                  id={blog.id}
                  createdAt={blog.created_at}
                  category={blog.category}
                />
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  )
}

export default Blogs