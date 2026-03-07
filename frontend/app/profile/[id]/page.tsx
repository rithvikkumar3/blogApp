"use client"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { useAppData, user_service } from "@/context/AppContext"
import React, { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "next/navigation"
import Loading from "@/components/loading"
import { Instagram, Linkedin, Film, Star, Bookmark } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import BlogCard from "@/components/BlogCard"

interface Author {
  _id: string; name: string; email: string
  image: string; instagram: string; linkedin: string; bio: string
}

function extractRating(text: string): number | null {
  const match = text.match(/\[rating:(\d+(?:\.\d+)?)\]/i)
  return match ? parseFloat(match[1]) : null
}

const UserProfilePage = () => {
  const { blogs, savedBlogs } = useAppData()
  const params = useParams()
  const userid = params.id as string

  const [user, setUser] = useState<Author | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userid) return
    axios.get<Author>(`${user_service}/api/v1/user/${userid}`)
      .then(r => setUser(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }, [userid])

  if (loading) return <Loading />
  if (!user) {
    return (
      <div className="flex items-center justify-center flex-1 bg-[#0a0a0a]">
        <p className="text-[#555555]">User not found</p>
      </div>
    )
  }

  const userBlogs = blogs.filter(b => String(b.author) === String(user._id))
  const ratings = userBlogs.map(b => extractRating(b.description)).filter(Boolean) as number[]
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null

  const savedTheirReviews = blogs.filter(b =>
    String(b.author) === String(user._id) &&
    savedBlogs.some(s => String(s.blogid) === String(b.id))
  )

  return (
    <div className="flex-1 bg-[#0a0a0a] flex overflow-hidden">

      {/* ── LEFT — profile info + reviews grid ── */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-white/5">

        {/* Profile header */}
        <div className="px-7 py-6 border-b border-white/5 shrink-0">

          {/* Banner strip */}
          <div className="h-20 rounded-xl bg-gradient-to-br from-[#1a1600] via-[#111111] to-[#0d0d0d] relative overflow-hidden mb-0">
            <div className="absolute inset-0 bg-[#f5c518] opacity-[0.04]" />
          </div>

          {/* Avatar + info row */}
          <div className="flex items-end justify-between -mt-10 mb-4 px-1">
            <Avatar className="w-20 h-20 ring-4 ring-[#0a0a0a] shrink-0">
              <AvatarImage src={user.image} alt={user.name} />
            </Avatar>
            <div className="flex gap-2 mb-1">
              {user.instagram && (
                <a href={user.instagram} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[#888888] hover:text-pink-400 hover:border-pink-400/20 transition text-xs font-medium">
                  <Instagram size={12} /> Instagram
                </a>
              )}
              {user.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[#888888] hover:text-blue-400 hover:border-blue-400/20 transition text-xs font-medium">
                  <Linkedin size={12} /> LinkedIn
                </a>
              )}
            </div>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">{user.name}</h2>
          <p className="text-xs text-[#555555] mt-0.5">{user.email}</p>
          {user.bio && (
            <p className="text-xs text-[#888888] mt-2.5 max-w-lg leading-relaxed border-l-2 border-[#f5c518]/20 pl-3">
              {user.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex gap-3 mt-5">
            {[
              { value: userBlogs.length, label: "Reviews" },
              { value: avgRating ?? "—", label: "Avg Rating" },
            ].map(stat => (
              <div key={stat.label} className="bg-[#111111] border border-white/5 rounded-xl px-5 py-2.5 text-center">
                <p className="text-lg font-black text-[#f5c518]">{stat.value}</p>
                <p className="text-[9px] text-[#555555] uppercase tracking-widest mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews grid — scrollable */}
        <div className="flex-1 overflow-y-auto px-7 py-5">
          <div className="flex items-center gap-2 mb-4">
            <Film size={13} className="text-[#f5c518]" />
            <h3 className="text-xs font-bold text-[#f0ece3] uppercase tracking-widest">
              Reviews by {user.name}
            </h3>
            {userBlogs.length > 0 && (
              <span className="text-[10px] text-[#444444]">({userBlogs.length})</span>
            )}
          </div>

          {userBlogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 opacity-40 gap-2">
              <Film size={28} className="text-[#222222]" />
              <p className="text-xs text-[#444444]">No reviews published yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {userBlogs.map(blog => (
                <BlogCard
                  key={blog.id}
                  image={blog.image}
                  title={blog.title}
                  description={blog.description}
                  id={blog.id}
                  createdAt={blog.created_at}
                  category={blog.category}
                  compact
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT — saved from this author ── */}
      <div className="w-[280px] shrink-0 bg-[#0d0d0d] flex flex-col overflow-hidden">
        <div className="px-5 py-5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <Bookmark size={13} className="text-[#f5c518]" />
            <span className="text-xs font-semibold text-[#f0ece3] uppercase tracking-widest">
              In Your Watchlist
            </span>
          </div>
          <p className="text-[10px] text-[#444444] mt-1">
            {savedTheirReviews.length > 0
              ? `${savedTheirReviews.length} review${savedTheirReviews.length > 1 ? "s" : ""} saved from ${user.name}`
              : `Reviews by ${user.name} you've saved`}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {savedTheirReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30 gap-3 text-center px-4">
              <Bookmark size={24} className="text-[#333333]" />
              <p className="text-xs text-[#444444]">
                None of {user.name}&apos;s reviews are in your watchlist yet
              </p>
            </div>
          ) : (
            savedTheirReviews.map(blog => {
              const rating = extractRating(blog.description)
              return (
                <Link key={blog.id} href={`/blog/${blog.id}`}
                  className="flex gap-3 p-2.5 rounded-xl bg-[#111111] border border-white/5 hover:border-[#f5c518]/20 transition group">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                    <Image src={blog.image} alt={blog.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <h3 className="text-xs font-semibold text-[#f0ece3] group-hover:text-[#f5c518] transition line-clamp-2 leading-snug">
                      {blog.title}
                    </h3>
                    {rating !== null && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={8} className="text-[#f5c518] fill-[#f5c518]" />
                        <span className="text-[10px] text-[#f5c518] font-bold">{rating}/10</span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })
          )}
        </div>

        {/* All reviews CTA */}
        <div className="px-5 py-4 border-t border-white/5 shrink-0">
          <div className="bg-[#111111] border border-white/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-[#f5c518]">{userBlogs.length}</p>
            <p className="text-[9px] text-[#555555] uppercase tracking-widest mt-0.5">Total Reviews</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage