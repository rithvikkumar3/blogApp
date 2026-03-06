"use client"

import { createContext, ReactNode, useState, useEffect, useContext } from "react"
import Cookies from "js-cookie"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"
import { GoogleOAuthProvider } from "@react-oauth/google"

export const user_service = "https://user-service-bwex.onrender.com"
export const author_service = "https://author-service-1xb8.onrender.com"
export const blog_service = "https://blog-service-62kz.onrender.com"

export const blogCategories = [
    "Technology",
    "Health",
    "Finance",
    "Travel",
    "Education",
    "Entertainment",
    "Study"
]

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

    async function getSavedBlogs() {
        const token = Cookies.get("token")
        if (!token) return

        try {
            const { data } = await axios.get<SavedBlogType[]>(
                `${blog_service}/api/v1/blog/saved/all`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            setSavedBlogs(data)

        } catch (error) {
            console.error(error)
        }
    }

    async function fetchUser() {
        const token = Cookies.get("token")

        if (!token) {
            setLoading(false)
            return
        }

        try {

            const { data } = await axios.get<User>(
                `${user_service}/api/v1/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            setUser(data)
            setIsAuth(true)

            await getSavedBlogs()

        } catch (error) {
            console.error(error)
            Cookies.remove("token")
        } finally {
            setLoading(false)
        }
    }

    async function fetchBlogs() {
        setBlogLoading(true)

        try {

            const { data } = await axios.get<Blog[]>(
                `${blog_service}/api/v1/blog/all`,
                {
                    params: {
                        searchQuery,
                        category
                    }
                }
            )

            setBlogs(data)

        } catch (error) {
            console.error(error)
            toast.error("Failed to fetch blogs")

        } finally {
            setBlogLoading(false)
        }
    }

    async function logoutUser() {
        Cookies.remove("token")
        setUser(null)
        setIsAuth(false)
        setSavedBlogs([])
        toast.success("User Logged Out")
    }

    useEffect(() => {
        fetchUser()
    }, [])

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchBlogs()
        }, 400)

        return () => clearTimeout(delayDebounce)
    }, [searchQuery, category])

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
                logoutUser
            }}
        >
            <GoogleOAuthProvider clientId="596984605688-tr8qvm6q950sejabjgchvpn7bo7ui097.apps.googleusercontent.com">
                {children}
                <Toaster />
            </GoogleOAuthProvider>
        </AppContext.Provider>
    )
}

export const useAppData = () => {
    const context = useContext(AppContext)

    if (!context) {
        throw new Error("useAppData must be used within AppProvider")
    }

    return context
}