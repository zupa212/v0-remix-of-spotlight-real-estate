"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, Menu, X, Globe } from "lucide-react"
import { useState } from "react"

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [language, setLanguage] = useState<"en" | "gr">("en")

  const navigation = [
    { name: "Properties", href: "/properties" },
    { name: "Regions", href: "/regions" },
    { name: "Agents", href: "/agents" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Building2 className="h-8 w-8 text-slate-900 group-hover:text-sky-500 transition-colors" />
            <span className="text-2xl font-bold text-slate-900">Spotlight</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                {item.name}
              </Link>
            ))}

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === "en" ? "gr" : "en")}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              <Globe className="h-4 w-4" />
              {language.toUpperCase()}
            </button>

            <Button asChild size="sm" className="bg-slate-900 hover:bg-slate-800">
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-slate-700">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-base font-medium text-slate-700 hover:text-slate-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={() => setLanguage(language === "en" ? "gr" : "en")}
                className="flex items-center gap-2 text-base font-medium text-slate-700 hover:text-slate-900"
              >
                <Globe className="h-4 w-4" />
                {language.toUpperCase()}
              </button>
              <Button asChild className="bg-slate-900 hover:bg-slate-800 w-full">
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
