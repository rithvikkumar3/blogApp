"use client"
import React from "react"

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 z-50">
      
      <div className="relative flex flex-col items-center gap-6">

        <div className="relative flex items-center justify-center">
          
          {/* Glow */}
          <div className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 blur-2xl opacity-40"></div>

          {/* Spinner */}
          <div className="w-20 h-20 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>

        </div>

        <div className="text-center space-y-1">
          <h2 className="text-lg font-semibold text-gray-800 tracking-wide">
            Loading your experience
          </h2>
          <p className="text-sm text-gray-500 animate-pulse">
            Just a moment...
          </p>
        </div>

      </div>
    </div>
  )
}

export default Loading