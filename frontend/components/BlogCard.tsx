"use client"

import Link from "next/link"
import React from "react"
import Image from "next/image"
import { Calendar, Star } from "lucide-react"

interface BlogCardProps {
  image: string
  title: string
  description: string
  id: string
  createdAt: string
  category?: string
}

// Extract rating from blogContent if stored as data-rating attribute
function extractRating(description: string): number | null {
  const match = description.match(/\[rating:(\d+(?:\.\d+)?)\]/i)
  return match ? parseFloat(match[1]) : null
}

const BlogCard: React.FC<BlogCardProps> = ({
  image,
  title,
  description,
  id,
  createdAt,
  category,
}) => {
  const date = new Date(createdAt)
  const formattedDate = isNaN(date.getTime())
    ? "Unknown date"
    : date.toLocaleDateString("en-GB")

  const rating = extractRating(description)

  return (
    <Link href={`/blog/${id}`} className="group block h-full">
      <div className="h-full overflow-hidden rounded-xl border border-white/5 bg-[#111111] transition-all duration-300 hover:-translate-y-1 hover:border-[#f5c518]/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">

        {/* Image */}
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          <Image
            src={image}
            alt={title || "Film review"}
            fill
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-60" />

          {/* Genre badge */}
          {category && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-[#f5c518] text-[#0a0a0a]">
                {category}
              </span>
            </div>
          )}

          {/* Rating badge */}
          {rating !== null && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-md px-2 py-1">
              <Star size={10} className="text-[#f5c518] fill-[#f5c518]" />
              <span className="text-xs font-bold text-white">{rating}/10</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2">

          {/* Date */}
          <p className="flex items-center gap-1.5 text-[11px] text-[#555555]">
            <Calendar size={11} />
            <span>{formattedDate}</span>
          </p>

          {/* Title */}
          <h2 className="text-base font-bold text-[#f0ece3] line-clamp-1 transition-colors duration-200 group-hover:text-[#f5c518] leading-snug">
            {title}
          </h2>

          {/* Description */}
          <p className="text-xs text-[#666666] leading-relaxed line-clamp-2">
            {description.replace(/\[rating:\d+(?:\.\d+)?\]/i, "").trim()}
          </p>

        </div>

      </div>
    </Link>
  )
}

export default BlogCard