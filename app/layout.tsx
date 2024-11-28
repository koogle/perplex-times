import type { Metadata } from "next"
import { IBM_Plex_Sans as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import "./globals.css"

export const fontSans = FontSans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Perplex Times",
  description: "AI-powered personalized news",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}>{children}</body>
    </html>
  )
}

