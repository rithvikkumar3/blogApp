"use client"

import React, { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import axios from "axios"
import Cookies from "js-cookie"
import toast from "react-hot-toast"

import { useAppData, blog_service } from "@/context/AppContext"
import { Calendar, BookmarkX } from "lucide-react"
import { Button } from "@/components/ui/button"

const SavedBlogs = () => {

  const { savedBlogs, blogs, getSavedBlogs } = useAppData()

  const savedBlogPosts = useMemo(() => {
    if (!savedBlogs || !blogs) return []

    const savedIds = savedBlogs.map((s) => Number(s.blogid))

    return blogs.filter((blog) => savedIds.includes(Number(blog.id)))
  }, [savedBlogs, blogs])


  async function removeSaved(blogid: string) {
    try {
      const token = Cookies.get("token")

      const { data } = await axios.post(
        `${blog_service}/api/v1/save/${blogid}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      toast.success(data.message)

      // refresh saved blogs
      await getSavedBlogs()

    } catch (error) {
      console.log(error)
      toast.error("Failed to update saved blogs")
    }
  }


  if (!savedBlogs) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading saved blogs...
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        Saved Blogs
      </h1>

      {savedBlogPosts.length === 0 && (
        <div className="text-gray-500 text-center mt-20">
          No saved blogs yet
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {savedBlogPosts.map((blog) => (

          <div
            key={blog.id}
            className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white"
          >

            <Link href={`/blog/${blog.id}`}>
              <div className="relative h-48 w-full">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="object-cover w-full h-full"
                />
              </div>
            </Link>

            <div className="p-4">

              <Link href={`/blog/${blog.id}`}>
                <h2 className="font-semibold text-lg hover:underline">
                  {blog.title}
                </h2>
              </Link>

              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2 mb-4">
                <Calendar size={14}/>
                {new Date(blog.created_at).toLocaleDateString()}
              </div>

              <Button
                variant="outline"
                className="w-full flex gap-2"
                onClick={() => removeSaved(blog.id)}
              >
                <BookmarkX size={16}/>
                Remove from saved
              </Button>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}

export default SavedBlogs