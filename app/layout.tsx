import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

// Framer-style: Use Inter for both body and headings (clean, modern)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // Better font loading
})

export const metadata: Metadata = {
  title: "Spotlight Estate Group - Luxury Real Estate",
  description: "Discover premium properties in Greece with Spotlight Estate Group",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
