"use client"

import React from "react"
import { Clapperboard } from "lucide-react"

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0a] z-50">

      {/* Ambient glow */}
      <div className="absolute w-64 h-64 rounded-full bg-[#f5c518] blur-[120px] opacity-5 pointer-events-none" />

      <div className="relative flex flex-col items-center gap-6">

        {/* Spinner ring + icon */}
        <div className="relative flex items-center justify-center">
          {/* Outer spinning ring */}
          <div className="w-20 h-20 rounded-full border-2 border-white/5 border-t-[#f5c518] animate-spin" />
          {/* Inner icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Clapperboard className="w-7 h-7 text-[#f5c518] opacity-90" strokeWidth={1.5} />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#f0ece3]">
            ScreenScoop
          </h2>
          <p className="text-xs text-[#555555] animate-pulse tracking-wide">
            Curating your cinema...
          </p>
        </div>

      </div>
    </div>
  )
}

export default Loading