"use client"

import { Blog, User, blog_service, useAppData } from '@/context/AppContext'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Loading from '@/components/loading'
import Link from 'next/link'
import { Calendar, Bookmark, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const BlogPage = () => {

    const { id } = useParams()
    const router = useRouter()
    const { isAuth, user } = useAppData()

    const [blog, setBlog] = useState<Blog | null>(null)
    const [author, setAuthor] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [bookmarked, setBookmarked] = useState(false)
    const [deleting, setDeleting] = useState(false)

    async function fetchSingleBlog() {
        try {
            setLoading(true)
            const { data } = await axios.get(`${blog_service}/api/v1/blog/${id}`)
            setBlog(data.blog)
            setAuthor(data.author)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        try {
            setDeleting(true)
            await axios.delete(`${blog_service}/api/v1/blog/${id}`)
            router.push("/") // redirect after delete
        } catch (error) {
            console.log(error)
        } finally {
            setDeleting(false)
        }
    }

    useEffect(() => {
        if (id) fetchSingleBlog()
    }, [id])

    if (loading) return <Loading />
    if (!blog) return <p className="text-center py-20">Blog not found.</p>

    const formattedDate = blog.created_at
        ? new Date(blog.created_at.replace(" ", "T")).toLocaleDateString("en-GB")
        : ""

    const isOwner = blog.author === user?._id

    return (
        <div className="bg-zinc-50 min-h-screen">

            <div className="max-w-7xl mx-auto px-6 py-12">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* LEFT SIDE - IMAGE */}
                    {blog.image && (
                        <div className="sticky top-24 h-[500px] rounded-3xl overflow-hidden shadow-xl">
                            <img
                                src={blog.image}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* RIGHT SIDE - CONTENT */}
                    <div className="space-y-8">

                        {/* Title */}
                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-zinc-900">
                            {blog.title}
                        </h1>

                        {/* Author + Controls */}
                        <div className="flex items-center justify-between border-b border-zinc-200 pb-6">

                            <Link
                                href={`/profile/${author?._id}`}
                                className="flex items-center gap-4 group"
                            >
                                <img
                                    src={author?.image || "/avatar.png"}
                                    className="w-11 h-11 rounded-full object-cover ring-2 ring-zinc-200 group-hover:ring-zinc-400 transition"
                                    alt={author?.name || "author"}
                                />
                                <div>
                                    <p className="font-semibold text-zinc-800 group-hover:text-black transition">
                                        {author?.name}
                                    </p>
                                    <p className="text-sm text-zinc-500">Author</p>
                                </div>
                            </Link>

                            <div className="flex items-center gap-4">

                                {/* Date */}
                                <div className="flex items-center gap-2 text-sm text-zinc-500">
                                    <Calendar size={15} />
                                    <span>{formattedDate}</span>
                                </div>

                                {/* OWNER CONTROLS */}
                                {isOwner && (
                                    <div className="flex items-center gap-3">

                                        <Button
                                            variant="outline"
                                            onClick={() => router.push(`/edit/${blog._id}`)}
                                            className="flex items-center gap-2"
                                        >
                                            <Pencil size={16} />
                                            Edit
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            onClick={handleDelete}
                                            disabled={deleting}
                                            className="flex items-center gap-2"
                                        >
                                            <Trash2 size={16} />
                                            {deleting ? "Deleting..." : "Delete"}
                                        </Button>

                                    </div>
                                )}

                                {/* BOOKMARK (only if not owner but logged in) */}
                                {!isOwner && isAuth && (
                                    <button
                                        onClick={() => setBookmarked(prev => !prev)}
                                        className={`
                                            flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium
                                            transition-all duration-300 ease-out
                                            ${bookmarked
                                                ? "bg-zinc-900 text-white shadow-lg scale-105"
                                                : "border border-zinc-300 text-zinc-700 hover:bg-zinc-900 hover:text-white hover:shadow-md"
                                            }
                                        `}
                                    >
                                        <Bookmark
                                            size={16}
                                            className={`transition-all duration-300 ${
                                                bookmarked ? "fill-white scale-110" : ""
                                            }`}
                                        />
                                        {bookmarked ? "Saved" : "Bookmark"}
                                    </button>
                                )}

                            </div>

                        </div>

                        {/* Blog Content */}
                        <article className="prose prose-zinc lg:prose-lg max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: blog.description }} />
                        </article>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default BlogPage