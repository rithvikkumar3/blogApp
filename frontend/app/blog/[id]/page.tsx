"use client"

import { Blog, User, author_service, blog_service, useAppData } from "@/context/AppContext"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import axios from "axios"
import Loading from "@/components/loading"
import Link from "next/link"
import { Calendar, Bookmark, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"
import toast from "react-hot-toast"

const BlogPage = () => {
  const params = useParams()
  const id = params?.id as string

  const router = useRouter()
  const { isAuth, user, fetchBlogs, savedBlogs, getSavedBlogs, loading: authLoading } = useAppData()

  const [blog, setBlog] = useState<Blog | null>(null)
  const [author, setAuthor] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [bookmarked, setBookmarked] = useState(false)
  const [savingBookmark, setSavingBookmark] = useState(false)

  const [deleting, setDeleting] = useState(false)

  const [commentText, setCommentText] = useState("")
  const [posting, setPosting] = useState(false)
  const [comments, setComments] = useState<any[]>([])

  // -------------------
  // Fetch Blog
  // -------------------
  async function fetchSingleBlog() {
    if (!id) return

    try {
      setLoading(true)

      const { data } = await axios.get(`${blog_service}/api/v1/blog/${id}`)

      setBlog(data.blog)
      setAuthor(data.author)

      await fetchComments()
    } catch (error) {
      console.log("Failed to fetch blog:", error)
      toast.error("Failed to load blog")
    } finally {
      setLoading(false)
    }
  }

  // -------------------
  // Fetch Comments
  // -------------------
  async function fetchComments() {
    try {
      const { data } = await axios.get(`${blog_service}/api/v1/comments/${id}`)
      setComments(data)
    } catch (error) {
      console.log("Failed to fetch comments:", error)
      toast.error("Failed to load comments")
    }
  }

  // -------------------
  // Save / Unsave Blog
  // -------------------
  async function handleSaveBlog() {
    try {
      setSavingBookmark(true)

      const token = Cookies.get("token")

      const { data } = await axios.post(
        `${blog_service}/api/v1/save/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setBookmarked((prev) => !prev)

      toast.success(data.message)
    } catch (error) {
      console.log("Error saving blog:", error)
      toast.error("Failed to save blog")
    } finally {
      setSavingBookmark(false)
    }
  }

  // -------------------
  // Add Comment
  // -------------------
  async function handlePostComment() {
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty")
      return
    }

    try {
      setPosting(true)

      const token = Cookies.get("token")

      const { data } = await axios.post(
        `${blog_service}/api/v1/comments/${id}`,
        { comment: commentText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setComments((prev) => [data.comment, ...prev])
      setCommentText("")

      toast.success(data.message)
    } catch (error) {
      console.log("Error posting comment:", error)
      toast.error("Problem commenting on blog")
    } finally {
      setPosting(false)
    }
  }

  // -------------------
  // Delete Comment
  // -------------------
  async function handleDeleteComment(commentId: number) {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      const token = Cookies.get("token")

      await axios.delete(`${blog_service}/api/v1/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setComments((prev) => prev.filter((c) => c.id !== commentId))

      toast.success("Comment deleted")
    } catch (error) {
      console.log("Error deleting comment:", error)
      toast.error("Failed to delete comment")
    }
  }

  // -------------------
  // Delete Blog
  // -------------------
  async function handleDeleteBlog() {
    if (!confirm("Delete this blog permanently?")) return

    try {
      setDeleting(true)

      const token = Cookies.get("token")

      await axios.delete(`${author_service}/api/v1/blog/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Blog deleted")

      router.push("/blogs")

      setTimeout(() => {
        fetchBlogs()
      }, 3000)
    } catch (error) {
      console.log("Error deleting blog:", error)
      toast.error("Failed to delete blog")
    } finally {
      setDeleting(false)
    }
  }

  // -------------------
  // Load Blog
  // -------------------
  useEffect(() => {
    if (id) {
      fetchSingleBlog()
    }
  }, [id])

  // -------------------
  // Sync Bookmark State
  // -------------------
  useEffect(() => {
    if (!blog || savedBlogs === null) return

    const isSaved = savedBlogs.some((b) => b.blogid === blog.id)
    setBookmarked(isSaved)
  }, [blog, savedBlogs])

  if (loading || authLoading) return <Loading />
  if (!blog) return <p className="text-center py-20">Blog not found.</p>

  const formattedDate = blog.created_at
    ? new Date(blog.created_at).toLocaleDateString("en-GB")
    : ""

  const isOwner = blog.author === user?._id

  return (
    <div className="bg-zinc-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {blog.image && (
          <div className="mb-10 rounded-3xl overflow-hidden shadow-xl">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-[450px] object-cover"
            />
          </div>
        )}

        <div className="space-y-8">

          <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-zinc-900">
            {blog.title}
          </h1>

          <div className="flex items-center justify-between border-b border-zinc-200 pb-6">

            <Link href={`/profile/${author?._id}`} className="flex items-center gap-4">
              <img
                src={author?.image || "/avatar.png"}
                className="w-11 h-11 rounded-full object-cover"
                alt=""
              />

              <div>
                <p className="font-semibold">{author?.name}</p>
                <p className="text-sm text-zinc-500">Author</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">

              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Calendar size={15} />
                {formattedDate}
              </div>

              {isOwner && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/blog/edit/${blog.id}`)}
                  >
                    <Pencil size={16} className="mr-2" />
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={handleDeleteBlog}
                    disabled={deleting}
                  >
                    <Trash2 size={16} className="mr-2" />
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>
                </>
              )}

              {!isOwner && isAuth && (
                <button
                  onClick={handleSaveBlog}
                  disabled={savingBookmark}
                  className={`px-4 py-2 rounded-full text-sm transition ${bookmarked
                      ? "bg-zinc-900 text-white"
                      : "border border-zinc-300 hover:bg-zinc-900 hover:text-white"
                    }`}
                >
                  <Bookmark
                    size={16}
                    className={`inline mr-2 ${bookmarked ? "fill-white" : ""}`}
                  />

                  {savingBookmark
                    ? bookmarked
                      ? "Removing..."
                      : "Saving..."
                    : bookmarked
                      ? "Saved"
                      : "Bookmark"}
                </button>
              )}
            </div>
          </div>

          {blog.description && (
            <p className="text-lg text-zinc-600 leading-relaxed">
              {blog.description}
            </p>
          )}

          {blog.blogContent && (
            <article className="prose prose-zinc lg:prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: blog.blogContent }} />
            </article>
          )}

          {/* COMMENTS */}
          <div className="pt-10 border-t border-zinc-200 space-y-6">

            <h2 className="text-2xl font-semibold">Comments</h2>

            {isAuth ? (
              <div className="space-y-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write your comment..."
                  className="w-full p-4 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition"
                  rows={4}
                />

                <Button
                  onClick={handlePostComment}
                  disabled={posting || !commentText.trim()}
                >
                  {posting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            ) : (
              <p className="text-zinc-500">
                Login to leave a comment.
              </p>
            )}

            <div className="space-y-4">

              {comments.length === 0 && (
                <p className="text-zinc-500 text-sm">
                  No comments yet. Be the first to comment.
                </p>
              )}

              {comments.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-start"
                >
                  <div>

                    <p className="text-sm text-zinc-600 mb-1">
                      {c.username || "User"}
                    </p>

                    <p className="text-sm text-zinc-400">
                      {new Date(c.created_at).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>

                    <p className="mt-1">{c.comment}</p>

                  </div>

                  {isAuth && user?._id === c.userid && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteComment(c.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}

                </div>
              ))}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPage