"use client"

import BlogCard from '@/components/BlogCard'
import Loading from '@/components/loading'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { useAppData } from '@/context/AppContext'
import { SlidersHorizontal, Film, Clapperboard, PenSquare, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import React from 'react'

const Blogs = () => {
  const { toggleSidebar } = useSidebar()
  const { blogLoading, blogs, isAuth } = useAppData()
  const router = useRouter()

  const handleWriteReview = () => {
    if (!isAuth) {
      toast.error("Please login to write a review", {
        icon: "🔒",
      })
      router.push("/login")
      return
    }
    router.push("/blog/new")
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-white/5">
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

            {/* Right — buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={toggleSidebar}
                className="flex items-center gap-2 px-5 h-10 border-white/10 bg-white/5 text-[#c6c2c2] hover:bg-white/10 hover:text-white hover:border-white/20 rounded-lg transition-all"
              >
                <SlidersHorizontal size={15} />
                <span className="text-sm">Filter by Genre</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Write Review Banner */}
      <div className="relative overflow-hidden border-b border-white/5 bg-[#0d0d0d]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5c518]/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 w-[300px] h-full bg-[#f5c518] blur-[100px] opacity-[0.03] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Icon badge */}
            <div className="w-10 h-10 rounded-xl bg-[#f5c518]/10 border border-[#f5c518]/20 flex items-center justify-center shrink-0">
              <PenSquare size={16} className="text-[#f5c518]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#f0ece3]">
                Share your take on a film
              </p>
              <p className="text-xs text-[#555555] mt-0.5">
                {isAuth
                  ? "Your next review is one click away."
                  : "Sign in to publish your review and join the conversation."}
              </p>
            </div>
          </div>

          <button
            onClick={handleWriteReview}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f5c518] text-[#0a0a0a] text-xs font-bold hover:bg-[#f5c518]/90 active:scale-95 transition-all shrink-0"
          >
            {isAuth ? (
              <>
                <PenSquare size={13} />
                Write a Review
              </>
            ) : (
              <>
                <Lock size={13} />
                Login to Write
              </>
            )}
          </button>
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