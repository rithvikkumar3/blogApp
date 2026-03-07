"use client"

import React, { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"
import Cookies from "js-cookie"
import toast from "react-hot-toast"
import { useAppData, blog_service } from "@/context/AppContext"
import { Calendar, BookmarkX, Clapperboard, Star, Bookmark } from "lucide-react"
import Loading from "@/components/loading"

function extractRating(text: string): number | null {
  const match = text.match(/\[rating:(\d+(?:\.\d+)?)\]/i)
  return match ? parseFloat(match[1]) : null
}

const SavedBlogs = () => {
  const router = useRouter()
  const { savedBlogs, blogs, getSavedBlogs, isAuth, loading } = useAppData()

  useEffect(() => {
    if (!loading && !isAuth) router.push("/login")
  }, [loading, isAuth, router])

  if (loading) return <Loading />
  if (!isAuth) return null

  const savedBlogPosts = blogs.filter(blog =>
    savedBlogs.some(s => String(s.blogid) === String(blog.id))
  )

  // Take up to 4 most recent for the sidebar preview
  const recentSaved = [...savedBlogPosts].slice(0, 4)

  async function removeSaved(blogid: string) {
    try {
      const token = Cookies.get("token")
      const { data } = await axios.post<{ message: string }>(
        `${blog_service}/api/v1/save/${blogid}`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(data.message)
      await getSavedBlogs()
    } catch {
      toast.error("Failed to update watchlist")
    }
  }

  return (
    <div className="flex-1 bg-[#0a0a0a] flex overflow-hidden">

      {/* ── LEFT — main watchlist grid ── */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-white/5">

        {/* Header */}
        <div className="px-7 py-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2 text-[#f5c518] mb-2">
            <Clapperboard size={13} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">My Watchlist</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Saved Reviews</h1>
          <p className="text-[#555555] text-xs mt-1">
            {savedBlogPosts.length > 0
              ? `${savedBlogPosts.length} ${savedBlogPosts.length === 1 ? "review" : "reviews"} saved`
              : "Films you bookmark will appear here"}
          </p>
        </div>

        {/* Grid — scrollable */}
        <div className="flex-1 overflow-y-auto px-7 py-5">
          {savedBlogPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-60">
              <BookmarkX className="w-12 h-12 text-[#2a2a2a]" />
              <div className="text-center">
                <p className="text-[#888888] font-medium">Your watchlist is empty</p>
                <p className="text-[#444444] text-sm mt-1">Bookmark reviews to save them here</p>
              </div>
              <Link href="/blogs"
                className="mt-1 px-5 py-2 rounded-xl bg-[#f5c518] text-[#0a0a0a] text-sm font-bold hover:bg-[#f5c518]/90 transition">
                Discover Reviews
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {savedBlogPosts.map(blog => {
                const rating = extractRating(blog.description)
                return (
                  <div key={blog.id}
                    className="group border border-white/5 rounded-xl overflow-hidden bg-[#111111] hover:border-[#f5c518]/20 transition-all duration-300">
                    <Link href={`/blog/${blog.id}`}>
                      <div className="relative h-36 w-full overflow-hidden">
                        <Image src={blog.image} alt={blog.title} fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-70" />
                        {rating !== null && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-md px-2 py-0.5">
                            <Star size={9} className="text-[#f5c518] fill-[#f5c518]" />
                            <span className="text-xs font-bold text-white">{rating}</span>
                          </div>
                        )}
                        {blog.category && (
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#f5c518] text-[#0a0a0a]">
                              {blog.category}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-3">
                      <Link href={`/blog/${blog.id}`}>
                        <h2 className="font-bold text-sm text-[#f0ece3] hover:text-[#f5c518] transition line-clamp-1 mb-1">
                          {blog.title}
                        </h2>
                      </Link>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-[#555555]">
                          <Calendar size={9} />
                          {new Date(blog.created_at).toLocaleDateString("en-GB")}
                        </div>
                        <button onClick={() => removeSaved(blog.id)}
                          className="flex items-center gap-1 text-[10px] text-[#444444] hover:text-red-400 transition font-medium">
                          <BookmarkX size={11} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT — watchlist summary sidebar ── */}
      <div className="w-[300px] shrink-0 bg-[#0d0d0d] flex flex-col overflow-hidden">

        {/* Sidebar header */}
        <div className="px-5 py-5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <Bookmark size={13} className="text-[#f5c518]" />
            <span className="text-xs font-semibold text-[#f0ece3] uppercase tracking-widest">Quick View</span>
          </div>
          <p className="text-[10px] text-[#444444] mt-1">Recently saved</p>
        </div>

        {/* Recent saved list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {recentSaved.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30 gap-2">
              <Bookmark size={24} className="text-[#333333]" />
              <p className="text-xs text-[#444444] text-center">Nothing saved yet</p>
            </div>
          ) : (
            recentSaved.map(blog => {
              const rating = extractRating(blog.description)
              return (
                <Link key={blog.id} href={`/blog/${blog.id}`}
                  className="flex gap-3 p-2.5 rounded-xl bg-[#111111] border border-white/5 hover:border-[#f5c518]/20 transition group">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                    <Image src={blog.image} alt={blog.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <h3 className="text-xs font-semibold text-[#f0ece3] group-hover:text-[#f5c518] transition line-clamp-2 leading-snug">
                      {blog.title}
                    </h3>
                    {rating !== null && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={9} className="text-[#f5c518] fill-[#f5c518]" />
                        <span className="text-[10px] font-bold text-[#f5c518]">{rating}/10</span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })
          )}
        </div>

        {/* Stats footer */}
        <div className="px-5 py-4 border-t border-white/5 shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#111111] rounded-xl p-3 border border-white/5 text-center">
              <p className="text-xl font-black text-[#f5c518]">{savedBlogPosts.length}</p>
              <p className="text-[9px] text-[#555555] uppercase tracking-widest mt-0.5">Saved</p>
            </div>
            <div className="bg-[#111111] rounded-xl p-3 border border-white/5 text-center">
              <p className="text-xl font-black text-white">
                {savedBlogPosts.length > 0
                  ? (() => {
                      const rated = savedBlogPosts.map(b => extractRating(b.description)).filter(Boolean) as number[]
                      return rated.length ? (rated.reduce((a, b) => a + b, 0) / rated.length).toFixed(1) : "—"
                    })()
                  : "—"}
              </p>
              <p className="text-[9px] text-[#555555] uppercase tracking-widest mt-0.5">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default SavedBlogs