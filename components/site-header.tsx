"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useNewsStore } from "@/store/newsStore"
import { useNewsGeneration } from "@/hooks/useNewsGeneration"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { RefreshCw } from "lucide-react"

export function SiteHeader() {
  const pathname = usePathname()
  const { selectedSection } = useNewsStore()
  const { generateNews, isGenerating, progress } = useNewsGeneration()
  const articleCount = useNewsStore((state) => state.articleCount)
  const setArticleCount = useNewsStore((state) => state.setArticleCount)

  const handleRefresh = async () => {
    await generateNews(
      selectedSection === "Breaking News" ? "breaking" : "section",
      selectedSection,
      articleCount
    )
  }

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
          <div className="flex items-center gap-4">
            <Select
              value={articleCount.toString()}
              onValueChange={(value) => setArticleCount(parseInt(value))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Number of articles" />
              </SelectTrigger>
              <SelectContent>
                {[3, 5, 10, 15, 20].map((count) => (
                  <SelectItem key={count} value={count.toString()}>
                    {count} Articles
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleRefresh}
              disabled={isGenerating}
              size="icon"
              variant="ghost"
              className={cn(
                "h-8 w-8",
                isGenerating && "animate-spin"
              )}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh articles</span>
            </Button>
            {isGenerating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Progress value={progress} className="w-[60px]" />
                <span>{Math.round(progress)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
