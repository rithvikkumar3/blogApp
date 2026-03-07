"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import Image from 'next/image'
import { author_service, blog_service, useAppData, blogCategories, Blog, User } from '@/context/AppContext'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import { Clapperboard, RefreshCw, Star } from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'

interface BlogResponse { blog: Blog; author: User }

function extractRatingFromDesc(desc: string): string {
  const match = desc.match(/\[rating:(\d+(?:\.\d+)?)\]/i)
  return match ? match[1] : ""
}
function stripRatingFromDesc(desc: string): string {
  return desc.replace(/\[rating:\d+(?:\.\d+)?\]\s*/i, "").trim()
}

const EditBlogPage = () => {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const router = useRouter()
  const { fetchBlogs, isAuth, loading: authLoading, user } = useAppData()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isFetching, setIsFetching] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [existingImage, setExistingImage] = useState<string | null>(null)
  const [editorContent, setEditorContent] = useState("")
  const [rating, setRating] = useState("")
  const [formData, setFormData] = useState({
    title: "", description: "", category: "", image: null as File | null
  })

  useEffect(() => {
    if (!authLoading && !isAuth) router.push("/login")
  }, [authLoading, isAuth, router])

  useEffect(() => {
    if (!id || authLoading) return
    const fetchBlog = async () => {
      try {
        const { data } = await axios.get<BlogResponse>(`${blog_service}/api/v1/blog/${id}`)
        const blog = data.blog
        if (user && String(blog.author) !== String(user._id)) {
          toast.error("Not authorized to edit this review")
          router.push("/blogs"); return
        }
        setRating(extractRatingFromDesc(blog.description || ""))
        setFormData({
          title: blog.title || "",
          description: stripRatingFromDesc(blog.description || ""),
          category: blog.category?.trim() || "",
          image: null
        })
        setEditorContent(blog.blogContent || "")
        setExistingImage(blog.image || null)
      } catch { toast.error("Failed to load review") }
      finally { setIsFetching(false) }
    }
    fetchBlog()
  }, [id, authLoading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsUpdating(true)
      const token = Cookies.get("token")
      const ratingNum = parseFloat(rating)
      const descWithRating = rating && !isNaN(ratingNum) && ratingNum >= 1 && ratingNum <= 10
        ? `[rating:${ratingNum}] ${formData.description}` : formData.description

      const fd = new FormData()
      fd.append("title", formData.title)
      fd.append("description", descWithRating)
      fd.append("category", formData.category)
      fd.append("blogContent", editorContent)
      if (formData.image) fd.append("file", formData.image)

      await axios.post(`${author_service}/api/v1/blog/${id}`, fd, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success("Review updated")
      await fetchBlogs()
      router.push(`/blog/${id}`)
    } catch { toast.error("Failed to update review") }
    finally { setIsUpdating(false) }
  }

  if (isFetching || authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-white/10 border-t-[#f5c518] rounded-full animate-spin" />
          <p className="text-xs text-[#555555] uppercase tracking-widest">Loading review...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#0a0a0a] flex overflow-hidden">

      {/* ── LEFT — editor ── */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-white/5">
        <div className="px-6 py-4 border-b border-white/5 shrink-0 flex items-center gap-2">
          <Clapperboard size={14} className="text-[#f5c518]" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f5c518]">Edit Review</span>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <RichTextEditor
            value={editorContent}
            onChange={setEditorContent}
            placeholder="Update your film review..."
          />
        </div>
      </div>

      {/* ── RIGHT — metadata sidebar ── */}
      <form
        onSubmit={handleSubmit}
        className="w-[320px] shrink-0 bg-[#0d0d0d] flex flex-col overflow-hidden"
      >
        {/* Header + update btn */}
        <div className="px-5 py-4 border-b border-white/5 shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-white">Update Review</h1>
            <p className="text-[10px] text-[#555555] mt-0.5">Edit details below</p>
          </div>
          <button type="submit" disabled={isUpdating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#f5c518] text-[#0a0a0a] text-xs font-bold hover:bg-[#f5c518]/90 transition hover:shadow-[0_0_20px_rgba(245,197,24,0.2)] disabled:opacity-60">
            {isUpdating ? <RefreshCw size={11} className="animate-spin" /> : <Clapperboard size={11} />}
            {isUpdating ? "Saving..." : "Update"}
          </button>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          <div className="space-y-1.5">
            <Label className="text-[10px] text-[#555555] uppercase tracking-widest font-semibold">Film Title</Label>
            <Input name="title" required value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              className="h-9 text-sm bg-[#161616] border-white/10 text-[#f0ece3] focus:border-[#f5c518]/40" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] text-[#555555] uppercase tracking-widest font-semibold">Description</Label>
            <Input name="description" required value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              className="h-9 text-sm bg-[#161616] border-white/10 text-[#f0ece3] focus:border-[#f5c518]/40" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] text-[#555555] uppercase tracking-widest font-semibold">Genre</Label>
            <Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v }))}>
              <SelectTrigger className="h-9 text-sm bg-[#161616] border-white/10 text-[#f0ece3] focus:border-[#f5c518]/40">
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent className="bg-[#161616] border-white/10 text-[#f0ece3]">
                {blogCategories.map(cat => (
                  <SelectItem key={cat} value={cat} className="focus:bg-white/5">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] text-[#555555] uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <Star size={9} className="text-[#f5c518]" /> Rating (1–10)
            </Label>
            <Input type="number" min="1" max="10" step="0.5"
              value={rating} onChange={e => setRating(e.target.value)} placeholder="8.5"
              className="h-9 text-sm bg-[#161616] border-white/10 text-[#f0ece3] placeholder:text-[#333333] focus:border-[#f5c518]/40" />
            {rating && !isNaN(parseFloat(rating)) && (
              <div className="flex items-center gap-1.5">
                <Star size={10} className="text-[#f5c518] fill-[#f5c518]" />
                <span className="text-xs font-bold text-[#f5c518]">{parseFloat(rating)}/10</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] text-[#555555] uppercase tracking-widest font-semibold">Cover Image</Label>
            <div onClick={() => fileInputRef.current?.click()}
              className="h-9 px-3 flex items-center rounded-lg border border-white/10 bg-[#161616] text-[#555555] text-xs cursor-pointer hover:border-[#f5c518]/30 hover:text-[#888888] transition">
              {formData.image
                ? <span className="text-[#f0ece3] truncate">{formData.image.name}</span>
                : <span>Replace image...</span>}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => setFormData(p => ({ ...p, image: e.target.files?.[0] ?? null }))} />

            {existingImage && !formData.image && (
              <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/5 mt-2">
                <Image src={existingImage} alt="Current cover" fill className="object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-2 left-2.5 text-[9px] text-white/50 uppercase tracking-wider font-medium">Current</span>
              </div>
            )}
          </div>

        </div>
      </form>
    </div>
  )
}

export default EditBlogPage