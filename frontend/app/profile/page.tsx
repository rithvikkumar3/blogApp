"use client"

import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { useAppData, user_service, User } from '@/context/AppContext'
import React, { useRef, useState, useEffect } from 'react'
import Cookies from "js-cookie"
import axios from 'axios'
import toast from 'react-hot-toast'
import Loading from '@/components/loading'
import { Instagram, Linkedin, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

const ProfilePage = () => {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { user, setUser, logoutUser, isAuth, loading: authLoading } = useAppData()

  const [formData, setFormData] = useState({
    name: "",
    instagram: "",
    linkedin: "",
    bio: "",
  })

  // Redirect if not authenticated — safely inside useEffect, not during render
  useEffect(() => {
    if (!authLoading && !isAuth) {
      router.push("/login")
    }
  }, [authLoading, isAuth, router])

  // Sync form data when user loads or changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        instagram: user.instagram || "",
        linkedin: user.linkedin || "",
        bio: user.bio || "",
      })
    }
  }, [user])

  const clickHandler = () => {
    inputRef.current?.click()
  }

  const changeHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const form = new FormData()
    form.append("file", file)

    try {
      setLoading(true)
      const token = Cookies.get("token")
      const { data } = await axios.post<{ message: string; token: string; user: User }>(
        `${user_service}/api/v1/user/update/pic`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(data.message)
      Cookies.set("token", data.token, { expires: 5, secure: true, path: "/" })
      setUser(data.user)
    } catch (error) {
      console.error("Image update failed:", error)
      toast.error("Image update failed")
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = async () => {
    try {
      setLoading(true)
      const token = Cookies.get("token")
      const { data } = await axios.post<{ message: string; token: string; user: User }>(
        `${user_service}/api/v1/user/update`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(data.message)
      Cookies.set("token", data.token, { expires: 5, secure: true, path: "/" })
      setUser(data.user)
      setOpen(false)
    } catch (error) {
      console.error("Profile update failed:", error)
      toast.error("Profile update failed")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) return <Loading />
  if (!user) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4">
      <Card className="w-full max-w-xl rounded-3xl border border-white/50 bg-white/70 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.08)]">
        <CardContent className="p-10 flex flex-col items-center gap-8">

          {/* Avatar */}
          <div className="relative group">
            <Avatar
              className="w-32 h-32 ring-4 ring-white shadow-xl cursor-pointer transition-transform duration-300 group-hover:scale-105"
              onClick={clickHandler}
            >
              <AvatarImage src={user.image} alt={user.name} />
            </Avatar>
            <div
              onClick={clickHandler}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
            >
              <Camera className="w-6 h-6 text-white" />
            </div>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={changeHandler}
            />
          </div>

          {/* Name & Email */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
              {user.name}
            </h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-center text-gray-600 leading-relaxed max-w-md">
              {user.bio}
            </p>
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

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={logoutUser}
            >
              Logout
            </Button>

            <Button
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md hover:opacity-90"
              onClick={() => router.push("/blog/new")}
            >
              Add Blog
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 rounded-xl">
                  Edit
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[500px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">
                    Edit Profile
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Input
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Instagram</Label>
                    <Input
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>LinkedIn</Label>
                    <Input
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    />
                  </div>
                  <Button
                    onClick={handleFormSubmit}
                    className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}

export default ProfilePage