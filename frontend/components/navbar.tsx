"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { CircleUserRound, LogInIcon, Menu, X, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppData } from "@/context/AppContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { loading, isAuth } = useAppData();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl">
      {/* Top gold accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#f5c518] to-transparent" />

      <div className="container mx-auto flex justify-between items-center px-6 py-4">

        {/* Logo */}
        <Link href="/blogs" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#f5c518] flex items-center justify-center transition-all duration-300 group-hover:glow-gold">
            <Clapperboard className="w-4 h-4 text-[#0a0a0a]" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-white">
              Screen<span className="text-[#f5c518]">Scoop</span>
            </span>
            <span className="text-[9px] tracking-[0.2em] uppercase text-[#888888] font-medium">
              The inside scoop on films
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-1 text-sm font-medium">
          <li>
            <Link
              href="/blogs"
              className="px-4 py-2 rounded-lg text-[#888888] hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              Discover
            </Link>
          </li>

          <li>
            <Link
              href="/blog/saved"
              className="px-4 py-2 rounded-lg text-[#888888] hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              Watchlist
            </Link>
          </li>

          <li className="ml-2">
            {loading ? (
              <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse" />
            ) : isAuth ? (
              <Link
                href="/profile"
                className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 hover:border-[#f5c518]/50 hover:bg-[#f5c518]/10 transition-all duration-200"
              >
                <CircleUserRound className="w-5 h-5 text-[#888888] hover:text-[#f5c518]" />
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  className="bg-[#f5c518] text-[#0a0a0a] hover:bg-[#f5c518]/90 font-semibold rounded-lg px-4 transition-all duration-200 hover:shadow-[0_0_20px_rgba(245,197,24,0.3)]"
                >
                  <LogInIcon className="w-4 h-4 mr-1.5" />
                  Sign In
                </Button>
              </Link>
            )}
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg hover:bg-white/5 text-[#888888] hover:text-white transition"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-white/5",
          isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ul className="flex flex-col px-6 py-4 gap-1 bg-[#0d0d0d]">
          <li>
            <Link
              href="/blogs"
              className="block px-4 py-3 rounded-lg text-[#888888] hover:text-white hover:bg-white/5 transition text-sm font-medium"
              onClick={() => setIsOpen(false)}
            >
              Discover
            </Link>
          </li>
          <li>
            <Link
              href="/blog/saved"
              className="block px-4 py-3 rounded-lg text-[#888888] hover:text-white hover:bg-white/5 transition text-sm font-medium"
              onClick={() => setIsOpen(false)}
            >
              Watchlist
            </Link>
          </li>
          <li className="pt-2">
            {isAuth ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-[#888888] hover:text-white hover:bg-white/5 transition text-sm font-medium"
                onClick={() => setIsOpen(false)}
              >
                <CircleUserRound className="w-4 h-4" />
                Profile
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#f5c518] text-[#0a0a0a] font-semibold text-sm transition hover:bg-[#f5c518]/90"
                onClick={() => setIsOpen(false)}
              >
                <LogInIcon className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;