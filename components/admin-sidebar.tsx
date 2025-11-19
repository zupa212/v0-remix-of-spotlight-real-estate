"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  Calendar,
  MapPin,
  UserCircle,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Settings,
  Shield,
  FileText,
} from "lucide-react"
import * as React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useSettings } from "@/lib/hooks/use-settings"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { settings } = useSettings()
  
  // Prevent hydration mismatch by only accessing localStorage after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  // Get logo URL from settings or localStorage fallback (only after mount)
  const logoUrl = React.useMemo(() => {
    if (settings?.logo_url) return settings.logo_url
    if (mounted && typeof window !== "undefined") {
      return localStorage.getItem("admin-logo-url")
    }
    return null
  }, [settings?.logo_url, mounted])

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Properties", href: "/admin/properties", icon: Building2 },
    { name: "Leads", href: "/admin/leads", icon: MessageSquare },
    { name: "Viewings", href: "/admin/viewings", icon: Calendar },
    { name: "Agents", href: "/admin/agents", icon: Users },
    { name: "Regions", href: "/admin/regions", icon: MapPin },
    { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
    { name: "Marketing", href: "/admin/marketing", icon: TrendingUp },
    { name: "Privacy", href: "/admin/privacy", icon: Shield },
    { name: "Audit Logs", href: "/admin/audit", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-background border border-border rounded-md shadow-lg"
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isMobileMenuOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-5 w-5 text-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-5 w-5 text-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isMobileMenuOpen ? 0 : undefined }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64",
          "bg-background border-r border-border",
          "transform transition-transform duration-200 ease-in-out",
          "lg:translate-x-0",
          "top-16 lg:top-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link href="/admin">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 px-6 py-6 border-b border-border hover:bg-accent/5 transition-colors cursor-pointer"
            >
              {logoUrl ? (
                <>
                  <div className="relative h-10 w-10 flex-shrink-0">
                    <Image
                      src={logoUrl}
                      alt={settings?.company_name || "Logo"}
                      fill
                      className="object-contain"
                      priority
                      unoptimized
                    />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white font-display">
                      {settings?.company_name || "Spotlight"}
                    </div>
                    <div className="text-xs text-muted-foreground">Admin Panel</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-primary">S</span>
                  </div>
                  <div>
                    <div className="text-base font-bold text-white font-display">
                      {settings?.company_name || "Spotlight"}
                    </div>
                    <div className="text-xs text-muted-foreground">Admin Panel</div>
                  </div>
                </>
              )}
            </motion.div>
          </Link>

          {/* Navigation */}
          <ScrollArea className="flex-1">
            <nav className="px-4 py-6 space-y-1">
              {navigation.map((item, index) => {
                const isActive = pathname === item.href
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.03 }}
                  >
                    <Button
                      asChild
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 text-white",
                        isActive && "bg-accent text-white"
                      )}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-white font-bold"
                      >
                        <item.icon className="h-4 w-4 text-white" />
                        <span className="text-white font-bold">{item.name}</span>
                      </Link>
                    </Button>
                  </motion.div>
                )
              })}
            </nav>
          </ScrollArea>

          <Separator />
          {/* User Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4"
          >
            <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-md">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <UserCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate text-foreground">Admin User</div>
                <div className="text-xs text-muted-foreground truncate">admin@spotlight.gr</div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/50"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </motion.aside>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
