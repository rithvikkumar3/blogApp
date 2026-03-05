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
import { author_service, blog_service, useAppData } from '@/context/AppContext'
import toast from 'react-hot-toast'
import { blogCategories } from '../../new/page'
import { useParams, useRouter } from 'next/navigation'

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false })

const EditBlogPage = () => {

  const { id } = useParams()
  const router = useRouter()
  const {fetchBlogs} = useAppData()
  const editor = useRef<any>(null)

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

  const editorConfig = useMemo(() => ({
    readonly: false,
    height: "100%",
    toolbarSticky: true,
    askBeforePasteHTML: false
  }), [])

  // ✅ Fetch blog
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await axios.get(
          `${blog_service}/api/v1/blog/${id}`
        )

        const blog = data.blog

        setFormData({
          title: blog.title || "",
          description: blog.description || "",
          category: blog.category?.trim() || "",
          image: null
        })

        setEditorContent(blog.blogContent || "")
        setExistingImage(blog.image || null)
      } catch {
        toast.error("Failed to load blog")
      } finally {
        setIsFetching(false)
      }
    }

    if (id) fetchBlog()
  }, [id])

  // ✅ Update Blog (FIXED)
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

      if (formData.image) {
        submitData.append("file", formData.image) // ✅ MATCH ADD BLOG
      }

      await axios.post(
        `${author_service}/api/v1/blog/${id}`, // same as your backend
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}` // ✅ TOKEN ADDED
          }
        }
      )

      toast.success("Blog updated successfully")
      fetchBlogs()

    } catch {
      toast.error("Failed to update blog")
    } finally {
      setIsUpdating(false)
    }
  }

  if (isFetching) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">

      {/* Top Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Edit Blog
          </h1>
          <p className="text-sm text-gray-500">
            Update and manage your content
          </p>
        </div>

        <Button
          type="submit"
          form="edit-blog-form"
          disabled={isUpdating}
        >
          {isUpdating ? "Updating..." : "Update"}
        </Button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Editor */}
        <div className="flex-1 bg-white p-6 overflow-auto">
          <JoditEditor
            ref={editor}
            value={editorContent}
            config={editorConfig}
            onChange={(newContent) =>
              setEditorContent(newContent)
            }
          />
        </div>

        {/* Sidebar */}
        <form
          id="edit-blog-form"
          onSubmit={handleSubmit}
          className="w-[380px] bg-white border-l p-6 space-y-6 overflow-auto"
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
              onValueChange={(value) =>
                setFormData(prev => ({
                  ...prev,
                  category: value
                }))
              }
            >
              <SelectTrigger>
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

          <div className="space-y-3">
            <Label>Featured Image</Label>

            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />

            {existingImage && !formData.image && (
              <img
                src={existingImage}
                alt="Existing"
                className="rounded-md w-full h-32 object-cover border"
              />
            )}
          </div>

        </form>
      </div>
    </div>
  )
}

export default EditBlogPage