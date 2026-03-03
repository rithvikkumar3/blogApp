"use client"

import { createContext, ReactNode, useState, useEffect, useContext } from "react"
import Cookies from "js-cookie"
import axios from "axios"

import { Toaster } from "react-hot-toast"

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

interface AppContextType {
    user: User | null
    isAuth: boolean
    loading: boolean
    setUser: React.Dispatch<React.SetStateAction<User | null>>
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    fetchUser: () => void
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

            const { data } = await axios.get(`${user_service}/api/v1/me`, {
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

    useEffect(() => {
        fetchUser()
    }, [])

    return (
        <AppContext.Provider value={{ user, setIsAuth, isAuth, loading, setLoading, setUser, fetchUser }}>
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