"use client"
import React from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import { useAppData, User, user_service } from "@/context/AppContext";
import toast from "react-hot-toast";
import {useGoogleLogin} from '@react-oauth/google'
import axios from "axios"
import { redirect } from "next/navigation";
import Loading from "@/components/loading";

const LoginPage = () => {

  const {isAuth, setIsAuth, loading, setLoading, setUser} = useAppData()

  if(isAuth){
    return redirect("/blogs")
  }
  
  interface LoginResponse {
  message: string
  token: string
  user: User
}

  const responseGoogle = async(authResult: any) =>{
    setLoading(true)
    try {
      const result = await axios.post<LoginResponse>(`${user_service}/api/v1/login`,{
        code: authResult["code"]
      })
      Cookies.set("token", result.data.token,{
        expires: 5,
        secure: true,
        path: "/",
      })
      toast.success(result.data.message)
      setIsAuth(true)
      setLoading(false)
      setUser(result.data.user)
    } catch (error) {
      console.log("error", error);
      toast.error("Problem while login user")
      setLoading(false)
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code"
  })
  return (
    <>
    {
      loading ? <Loading/> : 
          <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4">
      <Card className="w-full max-w-md border border-gray-200 shadow-xl rounded-2xl">
        <CardHeader className="text-center space-y-3 pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-500">
            Sign in to continue to <span className="font-medium text-gray-700">The Daily Fold</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Button
            className="w-full flex items-center justify-center gap-3 py-6 text-base font-medium transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            variant="outline"
            onClick={googleLogin}
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </Button>

          <p className="text-xs text-center text-gray-400">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
    }
    </>
  );
};

export default LoginPage;