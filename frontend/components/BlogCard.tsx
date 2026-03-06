"use client"

import Link from "next/link"
import React from "react"
import Image from "next/image"
import { Card } from "./ui/card"
import { Calendar } from "lucide-react"

interface BlogCardProps {
  image: string
  title: string
  description: string
  id: string
  createdAt: string
}

const BlogCard: React.FC<BlogCardProps> = ({
  image,
  title,
  description,
  id,
  createdAt,
}) => {
  const date = new Date(createdAt)
  const formattedDate = isNaN(date.getTime())
    ? "Unknown date"
    : date.toLocaleDateString("en-GB")

  return (
    <Link href={`/blog/${id}`} className="group block h-full">
      <Card className="h-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

        {/* Image */}
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          <Image
            src={image}
            alt={title || "Blog image"}
            fill
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-2">
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar size={14} className="opacity-70" />
            <span>{formattedDate}</span>
          </p>

          <h2 className="text-lg font-semibold text-gray-800 line-clamp-1 transition-colors duration-200 group-hover:text-blue-600">
            {title}
          </h2>

          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

      </Card>
    </Link>
  )
}

export default BlogCard