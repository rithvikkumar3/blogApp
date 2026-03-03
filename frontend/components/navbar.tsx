"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { CircleUserRound, LogInIcon, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppData } from "@/context/AppContext";

const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false);

  const {loading, isAuth} = useAppData()

  return (
    <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm z-50">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">

        {/* Logo */}
        <Link
          href={"/"}
          className="text-2xl font-bold tracking-tight text-gray-900 hover:opacity-80 transition"
        >
          The Daily Fold
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-700">
          <li>
            <Link
              href={"/"}
              className="relative hover:text-black transition"
            >
              Home
            </Link>
          </li>

          <li>
            <Link
              href={"/blog/saved"}
              className="relative hover:text-black transition"
            >
              Saved Blogs
            </Link>
          </li>

          {loading ? "" :<li>
          { isAuth ? <Link
              href={"/profile"}
              className="p-2 rounded-full hover:bg-gray-100 transition">
              <CircleUserRound/>
            </Link>
             : 
            <Link
              href={"/login"}
              className="p-2 rounded-full hover:bg-gray-100 transition">
              <LogInIcon className="w-5 h-5" />
            </Link>}
          </li>}
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full hover:bg-gray-100 transition"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-800" />
            ) : (
              <Menu className="w-6 h-6 text-gray-800" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ul className="flex flex-col items-center space-y-5 py-6 text-sm font-medium text-gray-700 bg-white border-t border-gray-100">
          <li>
            <Link
              href={"/"}
              className="hover:text-black transition"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </li>

          <li>
            <Link
              href={"/blog/saved"}
              className="hover:text-black transition"
              onClick={() => setIsOpen(false)}
            >
              Saved Blogs
            </Link>
          </li>

          <li>
            <Link
              href={"/login"}
              className="flex items-center gap-2 hover:text-black transition"
              onClick={() => setIsOpen(false)}
            >
              <LogInIcon className="w-5 h-5" />
              Login
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;