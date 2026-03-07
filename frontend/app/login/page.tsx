"use client"

import React, { useEffect } from "react"
import Cookies from "js-cookie"
import { FcGoogle } from "react-icons/fc"
import { useAppData, User, user_service } from "@/context/AppContext"
import toast from "react-hot-toast"
import { useGoogleLogin } from "@react-oauth/google"
import axios from "axios"
import { useRouter } from "next/navigation"
import Loading from "@/components/loading"
import { Clapperboard, Star, Film } from "lucide-react"

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

  useEffect(() => {
    if (isAuth) router.push("/blogs")
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
      Cookies.set("token", result.data.token, { expires: 5, secure: true, path: "/" })
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

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  })

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">

      {/* Left — decorative cinematic panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden bg-[#0d0d0d] border-r border-white/5 p-12">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#f5c518] blur-[160px] opacity-[0.04]" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-[#f5c518] flex items-center justify-center">
            <Clapperboard size={18} className="text-[#0a0a0a]" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-lg font-bold text-white">Screen<span className="text-[#f5c518]">Scoop</span></p>
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#555555]">The inside scoop on films</p>
          </div>
        </div>

        {/* Center quote */}
        <div className="relative z-10 space-y-6">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className="text-[#f5c518] fill-[#f5c518]" />
            ))}
          </div>
          <blockquote className="text-3xl font-bold text-white leading-snug tracking-tight">
            "Cinema is a mirror<br />
            by which we often see<br />
            <span className="text-[#f5c518]">ourselves."</span>
          </blockquote>
          <p className="text-sm text-[#555555]">— Martin Scorsese</p>
        </div>

        {/* Bottom stats */}
        <div className="flex gap-8 relative z-10">
          {[
            { value: "10K+", label: "Reviews" },
            { value: "500+", label: "Critics" },
            { value: "50+", label: "Genres" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-[#555555] uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f5c518] blur-[120px] opacity-[0.03] pointer-events-none" />

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-lg bg-[#f5c518] flex items-center justify-center">
            <Clapperboard size={16} className="text-[#0a0a0a]" strokeWidth={2.5} />
          </div>
          <p className="text-lg font-bold text-white">Screen<span className="text-[#f5c518]">Scoop</span></p>
        </div>

        <div className="w-full max-w-sm space-y-8">
          {/* Heading */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#f5c518] mb-4">
              <Film size={14} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">Welcome back</span>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Sign in to<br />
              <span className="text-[#f5c518]">ScreenScoop</span>
            </h1>
            <p className="text-[#555555] text-sm pt-1">
              Review films, build your watchlist, join the conversation.
            </p>
          </div>

          {/* Google button */}
          <button
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-[#f0ece3] text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
          >
            <FcGoogle className="w-5 h-5 shrink-0" />
            <span>Continue with Google</span>
          </button>

          <p className="text-xs text-center text-[#333333]">
            By signing in, you agree to our Terms &amp; Privacy Policy
          </p>
        </div>
      </div>

    </div>
  )
}

export default LoginPage