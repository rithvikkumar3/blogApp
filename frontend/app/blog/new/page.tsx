"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw } from 'lucide-react'
import React, { useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Cookies from 'js-cookie'
import axios from 'axios'
import { author_service } from '@/context/AppContext'
import toast from 'react-hot-toast'

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false })

export const blogCategories = [
  "Technology",
  "Health",
  "Finance",
  "Travel",
  "Education",
  "Entertainment",
  "Study"
]

const AddBlog = () => {
  const editor = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [loading, setLoading] = useState(false)
  const [aiTitleLoading, setAiTitleLoading] = useState(false)
  const [aiDescLoading, setAiDescLoading] = useState(false)
  const [aiBlogLoading, setAiBlogLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null as File | null,
    blogContent: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, image: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formDataToSend = new FormData()
    formDataToSend.append("title", formData.title)
    formDataToSend.append("description", formData.description)
    formDataToSend.append("blogContent", formData.blogContent)
    formDataToSend.append("category", formData.category)
    if (formData.image) formDataToSend.append("file", formData.image)

    try {
      const token = Cookies.get("token")
      const { data } = await axios.post(
        `${author_service}/api/v1/blog/new`,
        formDataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(data.message)

      setFormData({ title: "", description: "", category: "", image: null, blogContent: "" })
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch {
      toast.error("Error publishing blog!")
    } finally {
      setLoading(false)
    }
  }

  // AI Handlers
  const aiTitleResponse = async () => {
    if (!formData.title) return
    try {
      setAiTitleLoading(true)
      const { data } = await axios.post(`${author_service}/api/v1/ai/title`, { text: formData.title })
      if (data?.title) setFormData(prev => ({ ...prev, title: data.title }))
    } catch {
      toast.error("Problem fetching AI title")
    } finally {
      setAiTitleLoading(false)
    }
  }

  const aiDescriptionResponse = async () => {
    if (!formData.title && !formData.description) {
      toast.error("Add a title to generate description")
      return
    }
    try {
      setAiDescLoading(true)
      const { data } = await axios.post(`${author_service}/api/v1/ai/description`, {
        title: formData.title,
        description: formData.description
      })
      if (data?.description) setFormData(prev => ({ ...prev, description: data.description }))
    } catch {
      toast.error("Problem fetching AI description")
    } finally {
      setAiDescLoading(false)
    }
  }

  const aiBlogResponse = async () => {
    if (!formData.blogContent.trim()) return toast.error("Blog content is empty")
    try {
      setAiBlogLoading(true)
      const { data } = await axios.post(`${author_service}/api/v1/ai/blog`, { blog: formData.blogContent })
      if (data?.html) {
        setFormData(prev => ({ ...prev, blogContent: data.html }))
        toast.success("Blog grammar improved ✨")
      }
    } catch {
      toast.error("Problem fixing blog content")
    } finally {
      setAiBlogLoading(false)
    }
  }

  const editorConfig = useMemo(() => ({
    readonly: false,
    placeholder: 'Start typing your blog content here...',
    toolbarSticky: true,
    askBeforePasteHTML: false,  // ✅ Remove "Paste as HTML" popup
    pasteAsPlainText: false
  }), [])

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
    <div className="max-w-4xl mx-auto">
      <Card className="rounded-2xl border border-slate-200 shadow-lg bg-white">
        <CardHeader className="border-b border-slate-100 p-8">
          <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">
            Create New Blog
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Write, enhance with AI, and publish beautifully.
          </p>
        </CardHeader>

        <CardContent className="p-8 space-y-8">

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Title Section */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Title</Label>
              <div className="flex gap-3">
                <Input
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="h-11"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={aiTitleResponse}
                  disabled={aiTitleLoading}
                  className="h-11 px-4 rounded-xl"
                >
                  {aiTitleLoading && (
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  )}
                  Improve
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Description</Label>
              <div className="flex gap-3">
                <Input
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  className="h-11"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={aiDescriptionResponse}
                  disabled={aiDescLoading}
                  className="h-11 px-4 rounded-xl"
                >
                  {aiDescLoading && (
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  )}
                  Generate
                </Button>
              </div>
            </div>

            {/* Category + Image Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {blogCategories.map((e, i) => (
                      <SelectItem key={i} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">
                  Featured Image
                </Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="h-11"
                />
              </div>
            </div>

            {/* Blog Content */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-slate-700 font-medium">
                  Blog Content
                </Label>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={aiBlogResponse}
                  disabled={aiBlogLoading}
                  className="rounded-xl"
                >
                  {aiBlogLoading && (
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  )}
                  Improve Writing
                </Button>
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <JoditEditor
                  ref={editor}
                  value={formData.blogContent}
                  config={editorConfig}
                  onBlur={(newContent) =>
                    setFormData((prev) => ({
                      ...prev,
                      blogContent: newContent,
                    }))
                  }
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium rounded-2xl"
                disabled={loading}
              >
                {loading ? "Publishing..." : "Publish Blog"}
              </Button>
            </div>

          </form>

        </CardContent>
      </Card>
    </div>
  </div>
)
}

export default AddBlog