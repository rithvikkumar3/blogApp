"use client"

import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { useAppData, user_service, User } from '@/context/AppContext'
import React, { useRef, useState, useEffect } from 'react'
import Cookies from "js-cookie"
import axios from 'axios'
import toast from 'react-hot-toast'
import Loading from '@/components/loading'
import { Instagram, Linkedin, Camera, LogOut, PenSquare, Settings, Film, Star, Bookmark } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import BlogCard from '@/components/BlogCard'

function extractRating(text: string): number | null {
  const match = text.match(/\[rating:(\d+(?:\.\d+)?)\]/i)
  return match ? parseFloat(match[1]) : null
}

const ProfilePage = () => {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { user, setUser, logoutUser, isAuth, loading: authLoading, blogs, savedBlogs } = useAppData()

  const [formData, setFormData] = useState({
    name: "", instagram: "", linkedin: "", bio: "",
  })

  useEffect(() => {
    if (!authLoading && !isAuth) router.push("/login")
  }, [authLoading, isAuth, router])

  useEffect(() => {
    if (user) setFormData({ name: user.name || "", instagram: user.instagram || "", linkedin: user.linkedin || "", bio: user.bio || "" })
  }, [user])

  const changeHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append("file", file)
    try {
      setLoading(true)
      const token = Cookies.get("token")
      const { data } = await axios.post<{ message: string; token: string; user: User }>(
        `${user_service}/api/v1/user/update/pic`, form,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(data.message)
      Cookies.set("token", data.token, { expires: 5, secure: true, path: "/" })
      setUser(data.user)
    } catch { toast.error("Image update failed") }
    finally { setLoading(false) }
  }

  const handleFormSubmit = async () => {
    try {
      setLoading(true)
      const token = Cookies.get("token")
      const { data } = await axios.post<{ message: string; token: string; user: User }>(
        `${user_service}/api/v1/user/update`, formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(data.message)
      Cookies.set("token", data.token, { expires: 5, secure: true, path: "/" })
      setUser(data.user)
      setOpen(false)
    } catch { toast.error("Profile update failed") }
    finally { setLoading(false) }
  }

  if (authLoading || loading) return <Loading />
  if (!user) return null

  const myBlogs = blogs.filter(b => String(b.author) === String(user._id))
  const myRatings = myBlogs.map(b => extractRating(b.description)).filter(Boolean) as number[]
  const avgRating = myRatings.length ? (myRatings.reduce((a, b) => a + b, 0) / myRatings.length).toFixed(1) : null
  const watchlistPosts = blogs.filter(blog => savedBlogs.some(s => String(s.blogid) === String(blog.id))).slice(0, 5)

  return (
    <div className="flex-1 bg-[#0a0a0a] flex overflow-hidden">

      {/* ── LEFT ── */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-white/5">

        {/* Profile header */}
        <div className="px-7 py-6 border-b border-white/5 shrink-0">

          {/* Top row — avatar + info + actions all in one line */}
          <div className="flex items-center gap-5">

            {/* Avatar */}
            <div className="relative group cursor-pointer shrink-0" onClick={() => inputRef.current?.click()}>
              <Avatar className="w-16 h-16 ring-2 ring-white/10 group-hover:ring-[#f5c518]/40 transition">
                <AvatarImage src={user.image} alt={user.name} />
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={changeHandler} />
            </div>

            {/* Name + email + socials */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white tracking-tight truncate">{user.name}</h2>
              <p className="text-xs text-[#555555] mt-0.5 truncate">{user.email}</p>
              {user.bio && (
                <p className="text-xs text-[#888888] mt-1.5 leading-relaxed border-l-2 border-[#f5c518]/20 pl-2.5 line-clamp-1">
                  {user.bio}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                {user.instagram && (
                  <a href={user.instagram} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[#888888] hover:text-pink-400 transition text-[10px] font-medium">
                    <Instagram size={9} /> Instagram
                  </a>
                )}
                {user.linkedin && (
                  <a href={user.linkedin} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[#888888] hover:text-blue-400 transition text-[10px] font-medium">
                    <Linkedin size={9} /> LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Action buttons — flush right, all in one row */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Write Review — primary */}
              <button
                onClick={() => router.push("/blog/new")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#f5c518] text-[#0a0a0a] text-xs font-bold hover:bg-[#f5c518]/90 transition whitespace-nowrap"
              >
                <PenSquare size={12} />
                Write Review
              </button>

              {/* Edit — secondary */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[#888888] hover:text-white hover:border-white/20 text-xs font-medium transition whitespace-nowrap">
                    <Settings size={12} />
                    Edit
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px] rounded-2xl bg-[#111111] border border-white/10 text-[#f0ece3]">
                  <DialogHeader>
                    <DialogTitle className="text-sm font-bold text-white">Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    {[
                      { label: "Name", key: "name" },
                      { label: "Bio", key: "bio" },
                      { label: "Instagram URL", key: "instagram" },
                      { label: "LinkedIn URL", key: "linkedin" },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <Label className="text-[10px] text-[#666666] uppercase tracking-wider mb-1.5 block">{label}</Label>
                        <Input
                          value={formData[key as keyof typeof formData]}
                          onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                          className="bg-[#161616] border-white/10 text-[#f0ece3] focus:border-[#f5c518]/40 h-9 text-sm"
                        />
                      </div>
                    ))}
                    <button
                      onClick={handleFormSubmit}
                      className="w-full py-2.5 rounded-xl bg-[#f5c518] text-[#0a0a0a] font-bold text-sm hover:bg-[#f5c518]/90 transition mt-2">
                      Save Changes
                    </button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Logout — danger */}
              <button
                onClick={logoutUser}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[#888888] hover:text-red-400 hover:border-red-400/20 text-xs font-medium transition whitespace-nowrap"
              >
                <LogOut size={12} />
                Logout
              </button>

            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-3 mt-5">
            {[
              { value: myBlogs.length, label: "Reviews" },
              { value: avgRating ?? "—", label: "Avg Rating" },
              { value: savedBlogs.length, label: "Watchlist" },
            ].map(stat => (
              <div key={stat.label} className="flex-1 bg-[#111111] border border-white/5 rounded-xl px-3 py-2.5 text-center">
                <p className="text-lg font-black text-[#f5c518]">{stat.value}</p>
                <p className="text-[9px] text-[#555555] uppercase tracking-widest mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* My reviews grid */}
        <div className="flex-1 overflow-y-auto px-7 py-5">
          <div className="flex items-center gap-2 mb-4">
            <Film size={13} className="text-[#f5c518]" />
            <h3 className="text-xs font-bold text-[#f0ece3] uppercase tracking-widest">My Reviews</h3>
          </div>

          {myBlogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 opacity-40 gap-2">
              <Film size={28} className="text-[#222222]" />
              <p className="text-xs text-[#444444]">No reviews published yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {myBlogs.map(blog => (
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

      {/* ── RIGHT — watchlist ── */}
      <div className="w-[280px] shrink-0 bg-[#0d0d0d] flex flex-col overflow-hidden">
        <div className="px-5 py-5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <Bookmark size={13} className="text-[#f5c518]" />
            <span className="text-xs font-semibold text-[#f0ece3] uppercase tracking-widest">Watchlist</span>
          </div>
          <p className="text-[10px] text-[#444444] mt-1">{savedBlogs.length} saved</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {watchlistPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30 gap-2">
              <Bookmark size={24} className="text-[#333333]" />
              <p className="text-xs text-[#444444] text-center">Nothing in watchlist</p>
            </div>
          ) : (
            watchlistPosts.map(blog => {
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

        {savedBlogs.length > 5 && (
          <div className="px-5 py-3 border-t border-white/5 shrink-0">
            <Link href="/blog/saved"
              className="flex items-center justify-center w-full py-2 rounded-lg border border-white/10 text-[#555555] hover:text-[#f5c518] hover:border-[#f5c518]/20 transition text-xs font-medium">
              View all {savedBlogs.length} saved →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage