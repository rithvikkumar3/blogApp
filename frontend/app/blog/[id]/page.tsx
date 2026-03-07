"use client"

import { Blog, User, author_service, blog_service, useAppData } from "@/context/AppContext"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import axios from "axios"
import Loading from "@/components/loading"
import Link from "next/link"
import Image from "next/image"
import {
  Calendar, Bookmark, Pencil, Trash2, Star,
  MessageSquare, Clapperboard, Send
} from "lucide-react"
import Cookies from "js-cookie"
import toast from "react-hot-toast"

interface BlogResponse { blog: Blog; author: User }
interface Comment {
  id: number; comment: string; userid: string
  username: string; blogid: string; created_at: string
}
interface CommentResponse { message: string; comment: Comment }
interface SaveBlogResponse { message: string }

function extractRating(text: string): number | null {
  const match = text.match(/\[rating:(\d+(?:\.\d+)?)\]/i)
  return match ? parseFloat(match[1]) : null
}
function stripRating(text: string): string {
  return text.replace(/\[rating:\d+(?:\.\d+)?\]\s*/i, "").trim()
}
function ratingColor(r: number): string {
  if (r >= 8) return "text-green-400"
  if (r >= 6) return "text-[#f5c518]"
  if (r >= 4) return "text-orange-400"
  return "text-red-400"
}

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

  const fetchSingleBlog = async () => {
    if (!id) return
    try {
      setLoading(true)
      const { data } = await axios.get<BlogResponse>(`${blog_service}/api/v1/blog/${id}`)
      setBlog(data.blog)
      setAuthor(data.author)
    } catch {
      toast.error("Failed to load review")
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    if (!id) return
    try {
      const { data } = await axios.get<Comment[]>(`${blog_service}/api/v1/comments/${id}`)
      setComments(data)
    } catch { /* silent */ }
  }

  const handleSaveBlog = async () => {
    try {
      setSavingBookmark(true)
      const token = Cookies.get("token")
      const { data } = await axios.post<SaveBlogResponse>(
        `${blog_service}/api/v1/save/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setBookmarked(prev => !prev)
      await getSavedBlogs()
      toast.success(data.message)
    } catch { toast.error("Failed to save review") }
    finally { setSavingBookmark(false) }
  }

  const handlePostComment = async () => {
    if (!commentText.trim()) return
    try {
      setPosting(true)
      const token = Cookies.get("token")
      const { data } = await axios.post<CommentResponse>(
        `${blog_service}/api/v1/comments/${id}`,
        { comment: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setComments(prev => [data.comment, ...prev])
      setCommentText("")
      toast.success(data.message)
    } catch { toast.error("Problem posting comment") }
    finally { setPosting(false) }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Delete this comment?")) return
    try {
      const token = Cookies.get("token")
      await axios.delete(`${blog_service}/api/v1/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setComments(prev => prev.filter(c => c.id !== commentId))
      toast.success("Comment deleted")
    } catch { toast.error("Failed to delete comment") }
  }

  const handleDeleteBlog = async () => {
    if (!confirm("Delete this review permanently?")) return
    try {
      setDeleting(true)
      const token = Cookies.get("token")
      await axios.delete(`${author_service}/api/v1/blog/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success("Review deleted")
      await fetchBlogs()
      router.push("/blogs")
    } catch { toast.error("Failed to delete review") }
    finally { setDeleting(false) }
  }

  useEffect(() => {
    if (!id) return
    fetchSingleBlog()
    fetchComments()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!blog || !savedBlogs.length) return
    setBookmarked(savedBlogs.some(b => String(b.blogid) === String(blog.id)))
  }, [blog, savedBlogs])

  if (loading || authLoading) return <Loading />

  if (!blog) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <p className="text-[#555555]">Review not found.</p>
      </div>
    )
  }

  const formattedDate = blog.created_at
    ? new Date(blog.created_at).toLocaleDateString("en-GB") : ""
  const isOwner = blog.author === user?._id
  const rating = extractRating(blog.description)
  const cleanDescription = stripRating(blog.description)

  return (
    <div className="flex-1 bg-[#0a0a0a] flex overflow-hidden">

      {/* ── LEFT COLUMN — poster + review content ── */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-white/5">

        {/* Poster — fixed height */}
        <div className="relative h-[42%] shrink-0 overflow-hidden">
          {blog.image ? (
            <>
              <Image src={blog.image} alt={blog.title} fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-[#111111] flex items-center justify-center">
              <Clapperboard size={40} className="text-[#222222]" />
            </div>
          )}

          {/* Badges over poster */}
          <div className="absolute bottom-4 left-5 flex items-center gap-2">
            {blog.category && (
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#f5c518] text-[#0a0a0a]">
                {blog.category}
              </span>
            )}
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => router.push(`/blog/edit/${blog.id}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-[#888888] hover:text-white text-xs font-medium transition"
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                onClick={handleDeleteBlog}
                disabled={deleting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-red-500/20 text-red-400 hover:text-red-300 text-xs font-medium transition"
              >
                <Trash2 size={12} /> {deleting ? "..." : "Delete"}
              </button>
            </div>
          )}
        </div>

        {/* Review content — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Title */}
          <h1 className="text-2xl font-bold text-white leading-tight tracking-tight">
            {blog.title}
          </h1>

          {/* Author row */}
          <Link href={`/profile/${author?._id}`} className="flex items-center gap-2.5 group w-fit">
            <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/10 group-hover:ring-[#f5c518]/40 transition shrink-0">
              <Image src={author?.image || "/avatar.png"} alt={author?.name || "Author"} fill className="object-cover" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#f0ece3] group-hover:text-[#f5c518] transition leading-none">
                {author?.name}
              </p>
              <p className="text-[10px] text-[#555555] flex items-center gap-1 mt-0.5">
                <Calendar size={9} /> {formattedDate}
              </p>
            </div>
          </Link>

          {/* Review body */}
          {blog.blogContent && (
            <article className="prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-p:text-[#aaaaaa] prose-p:leading-relaxed prose-p:my-2
              prose-a:text-[#f5c518] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white
              prose-blockquote:border-l-[#f5c518] prose-blockquote:text-[#888888] prose-blockquote:my-3
              prose-img:rounded-xl prose-img:my-4
              prose-code:text-[#f5c518] prose-code:bg-white/5 prose-code:px-1
            ">
              <div dangerouslySetInnerHTML={{ __html: blog.blogContent }} />
            </article>
          )}
        </div>
      </div>

      {/* ── RIGHT COLUMN — meta + comments ── */}
      <div className="w-[360px] shrink-0 flex flex-col bg-[#0d0d0d] overflow-hidden">

        {/* Meta panel */}
        <div className="px-5 py-5 border-b border-white/5 space-y-4 shrink-0">

          {/* Rating display */}
          {rating !== null && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#f5c518]/10 flex items-center justify-center">
                  <Star size={14} className="text-[#f5c518] fill-[#f5c518]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#555555] uppercase tracking-widest">Rating</p>
                  <p className={`text-xl font-black leading-none ${ratingColor(rating)}`}>
                    {rating}<span className="text-xs text-[#555555] font-normal">/10</span>
                  </p>
                </div>
              </div>
              {/* Star dots visual */}
              <div className="flex gap-0.5">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-4 rounded-sm ${i < Math.round(rating) ? "bg-[#f5c518]" : "bg-white/10"}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {cleanDescription && (
            <p className="text-sm text-[#888888] leading-relaxed border-l-2 border-[#f5c518]/30 pl-3 italic">
              {cleanDescription}
            </p>
          )}

          {/* Watchlist button */}
          {!isOwner && isAuth && (
            <button
              onClick={handleSaveBlog}
              disabled={savingBookmark}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                bookmarked
                  ? "bg-[#f5c518] text-[#0a0a0a] hover:bg-[#f5c518]/90"
                  : "border border-white/10 text-[#888888] hover:border-[#f5c518]/40 hover:text-[#f5c518] hover:bg-[#f5c518]/5"
              }`}
            >
              <Bookmark size={14} className={bookmarked ? "fill-[#0a0a0a]" : ""} />
              {savingBookmark ? "Saving..." : bookmarked ? "Watchlisted" : "Add to Watchlist"}
            </button>
          )}
        </div>

        {/* Comments — scrollable */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Comments header */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 shrink-0">
            <MessageSquare size={13} className="text-[#f5c518]" />
            <span className="text-xs font-semibold text-[#f0ece3] uppercase tracking-widest">
              Discussion
            </span>
            {comments.length > 0 && (
              <span className="ml-auto text-[10px] text-[#444444]">{comments.length}</span>
            )}
          </div>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 opacity-40">
                <MessageSquare size={24} className="text-[#333333]" />
                <p className="text-xs text-[#444444]">No comments yet</p>
              </div>
            ) : (
              comments.map(c => (
                <div key={c.id} className="group bg-[#111111] rounded-xl p-3 border border-white/5 hover:border-white/10 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <p className="text-xs font-semibold text-[#f0ece3] truncate">{c.username}</p>
                        <span className="text-[#2a2a2a] text-xs">·</span>
                        <p className="text-[10px] text-[#444444] shrink-0">
                          {new Date(c.created_at).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                      <p className="text-xs text-[#888888] leading-relaxed">{c.comment}</p>
                    </div>
                    {isAuth && user?._id === c.userid && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="opacity-0 group-hover:opacity-100 text-[#333333] hover:text-red-400 transition shrink-0 mt-0.5"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment input — pinned to bottom */}
          <div className="p-4 border-t border-white/5 shrink-0">
            {isAuth ? (
              <div className="flex gap-2">
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handlePostComment()}
                  placeholder="Add a comment..."
                  className="flex-1 h-9 px-3 rounded-lg bg-[#161616] border border-white/10 text-[#f0ece3] text-xs placeholder:text-[#444444] focus:outline-none focus:border-[#f5c518]/40 transition"
                />
                <button
                  onClick={handlePostComment}
                  disabled={posting || !commentText.trim()}
                  className="w-9 h-9 rounded-lg bg-[#f5c518] flex items-center justify-center text-[#0a0a0a] hover:bg-[#f5c518]/90 transition disabled:opacity-40 shrink-0"
                >
                  <Send size={13} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center justify-center gap-2 w-full h-9 rounded-lg border border-white/10 text-[#555555] hover:text-[#f5c518] hover:border-[#f5c518]/20 transition text-xs font-medium">
                <Clapperboard size={12} /> Sign in to comment
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPage