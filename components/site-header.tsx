"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Newspaper, BookmarkIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNewsStore } from "@/store/newsStore"

export function SiteHeader() {
  const pathname = usePathname()
  const { sections, customTopics, setSelectedSection } = useNewsStore()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center space-x-2">
          <Newspaper className="h-6 w-6" />
          <span className="font-bold">Perplex Times</span>
        </div>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === "/" ? "text-foreground" : "text-foreground/60"
            )}
          >
            Home
          </Link>
          <Link
            href="/saved"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === "/saved" ? "text-foreground" : "text-foreground/60"
            )}
          >
            <div className="flex items-center space-x-1">
              <BookmarkIcon className="h-4 w-4" />
              <span>Saved Articles</span>
            </div>
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              {section}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
