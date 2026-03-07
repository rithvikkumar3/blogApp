"use client"

import React, { useState } from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from './ui/sidebar'
import { Input } from './ui/input'
import {
    LayoutGrid, Search, Clapperboard,
    Zap, Heart, Eye, Smile, Rocket, Ghost, Film
} from 'lucide-react'
import { useAppData, blogCategories } from '@/context/AppContext'

// Genre icons mapped to film categories
const categoryIcons: Record<string, React.ReactNode> = {
    Action:      <Zap size={14} />,
    Drama:       <Heart size={14} />,
    Thriller:    <Eye size={14} />,
    Comedy:      <Smile size={14} />,
    "Sci-Fi":    <Rocket size={14} />,
    Horror:      <Ghost size={14} />,
    Documentary: <Film size={14} />,
}

const SideBar = () => {
    const { setSearchQuery, searchQuery, setCategory } = useAppData()
    const [activeCategory, setActiveCategory] = useState<string>("")

    const handleCategoryClick = (category: string) => {
        const next = activeCategory === category ? "" : category
        setActiveCategory(next)
        setCategory(next)
    }

    return (
        <Sidebar className="border-r border-white/5">
            {/* Header */}
            <SidebarHeader className="bg-[#0d0d0d] px-5 py-5 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-[#f5c518] flex items-center justify-center">
                        <Clapperboard size={14} className="text-[#0a0a0a]" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-sm font-bold tracking-tight text-white">
                            Screen<span className="text-[#f5c518]">Scoop</span>
                        </span>
                        <span className="text-[8px] tracking-widest uppercase text-[#555555] mt-0.5">
                            Film Reviews
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-[#0d0d0d] px-3 py-4">

                {/* Search */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#555555] mb-2 flex items-center gap-1.5 px-1">
                        <Search size={10} />
                        Search
                    </SidebarGroupLabel>
                    <div className="relative">
                        <Search
                            size={13}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555] pointer-events-none"
                        />
                        <Input
                            className="pl-8 h-9 text-sm bg-[#161616] border-white/10 rounded-lg placeholder:text-[#444444] text-[#f0ece3] focus:ring-1 focus:ring-[#f5c518]/50 focus:border-[#f5c518]/50 transition-all"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search reviews..."
                        />
                    </div>
                </SidebarGroup>

                {/* Genres */}
                <SidebarGroup className="mt-2">
                    <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#555555] mb-2 flex items-center gap-1.5 px-1">
                        <LayoutGrid size={10} />
                        Genres
                    </SidebarGroupLabel>
                    <SidebarMenu className="space-y-0.5">

                        {/* All Films */}
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() => handleCategoryClick("")}
                                className={`
                                    w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                    ${activeCategory === ""
                                        ? "bg-[#f5c518] text-[#0a0a0a] shadow-[0_0_15px_rgba(245,197,24,0.2)]"
                                        : "text-[#888888] hover:bg-white/5 hover:text-white"
                                    }
                                `}
                            >
                                <LayoutGrid size={14} />
                                <span>All Films</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        {/* Genre buttons */}
                        {blogCategories.map((category) => (
                            <SidebarMenuItem key={category}>
                                <SidebarMenuButton
                                    onClick={() => handleCategoryClick(category)}
                                    className={`
                                        w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                        ${activeCategory === category
                                            ? "bg-[#f5c518] text-[#0a0a0a] shadow-[0_0_15px_rgba(245,197,24,0.2)]"
                                            : "text-[#888888] hover:bg-white/5 hover:text-white"
                                        }
                                    `}
                                >
                                    {categoryIcons[category] ?? <LayoutGrid size={14} />}
                                    <span>{category}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}

                    </SidebarMenu>
                </SidebarGroup>

            </SidebarContent>
        </Sidebar>
    )
}

export default SideBar