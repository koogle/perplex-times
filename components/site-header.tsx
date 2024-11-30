"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold tracking-wider">PERPLEX TIMES</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2">
          <nav className="flex items-center space-x-6">
            <Link
              href="/saved"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground/80",
                pathname === "/saved" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Saved Articles
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
