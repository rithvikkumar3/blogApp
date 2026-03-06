"use client"

import React, { useEffect } from "react"
import Cookies from "js-cookie"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FcGoogle } from "react-icons/fc"
import { useAppData, User, user_service } from "@/context/AppContext"
import toast from "react-hot-toast"
import { useGoogleLogin } from "@react-oauth/google"
import axios from "axios"
import { useRouter } from "next/navigation"
import Loading from "@/components/loading"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface LoginResponse {
  message: string
  token: string
  user: User
}

interface GoogleAuthResult {
  code?: string
  error?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const LoginPage = () => {
  const router = useRouter()
  const { isAuth, setIsAuth, loading, setLoading, setUser } = useAppData()

  // Redirect authenticated users — safely in useEffect, not during render
  useEffect(() => {
    if (isAuth) {
      router.push("/blogs")
    }
  }, [isAuth, router])

  const responseGoogle = async (authResult: GoogleAuthResult) => {
    if (!authResult.code) {
      toast.error("Google login failed")
      return
    }

    setLoading(true)
    try {
      const result = await axios.post<LoginResponse>(
        `${user_service}/api/v1/login`,
        { code: authResult.code }
      )
      Cookies.set("token", result.data.token, {
        expires: 5,
        secure: true,
        path: "/",
      })
      toast.success(result.data.message)
      setIsAuth(true)
      setUser(result.data.user)
      router.push("/blogs")
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Problem while logging in")
    } finally {
      setLoading(false)
    }
  }

  // Hook always called at top level — no early returns before this
  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  })

  if (loading) return <Loading />

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <Card className="w-full max-w-md border border-gray-200 shadow-xl rounded-2xl">
        <CardHeader className="text-center space-y-3 pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-500">
            Sign in to continue to{" "}
            <span className="font-medium text-gray-700">The Daily Fold</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Button
            className="w-full flex items-center justify-center gap-3 py-6 text-base font-medium transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            variant="outline"
            onClick={() => googleLogin()}
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </Button>

          <p className="text-xs text-center text-gray-400">
            By continuing, you agree to our Terms &amp; Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage