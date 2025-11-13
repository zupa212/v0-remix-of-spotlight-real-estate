"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
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
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20"
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
              <X className="h-6 w-6 text-slate-900" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-6 w-6 text-slate-900" />
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
          "fixed inset-y-0 left-0 z-40 w-64",
          "bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95",
          "backdrop-blur-xl border-r border-white/10",
          "shadow-2xl shadow-black/20",
          "transform transition-transform duration-200 ease-in-out",
          "lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 px-6 py-6 border-b border-white/10"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10"
            >
              <Building2 className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <div className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Spotlight
              </div>
              <div className="text-xs text-slate-400 font-medium">Admin Panel</div>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                      "group",
                      isActive
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg shadow-blue-500/10 border border-white/20"
                        : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "relative z-10",
                        isActive ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </motion.div>
                    <span className="relative z-10 font-medium">{item.name}</span>
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          {/* User Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 border-t border-white/10"
          >
            <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-sm border border-white/20 flex items-center justify-center"
              >
                <UserCircle className="h-6 w-6 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate text-white">Admin User</div>
                <div className="text-xs text-slate-400 truncate">admin@spotlight.gr</div>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl border border-transparent hover:border-white/10 transition-all"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            </motion.div>
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
