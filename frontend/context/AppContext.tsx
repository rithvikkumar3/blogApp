"use client"

import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react"
import Cookies from "js-cookie"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"
import { GoogleOAuthProvider } from "@react-oauth/google"

// ---------------------------------------------------------------------------
// Service base URLs
// ---------------------------------------------------------------------------
export const user_service = process.env.NEXT_PUBLIC_USER_SERVICE ?? ""
export const author_service = process.env.NEXT_PUBLIC_AUTHOR_SERVICE ?? ""
export const blog_service = process.env.NEXT_PUBLIC_BLOG_SERVICE ?? ""

// ---------------------------------------------------------------------------
// Film genres (replaces old blog categories)
// ---------------------------------------------------------------------------
export const blogCategories = [
  "Action",
  "Drama",
  "Thriller",
  "Comedy",
  "Sci-Fi",
  "Horror",
  "Documentary",
  "Rom-Com",
]

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------
export interface User {
  _id: string
  name: string
  email: string
  image: string
  instagram: string
  linkedin: string
  bio: string
}

export interface Blog {
  id: string
  title: string
  description: string
  category: string
  image: string
  author: string
  created_at: string
  blogContent: string
}

export interface SavedBlogType {
  id: number
  userid: string
  blogid: string
  created_at: string
}

interface AppContextType {
  user: User | null
  isAuth: boolean
  loading: boolean
  blogs: Blog[]
  blogLoading: boolean
  savedBlogs: SavedBlogType[]
  searchQuery: string
  category: string

  setUser: React.Dispatch<React.SetStateAction<User | null>>
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
  setCategory: React.Dispatch<React.SetStateAction<string>>

  fetchUser: () => Promise<void>
  fetchBlogs: () => Promise<void>
  getSavedBlogs: () => Promise<void>
  logoutUser: () => Promise<void>
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
export const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)

  const [blogs, setBlogs] = useState<Blog[]>([])
  const [blogLoading, setBlogLoading] = useState(false)

  const [savedBlogs, setSavedBlogs] = useState<SavedBlogType[]>([])

  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("")

  // -------------------------------------------------------------------------
  // getSavedBlogs
  // -------------------------------------------------------------------------
  const getSavedBlogs = useCallback(async () => {
    const token = Cookies.get("token")
    if (!token) return

    try {
      const { data } = await axios.get<SavedBlogType[]>(
        `${blog_service}/api/v1/blog/saved/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSavedBlogs(data)
    } catch (error) {
      console.error("Failed to fetch saved blogs:", error)
    }
  }, [])

  // -------------------------------------------------------------------------
  // fetchUser
  // -------------------------------------------------------------------------
  const fetchUser = useCallback(async () => {
    const token = Cookies.get("token")

    if (!token) {
      setLoading(false)
      return
    }

    try {
      const { data } = await axios.get<User>(`${user_service}/api/v1/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(data)
      setIsAuth(true)
      await getSavedBlogs()
    } catch (error) {
      console.error("Failed to fetch user:", error)
      Cookies.remove("token")
    } finally {
      setLoading(false)
    }
  }, [getSavedBlogs])

  // -------------------------------------------------------------------------
  // fetchBlogs
  // -------------------------------------------------------------------------
  const fetchBlogs = useCallback(
    async (query = searchQuery, cat = category) => {
      setBlogLoading(true)
      try {
        const { data } = await axios.get<Blog[]>(
          `${blog_service}/api/v1/blog/all`,
          { params: { searchQuery: query, category: cat } }
        )
        setBlogs(data)
      } catch (error) {
        console.error("Failed to fetch blogs:", error)
        toast.error("Failed to fetch reviews")
      } finally {
        setBlogLoading(false)
      }
    },
    [searchQuery, category]
  )

  // -------------------------------------------------------------------------
  // logoutUser
  // -------------------------------------------------------------------------
  const logoutUser = useCallback(async () => {
    Cookies.remove("token")
    setUser(null)
    setIsAuth(false)
    setSavedBlogs([])
    toast.success("Logged out successfully")
  }, [])

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBlogs(searchQuery, category)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, category]) // eslint-disable-line react-hooks/exhaustive-deps

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <AppContext.Provider
      value={{
        user,
        isAuth,
        loading,
        blogs,
        blogLoading,
        savedBlogs,
        searchQuery,
        category,
        setUser,
        setIsAuth,
        setLoading,
        setSearchQuery,
        setCategory,
        fetchUser,
        fetchBlogs,
        getSavedBlogs,
        logoutUser,
      }}
    >
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#161616",
              color: "#f0ece3",
              border: "1px solid #2a2a2a",
              borderRadius: "10px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#f5c518", secondary: "#0a0a0a" },
            },
          }}
        />
      </GoogleOAuthProvider>
    </AppContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const useAppData = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppData must be used within AppProvider")
  }
  return context
}