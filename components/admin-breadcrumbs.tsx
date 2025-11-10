"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface AdminBreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function AdminBreadcrumbs({ items, className }: AdminBreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center space-x-2 text-sm text-slate-600 mb-6", className)} aria-label="Breadcrumb">
      <Link
        href="/admin"
        className="flex items-center hover:text-slate-900 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-slate-400" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-slate-900 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

