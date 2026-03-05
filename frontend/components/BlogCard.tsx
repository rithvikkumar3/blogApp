import Link from 'next/link'
import React from 'react'
import { Card } from './ui/card'
import { Calendar } from 'lucide-react'

interface BlogCardProps {
  image: string
  title: string
  description: string
  id: string
  time: string
}

const BlogCard: React.FC<BlogCardProps> = ({
  image,
  title,
  description,
  id,
  time
}) => {

  const formattedDate = new Date(time).toLocaleDateString("en-GB")

  return (
    <Link href={`/blog/${id}`} className="group">
      <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">

        {/* Image */}
        <div className="relative w-full h-52 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="p-5">

          {/* Date */}
          <p className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Calendar size={14} />
            <span>{formattedDate}</span>
          </p>

          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {description}
          </p>

        </div>

      </Card>
    </Link>
  )
}

export default BlogCard