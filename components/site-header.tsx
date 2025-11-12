"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, ArrowUpRight } from "lucide-react"
import { useState } from "react"

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Properties", href: "/properties" },
    { name: "About", href: "/about" },
    { name: "Agents", href: "/agents" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E0E0E0]">
      <nav className="w-full px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo - Left Side - Text Logo */}
          <Link href="/" className="flex items-center group transition-opacity hover:opacity-80">
            <span 
              className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] tracking-tight"
              style={{ 
                fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: '1.1',
              }}
            >
              spott<span className="text-[#666666] font-normal">.</span>less
            </span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex lg:items-center lg:gap-8 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-[#666666] hover:text-[#1a1a1a] transition-colors relative"
                style={{ 
                  fontFamily: "var(--font-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif",
                  fontWeight: 500,
                }}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Contact Button - Right Side */}
          <div className="hidden lg:flex lg:items-center">
            <Button
              asChild
              className="bg-[#1a1a1a] hover:bg-[#000000] text-white rounded-full px-6 py-2.5 text-sm font-medium h-auto flex items-center gap-2 transition-colors"
            >
              <Link href="/contact">
                <span className="relative flex items-center gap-2">
                  <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-[#00FF00] animate-pulse" />
                  Contact Us Now
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#333333]"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#E0E0E0]">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-base font-medium text-[#666666] hover:text-[#1a1a1a] transition-colors"
                  style={{ 
                    fontFamily: "var(--font-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif",
                    fontWeight: 500,
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Button
                asChild
                className="bg-[#1a1a1a] hover:bg-[#000000] text-white rounded-full px-6 py-2.5 text-sm font-medium h-auto flex items-center gap-2 w-full justify-center transition-colors"
              >
                <Link href="/contact">
                  <span className="relative flex items-center gap-2">
                    <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-[#00FF00]" />
                    Contact Us Now
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
