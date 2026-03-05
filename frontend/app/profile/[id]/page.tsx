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
      const { data } = await axios.get(
        `${user_service}/api/v1/user/${userid}`
      )
      setUser(data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userid) {
      fetchUser()
    }
  }, [userid])

  /* wait until BOTH user and blogs are ready */
  if (loading || !blogs) return <Loading />

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-500">
        User not found
      </div>
    )
  }

  /* safe filtering */
  const userBlogs = blogs.filter(
    (blog) => String(blog.author._id) === String(user._id)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4 py-10">

      <div className="max-w-5xl mx-auto space-y-10">

        {/* USER CARD */}
        <Card className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.08)]">

          <CardContent className="p-10 flex flex-col items-center gap-6">

            <Avatar className="w-32 h-32 ring-4 ring-white shadow-xl">
              <AvatarImage src={user.image} />
            </Avatar>

            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                {user.name}
              </h2>
              <p className="text-sm text-gray-500">
                {user.email}
              </p>
            </div>

            {user.bio && (
              <p className="text-center text-gray-600 max-w-md">
                {user.bio}
              </p>
            )}

            {/* SOCIAL LINKS */}
            <div className="flex gap-4">

              {user.instagram && (
                <a
                  href={user.instagram}
                  target="_blank"
                  className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md hover:scale-105 transition"
                >
                  <Instagram className="w-5 h-5"/>
                </a>
              )}

              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md hover:scale-105 transition"
                >
                  <Linkedin className="w-5 h-5"/>
                </a>
              )}

            </div>

          </CardContent>
        </Card>


        {/* USER BLOGS */}
        <div>

          <h2 className="text-2xl font-semibold mb-6">
            Blogs by {user.name}
          </h2>

          {userBlogs.length === 0 ? (
            <p className="text-gray-500">
              This user has not published any blogs yet.
            </p>
          ) : (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {userBlogs.map((blog) => (

                <Link
                  key={blog.id}
                  href={`/blog/${blog.id}`}
                  className="border rounded-xl overflow-hidden bg-white hover:shadow-lg transition"
                >

                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="h-48 w-full object-cover"
                  />

                  <div className="p-4 space-y-2">

                    <h3 className="font-semibold text-lg line-clamp-2">
                      {blog.title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14}/>
                      {new Date(blog.created_at).toLocaleDateString()}
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