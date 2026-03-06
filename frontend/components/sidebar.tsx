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
import { LayoutGrid, Search, Tag, Newspaper } from 'lucide-react'
import { useAppData, blogCategories } from '@/context/AppContext'

// Matches exactly the categories defined in AppContext
const categoryIcons: Record<string, React.ReactNode> = {
    Technology:    <Tag size={14} />,
    Health:        <Tag size={14} />,
    Finance:       <Tag size={14} />,
    Travel:        <Tag size={14} />,
    Education:     <Tag size={14} />,
    Entertainment: <Tag size={14} />,
    Study:         <Tag size={14} />,
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
        <Sidebar className="border-r border-zinc-100 shadow-sm">
            {/* Header */}
            <SidebarHeader className="bg-white px-5 py-5 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                    <div className="bg-zinc-900 text-white rounded-md p-1.5">
                        <Newspaper size={16} />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-zinc-900">
                        The Daily Fold
                    </span>
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-white px-3 py-4">

                {/* Search */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-1.5">
                        <Search size={11} />
                        Search
                    </SidebarGroupLabel>
                    <div className="relative">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                        />
                        <Input
                            className="pl-8 h-9 text-sm bg-zinc-50 border-zinc-200 rounded-lg placeholder:text-zinc-400 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search articles..."
                        />
                    </div>
                </SidebarGroup>

                {/* Categories */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-1.5">
                        <LayoutGrid size={11} />
                        Categories
                    </SidebarGroupLabel>
                    <SidebarMenu className="space-y-0.5">

                        {/* All Articles */}
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() => handleCategoryClick("")}
                                className={`
                                    w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                                    ${activeCategory === ""
                                        ? "bg-zinc-900 text-white shadow-sm"
                                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                    }
                                `}
                            >
                                <LayoutGrid size={14} />
                                <span>All Articles</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        {/* Dynamic categories */}
                        {blogCategories.map((category) => (
                            <SidebarMenuItem key={category}>
                                <SidebarMenuButton
                                    onClick={() => handleCategoryClick(category)}
                                    className={`
                                        w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                                        ${activeCategory === category
                                            ? "bg-zinc-900 text-white shadow-sm"
                                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                        }
                                    `}
                                >
                                    {categoryIcons[category] ?? <Tag size={14} />}
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