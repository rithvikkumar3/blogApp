"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw, Clapperboard, Sparkles, Star } from 'lucide-react'
import React, { useRef, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import axios from 'axios'
import { author_service, useAppData, blogCategories } from '@/context/AppContext'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import RichTextEditor from '@/components/RichTextEditor'

interface AiTitleResponse { title: string }
interface AiDescriptionResponse { description: string }
interface AiBlogResponse { html: string }
interface PublishResponse { message: string }

const AddBlog = () => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { fetchBlogs, isAuth, loading: authLoading } = useAppData()

  const [loading, setLoading] = useState(false)
  const [aiTitleLoading, setAiTitleLoading] = useState(false)
  const [aiDescLoading, setAiDescLoading] = useState(false)
  const [aiBlogLoading, setAiBlogLoading] = useState(false)
  const [rating, setRating] = useState("")
  const [formData, setFormData] = useState({
    title: "", description: "", category: "",
    image: null as File | null, blogContent: ""
  })

  useEffect(() => {
    if (!authLoading && !isAuth) router.push("/login")
  }, [authLoading, isAuth, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const ratingNum = parseFloat(rating)
    const descWithRating = rating && !isNaN(ratingNum) && ratingNum >= 1 && ratingNum <= 10
      ? `[rating:${ratingNum}] ${formData.description}` : formData.description

    const fd = new FormData()
    fd.append("title", formData.title)
    fd.append("description", descWithRating)
    fd.append("blogContent", formData.blogContent)
    fd.append("category", formData.category)
    if (formData.image) fd.append("file", formData.image)

    try {
      const token = Cookies.get("token")
      const { data } = await axios.post<PublishResponse>(
        `${author_service}/api/v1/blog/new`, fd,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(data.message)
      await fetchBlogs()
      router.push("/blogs")
    } catch {
      toast.error("Error publishing review!")
    } finally {
      setLoading(false)
    }
  }

  const aiTitleResponse = async () => {
    if (!formData.title) return
    try {
      setAiTitleLoading(true)
      const { data } = await axios.post<AiTitleResponse>(`${author_service}/api/v1/ai/title`, { text: formData.title })
      if (data?.title) setFormData(prev => ({ ...prev, title: data.title }))
    } catch { toast.error("Problem fetching AI title") }
    finally { setAiTitleLoading(false) }
  }

  const aiDescriptionResponse = async () => {
    if (!formData.title && !formData.description) { toast.error("Add a title first"); return }
    try {
      setAiDescLoading(true)
      const { data } = await axios.post<AiDescriptionResponse>(
        `${author_service}/api/v1/ai/description`,
        { title: formData.title, description: formData.description }
      )
      if (data?.description) setFormData(prev => ({ ...prev, description: data.description }))
    } catch { toast.error("Problem generating description") }
    finally { setAiDescLoading(false) }
  }

  const aiBlogResponse = async () => {
    if (!formData.blogContent.trim()) return toast.error("Write something first")
    try {
      setAiBlogLoading(true)
      const { data } = await axios.post<AiBlogResponse>(
        `${author_service}/api/v1/ai/blog`, { blog: formData.blogContent }
      )
      if (data?.html) {
        setFormData(prev => ({ ...prev, blogContent: data.html }))
        toast.success("Writing improved ✨")
      }
    } catch { toast.error("Problem improving content") }
    finally { setAiBlogLoading(false) }
  }

  return (
    <div className="flex-1 bg-[#0a0a0a] flex overflow-hidden">

      {/* ── LEFT — editor ── */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-white/5">

        {/* Editor header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Clapperboard size={14} className="text-[#f5c518]" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f5c518]">New Review</span>
          </div>
          <button
            type="button"
            onClick={aiBlogResponse}
            disabled={aiBlogLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-[#888888] hover:text-[#f5c518] hover:border-[#f5c518]/30 transition text-xs font-medium disabled:opacity-40"
          >
            {aiBlogLoading ? <RefreshCw size={11} className="animate-spin" /> : <Sparkles size={11} />}
            Improve Writing
          </button>
        </div>

        {/* Scrollable editor area */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <RichTextEditor
            value={formData.blogContent}
            onChange={(html) => setFormData(prev => ({ ...prev, blogContent: html }))}
            placeholder="Write your film review here... What did you love? What didn't work?"
          />
        </div>
      </div>

      {/* ── RIGHT — metadata sidebar ── */}
      <form
        onSubmit={handleSubmit}
        className="w-[320px] shrink-0 bg-[#0d0d0d] flex flex-col overflow-hidden"
      >
        {/* Sidebar header + publish btn */}
        <div className="px-5 py-4 border-b border-white/5 shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-white">Publish Review</h1>
            <p className="text-[10px] text-[#555555] mt-0.5">Fill in the details</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#f5c518] text-[#0a0a0a] text-xs font-bold hover:bg-[#f5c518]/90 transition hover:shadow-[0_0_20px_rgba(245,197,24,0.2)] disabled:opacity-60"
          >
            {loading ? <RefreshCw size={11} className="animate-spin" /> : <Clapperboard size={11} />}
            {loading ? "Publishing..." : "Publish"}
          </button>
        </div>

        {/* Fields — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-[10px] text-[#555555] uppercase tracking-widest font-semibold">Film Title</Label>
            <div className="flex gap-2">
              <Input
                name="title" required value={formData.title} onChange={handleInputChange}
                placeholder="e.g. Oppenheimer (2023)"
                className="flex-1 h-9 text-sm bg-[#161616] border-white/10 text-[#f0ece3] placeholder:text-[#333333] focus:border-[#f5c518]/40 focus:ring-[#f5c518]/20"
              />
              <button type="button" onClick={aiTitleResponse} disabled={aiTitleLoading}
                className="h-9 px-2.5 rounded-lg border border-white/10 bg-white/5 text-[#888888] hover:text-[#f5c518] hover:border-[#f5c518]/30 transition disabled:opacity-40 shrink-0">
                {aiTitleLoading ? <RefreshCw size={11} className="animate-spin" /> : <Sparkles size={11} />}
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-[10px] text-[#555555] uppercase tracking-widest font-semibold">Short Description</Label>
            <div className="flex gap-2">
              <Input
                name="description" required value={formData.description} onChange={handleInputChange}
                placeholder="One-line hook..."
                className="flex-1 h-9 text-sm bg-[#161616] border-white/10 text-[#f0ece3] placeholder:text-[#333333] focus:border-[#f5c518]/40 focus:ring-[#f5c518]/20"
              />
              <button type="button" onClick={aiDescriptionResponse} disabled={aiDescLoading}
                className="h-9 px-2.5 rounded-lg border border-white/10 bg-white/5 text-[#888888] hover:text-[#f5c518] hover:border-[#f5c518]/30 transition disabled:opacity-40 shrink-0">
                {aiDescLoading ? <RefreshCw size={11} className="animate-spin" /> : <Sparkles size={11} />}
              </button>
            </div>
          </div>

          {/* Genre */}
          <div className="space-y-1.5">
            <Label className="text-[10px] text-[#555555] uppercase tracking-widest font-semibold">Genre</Label>
            <Select value={formData.category} onValueChange={v => setFormData(prev => ({ ...prev, category: v }))}>
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

          {/* Rating */}
          <div className="space-y-1.5">
            <Label className="text-[10px] text-[#555555] uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <Star size={9} className="text-[#f5c518]" /> Rating (1–10)
            </Label>
            <Input
              type="number" min="1" max="10" step="0.5"
              value={rating} onChange={e => setRating(e.target.value)} placeholder="8.5"
              className="h-9 text-sm bg-[#161616] border-white/10 text-[#f0ece3] placeholder:text-[#333333] focus:border-[#f5c518]/40 focus:ring-[#f5c518]/20"
            />
            {rating && !isNaN(parseFloat(rating)) && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#f5c518]/5 border border-[#f5c518]/10 w-fit">
                <Star size={10} className="text-[#f5c518] fill-[#f5c518]" />
                <span className="text-xs font-bold text-[#f5c518]">{parseFloat(rating)}/10</span>
              </div>
            )}
          </div>

          {/* Cover image */}
          <div className="space-y-1.5">
            <Label className="text-[10px] text-[#555555] uppercase tracking-widest font-semibold">Cover Image</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-3 flex items-center rounded-lg border border-white/10 bg-[#161616] text-[#555555] text-xs cursor-pointer hover:border-[#f5c518]/30 hover:text-[#888888] transition"
            >
              {formData.image ? (
                <span className="text-[#f0ece3] truncate">{formData.image.name}</span>
              ) : (
                <span>Choose file...</span>
              )}
            </div>
            <input
              ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => setFormData(prev => ({ ...prev, image: e.target.files?.[0] ?? null }))}
            />
          </div>

          {/* Tips */}
          <div className="rounded-xl bg-[#111111] border border-white/5 p-4 space-y-2">
            <p className="text-[10px] font-semibold text-[#f5c518] uppercase tracking-widest">Writing Tips</p>
            {[
              "Start with your gut reaction",
              "Mention direction & performances",
              "Avoid major spoilers",
              "Rate honestly — not just hype",
            ].map(tip => (
              <p key={tip} className="text-[10px] text-[#555555] flex items-start gap-1.5">
                <span className="text-[#f5c518] mt-0.5 shrink-0">·</span>{tip}
              </p>
            ))}
          </div>

        </div>
      </form>
    </div>
  )
}

export default AddBlog