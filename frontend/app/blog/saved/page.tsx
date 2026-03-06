"use client"

import React, { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"
import Cookies from "js-cookie"
import toast from "react-hot-toast"

import { useAppData, blog_service } from "@/context/AppContext"
import { Calendar, BookmarkX, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import Loading from "@/components/loading"

const SavedBlogs = () => {
  const router = useRouter()
  const { savedBlogs, blogs, getSavedBlogs, isAuth, loading } = useAppData()

  // Redirect unauthenticated users
  if (!loading && !isAuth) {
    router.push("/login")
    return null
  }

  if (loading) return <Loading />

  const savedBlogPosts = blogs.filter((blog) =>
    savedBlogs.some((s) => String(s.blogid) === String(blog.id))
  )

  async function removeSaved(blogid: string) {
    try {
      const token = Cookies.get("token")
      const { data } = await axios.post(
        `${blog_service}/api/v1/save/${blogid}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(data.message)
      await getSavedBlogs()
    } catch (error) {
      console.error("Failed to remove saved blog:", error)
      toast.error("Failed to update saved blogs")
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Bookmark className="w-6 h-6 text-zinc-700" />
        <h1 className="text-3xl font-bold text-zinc-900">Saved Blogs</h1>
      </div>

      {/* Empty state */}
      {savedBlogPosts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <BookmarkX className="w-12 h-12 text-zinc-300 mb-4" />
          <p className="text-zinc-500 text-lg">No saved blogs yet</p>
          <p className="text-zinc-400 text-sm mt-1">Blogs you bookmark will appear here</p>
          <Link href="/blogs" className="mt-6 text-sm underline text-zinc-600 hover:text-zinc-900">
            Browse blogs
          </Link>
        </div>
      )}

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedBlogPosts.map((blog) => (
          <div
            key={blog.id}
            className="border border-zinc-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white"
          >
            <Link href={`/blog/${blog.id}`}>
              <div className="relative h-48 w-full">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>

            <div className="p-4">
              <Link href={`/blog/${blog.id}`}>
                <h2 className="font-semibold text-lg text-zinc-900 hover:underline line-clamp-1">
                  {blog.title}
                </h2>
              </Link>

              <div className="flex items-center gap-2 text-sm text-zinc-400 mt-2 mb-4">
                <Calendar size={14} />
                {new Date(blog.created_at).toLocaleDateString("en-GB")}
              </div>

              <Button
                variant="outline"
                className="w-full flex gap-2 text-sm"
                onClick={() => removeSaved(blog.id)}
              >
                <BookmarkX size={16} />
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default SavedBlogs