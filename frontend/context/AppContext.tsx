"use client"

import { createContext, ReactNode, useState, useEffect, useContext } from "react"
import Cookies from "js-cookie"
import axios from "axios"

import toast, { Toaster } from "react-hot-toast"

import { GoogleOAuthProvider } from "@react-oauth/google"

export const user_service = "http://localhost:5000"
export const author_service = "http://localhost:5001"
export const blog_service = "http://localhost:5002"


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
  author: User
  created_at: string
}

interface AppContextType {
    user: User | null
    isAuth: boolean
    loading: boolean
    setUser: React.Dispatch<React.SetStateAction<User | null>>
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    fetchUser: () => void
    logoutUser: ()=> Promise<void>
    blogs: Blog[] | null
    blogLoading: boolean
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>
    searchQuery: string
    setCategory: React.Dispatch<React.SetStateAction<string>>
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
    children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isAuth, setIsAuth] = useState(false)
    const [loading, setLoading] = useState(true)

    async function fetchUser() {
        try {
            const token = Cookies.get("token")

            const { data } = await axios.get<User>(`${user_service}/api/v1/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(data)
            setIsAuth(true)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const [blogLoading, setBlogLoading] = useState(true)
    const [blogs, setBlogs] = useState<Blog[] | null>(null)

    const [category, setCategory] = useState("")
    const [searchQuery, setSearchQuery] = useState("")

    async function fetchBlogs(){
        setBlogLoading(true)
        try {
            const {data} = await axios.get(`${blog_service}/api/v1/blog/all?searchQuery=${searchQuery}&category=${category}`)

            setBlogs(data)
        } catch (error) {
            console.log(error);
            
        }
        finally{
            setBlogLoading(false)
        }
    }

    async function logoutUser(){
        Cookies.remove("token")
        setUser(null)
        setIsAuth(false)
        toast.success("User Logged Out")
    }

    useEffect(() => {
        fetchUser()
    }, [])

    useEffect(() => {
        fetchBlogs()
    }, [searchQuery,category])

    

    return (
        <AppContext.Provider value={{ user, setIsAuth, isAuth, loading, setLoading, 
        setUser, fetchUser, logoutUser, blogs, blogLoading, setCategory, setSearchQuery, searchQuery }}>
            <GoogleOAuthProvider clientId="596984605688-tr8qvm6q950sejabjgchvpn7bo7ui097.apps.googleusercontent.com">
                {children}
                <Toaster />
            </GoogleOAuthProvider>
        </AppContext.Provider>
    )
}

export const useAppData = (): AppContextType => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error("UserAppData must be used within AppProvider")
    }
    return context;
}