"use client"

import { Blog, User, author_service, blog_service, useAppData } from "@/context/AppContext"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import axios from "axios"
import Loading from "@/components/loading"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Bookmark, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"
import toast from "react-hot-toast"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface BlogResponse {
  blog: Blog
  author: User
}

interface Comment {
  id: number
  comment: string
  userid: string
  username: string
  blogid: string
  created_at: string
}

interface CommentResponse {
  message: string
  comment: Comment
}

interface SaveBlogResponse {
  message: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const BlogPage = () => {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()

  const { isAuth, user, fetchBlogs, savedBlogs, getSavedBlogs, loading: authLoading } = useAppData()

  const [blog, setBlog] = useState<Blog | null>(null)
  const [author, setAuthor] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState("")
  const [posting, setPosting] = useState(false)

  const [bookmarked, setBookmarked] = useState(false)
  const [savingBookmark, setSavingBookmark] = useState(false)

  const [deleting, setDeleting] = useState(false)

  // -------------------------------------------------------------------------
  // Fetch Blog
  // -------------------------------------------------------------------------
  const fetchSingleBlog = async () => {
    if (!id) return
    try {
      setLoading(true)
      const { data } = await axios.get<BlogResponse>(`${blog_service}/api/v1/blog/${id}`)
      setBlog(data.blog)
      setAuthor(data.author)
    } catch (error) {
      console.error("Failed to fetch blog:", error)
      toast.error("Failed to load blog")
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------------------------
  // Fetch Comments
  // -------------------------------------------------------------------------
  const fetchComments = async () => {
    if (!id) return
    try {
      const { data } = await axios.get<Comment[]>(`${blog_service}/api/v1/comments/${id}`)
      setComments(data)
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    }
  }

  // -------------------------------------------------------------------------
  // Save / Unsave Blog
  // -------------------------------------------------------------------------
  const handleSaveBlog = async () => {
    try {
      setSavingBookmark(true)
      const token = Cookies.get("token")
      const { data } = await axios.post<SaveBlogResponse>(
        `${blog_service}/api/v1/save/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setBookmarked((prev) => !prev)
      await getSavedBlogs()
      toast.success(data.message)
    } catch (error) {
      console.error("Error saving blog:", error)
      toast.error("Failed to save blog")
    } finally {
      setSavingBookmark(false)
    }
  }

  // -------------------------------------------------------------------------
  // Add Comment
  // -------------------------------------------------------------------------
  const handlePostComment = async () => {
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty")
      return
    }
    try {
      setPosting(true)
      const token = Cookies.get("token")
      const { data } = await axios.post<CommentResponse>(
        `${blog_service}/api/v1/comments/${id}`,
        { comment: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setComments((prev) => [data.comment, ...prev])
      setCommentText("")
      toast.success(data.message)
    } catch (error) {
      console.error("Error posting comment:", error)
      toast.error("Problem commenting on blog")
    } finally {
      setPosting(false)
    }
  }

  // -------------------------------------------------------------------------
  // Delete Comment
  // -------------------------------------------------------------------------
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return
    try {
      const token = Cookies.get("token")
      await axios.delete(`${blog_service}/api/v1/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast.success("Comment deleted")
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast.error("Failed to delete comment")
    }
  }

  // -------------------------------------------------------------------------
  // Delete Blog
  // -------------------------------------------------------------------------
  const handleDeleteBlog = async () => {
    if (!confirm("Delete this blog permanently?")) return
    try {
      setDeleting(true)
      const token = Cookies.get("token")
      await axios.delete(`${author_service}/api/v1/blog/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success("Blog deleted")
      await fetchBlogs()
      router.push("/blogs")
    } catch (error) {
      console.error("Error deleting blog:", error)
      toast.error("Failed to delete blog")
    } finally {
      setDeleting(false)
    }
  }

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!id) return
    fetchSingleBlog()
    fetchComments()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync bookmark state whenever savedBlogs or blog changes
  useEffect(() => {
    if (!blog || !savedBlogs.length) return
    const isSaved = savedBlogs.some((b) => String(b.blogid) === String(blog.id))
    setBookmarked(isSaved)
  }, [blog, savedBlogs])

  // -------------------------------------------------------------------------
  // Render guards
  // -------------------------------------------------------------------------
  if (loading || authLoading) return <Loading />

  if (!blog) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-500 text-lg">Blog not found.</p>
      </div>
    )
  }

  const formattedDate = blog.created_at
    ? new Date(blog.created_at).toLocaleDateString("en-GB")
    : ""

  const isOwner = blog.author === user?._id

  // -------------------------------------------------------------------------
  // JSX
  // -------------------------------------------------------------------------
  return (
    <div className="bg-zinc-50 min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-6">

        {/* Blog Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8 md:p-12">

          {/* Hero Image */}
          {blog.image && (
            <div className="mb-10 rounded-xl overflow-hidden relative w-full h-[420px]">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 leading-tight mb-8">
            {blog.title}
          </h1>

          {/* Author + Actions */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-6 mb-10 flex-wrap gap-4">

            {/* Author */}
            <Link href={`/profile/${author?._id}`} className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full overflow-hidden">
                <Image
                  src={author?.image || "/avatar.png"}
                  alt={author?.name || "Author"}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">{author?.name}</p>
                <p className="text-xs text-zinc-500 flex items-center gap-1">
                  <Calendar size={13} />
                  {formattedDate}
                </p>
              </div>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {isOwner && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/blog/edit/${blog.id}`)}
                  >
                    <Pencil size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteBlog}
                    disabled={deleting}
                  >
                    <Trash2 size={14} className="mr-1" />
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>
                </>
              )}

              {!isOwner && isAuth && (
                <button
                  onClick={handleSaveBlog}
                  disabled={savingBookmark}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                    bookmarked
                      ? "bg-zinc-900 text-white"
                      : "border border-zinc-300 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <Bookmark size={16} className={bookmarked ? "fill-white" : ""} />
                  {savingBookmark ? "Saving..." : bookmarked ? "Saved" : "Bookmark"}
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          {blog.description && (
            <p className="text-xl text-zinc-600 leading-relaxed mb-10">
              {blog.description}
            </p>
          )}

          {/* Content */}
          {blog.blogContent && (
            <article className="prose prose-lg max-w-none prose-zinc">
              <div dangerouslySetInnerHTML={{ __html: blog.blogContent }} />
            </article>
          )}
        </div>

        {/* Comments Section */}
        <div className="mt-10 bg-white border border-zinc-100 p-8 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">Comments</h2>

          {isAuth ? (
            <div className="mb-8">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment..."
                className="w-full p-4 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none text-sm"
                rows={4}
              />
              <div className="flex justify-end mt-3">
                <Button
                  onClick={handlePostComment}
                  disabled={posting || !commentText.trim()}
                >
                  {posting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 mb-6 text-sm">
              <Link href="/login" className="underline hover:text-zinc-800">Login</Link> to leave a comment.
            </p>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-sm text-zinc-400">No comments yet. Be the first!</p>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="border border-zinc-100 rounded-lg p-4 flex justify-between items-start gap-4"
                >
                  <div>
                    <p className="font-semibold text-sm text-zinc-900">{c.username}</p>
                    <p className="text-xs text-zinc-400 mb-1">
                      {new Date(c.created_at).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    <p className="text-sm text-zinc-700">{c.comment}</p>
                  </div>

                  {isAuth && user?._id === c.userid && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-zinc-300 hover:text-red-500 transition mt-1 shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default BlogPage