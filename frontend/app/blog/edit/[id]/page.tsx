"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import axios from 'axios'
import Cookies from 'js-cookie'
import Image from 'next/image'
import { author_service, blog_service, useAppData, blogCategories, Blog, User } from '@/context/AppContext'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false })

interface BlogResponse {
  blog: Blog
  author: User
}

const EditBlogPage = () => {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const router = useRouter()
  const { fetchBlogs, isAuth, loading: authLoading, user } = useAppData()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null)

  const [isFetching, setIsFetching] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [existingImage, setExistingImage] = useState<string | null>(null)
  const [editorContent, setEditorContent] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null as File | null
  })

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuth) {
      router.push("/login")
    }
  }, [authLoading, isAuth, router])

  // Fetch blog and verify ownership
  useEffect(() => {
    if (!id) return

    const fetchBlog = async () => {
      try {
        const { data } = await axios.get<BlogResponse>(`${blog_service}/api/v1/blog/${id}`)
        const blog = data.blog

        // Ownership check — redirect if not the author
        if (user && String(blog.author) !== String(user._id)) {
          toast.error("You are not authorized to edit this blog")
          router.push("/blogs")
          return
        }

        setFormData({
          title: blog.title || "",
          description: blog.description || "",
          category: blog.category?.trim() || "",
          image: null
        })
        setEditorContent(blog.blogContent || "")
        setExistingImage(blog.image || null)
      } catch (error) {
        console.error("Failed to load blog:", error)
        toast.error("Failed to load blog")
      } finally {
        setIsFetching(false)
      }
    }

    // Wait until auth is resolved before fetching so ownership check works
    if (!authLoading) fetchBlog()
  }, [id, authLoading, user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setFormData(prev => ({ ...prev, image: file }))
  }

  const editorConfig = useMemo(() => ({
    readonly: false,
    height: "100%",
    toolbarSticky: true,
    askBeforePasteHTML: false
  }), [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsUpdating(true)
      const token = Cookies.get("token")

      const submitData = new FormData()
      submitData.append("title", formData.title)
      submitData.append("description", formData.description)
      submitData.append("category", formData.category)
      submitData.append("blogContent", editorContent)
      if (formData.image) submitData.append("file", formData.image)

      await axios.post(
        `${author_service}/api/v1/blog/${id}`,
        submitData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.success("Blog updated successfully")
      await fetchBlogs()
      router.push(`/blog/${id}`)
    } catch (error) {
      console.error("Failed to update blog:", error)
      toast.error("Failed to update blog")
    } finally {
      setIsUpdating(false)
    }
  }

  if (isFetching || authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Edit Blog</h1>
          <p className="text-sm text-gray-500">Update and manage your content</p>
        </div>
        <Button type="submit" form="edit-blog-form" disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update"}
        </Button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Editor */}
        <div className="flex-1 bg-white p-6 overflow-auto">
          <JoditEditor
            ref={editorRef}
            value={editorContent}
            config={editorConfig}
            onChange={(newContent) => setEditorContent(newContent)}
          />
        </div>

        {/* Sidebar */}
        <form
          id="edit-blog-form"
          onSubmit={handleSubmit}
          className="w-80 bg-white border-l p-6 space-y-6 overflow-auto shrink-0"
        >
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {blogCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Featured Image</Label>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {existingImage && !formData.image && (
              <div className="relative w-full h-32 rounded-md overflow-hidden border">
                <Image
                  src={existingImage}
                  alt="Current featured image"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </form>

      </div>
    </div>
  )
}

export default EditBlogPage