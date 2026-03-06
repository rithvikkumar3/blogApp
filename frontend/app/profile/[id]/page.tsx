"use client"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { useAppData, user_service } from "@/context/AppContext"
import React, { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "next/navigation"
import Loading from "@/components/loading"
import { Instagram, Linkedin, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Author {
  _id: string
  name: string
  email: string
  image: string
  instagram: string
  linkedin: string
  bio: string
}

const UserProfilePage = () => {
  const { blogs } = useAppData()
  const params = useParams()
  const userid = params.id as string

  const [user, setUser] = useState<Author | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchUser() {
    try {
      const { data } = await axios.get<Author>(`${user_service}/api/v1/user/${userid}`)
      setUser(data)
    } catch (error) {
      console.error("Failed to fetch user:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userid) fetchUser()
  }, [userid]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Loading />

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">User not found</p>
      </div>
    )
  }

  // Blog.author is a string ID — compare directly
  const userBlogs = blogs.filter(
    (blog) => String(blog.author) === String(user._id)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* User Card */}
        <Card className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.08)]">
          <CardContent className="p-10 flex flex-col items-center gap-6">

            <Avatar className="w-32 h-32 ring-4 ring-white shadow-xl">
              <AvatarImage src={user.image} alt={user.name} />
            </Avatar>

            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            {user.bio && (
              <p className="text-center text-gray-600 max-w-md">{user.bio}</p>
            )}

            {/* Social Links */}
            <div className="flex gap-4">
              {user.instagram && (
                <a
                  href={user.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md hover:scale-105 transition"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md hover:scale-105 transition"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>

          </CardContent>
        </Card>

        {/* User Blogs */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-zinc-900">
            Blogs by {user.name}
          </h2>

          {userBlogs.length === 0 ? (
            <p className="text-gray-500">This user has not published any blogs yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.id}`}
                  className="border border-zinc-100 rounded-xl overflow-hidden bg-white hover:shadow-lg transition"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-lg line-clamp-2 text-zinc-900">
                      {blog.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      {new Date(blog.created_at).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default UserProfilePage