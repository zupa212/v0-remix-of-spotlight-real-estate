"use client"

import * as React from "react"
import { Search, Globe } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AdminThemeToggle } from "@/components/admin-theme-toggle"
import { AdminCommandDialog } from "@/components/admin-command-dialog"
import { getAdminDict, type Locale } from "@/lib/i18n"
import { useRouter } from "next/navigation"

interface AdminHeaderBarProps {
  locale?: Locale
  onLocaleChange?: (locale: Locale) => void
}

export function AdminHeaderBar({ locale = "en", onLocaleChange }: AdminHeaderBarProps) {
  const router = useRouter()
  const dict = getAdminDict(locale)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [commandOpen, setCommandOpen] = React.useState(false)

  const handleLocaleChange = (newLocale: Locale) => {
    onLocaleChange?.(newLocale)
    // You can persist this to localStorage or cookies
    if (typeof window !== "undefined") {
      localStorage.setItem("admin-locale", newLocale)
    }
  }

  React.useEffect(() => {
    // Load saved locale
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin-locale") as Locale | null
      if (saved && (saved === "en" || saved === "gr")) {
        onLocaleChange?.(saved)
      }
    }
  }, [onLocaleChange])

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setCommandOpen(true)}
              className="pl-9 cursor-pointer"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Change language">
                <Globe className="h-4 w-4" />
                <span className="sr-only">Change language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleLocaleChange("en")}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLocaleChange("gr")}>
                Ελληνικά
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <AdminThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full" aria-label="User menu">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={undefined} alt="Admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin User</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@spotlight.gr
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  // Handle sign out
                  router.push("/admin/login")
                }}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <AdminCommandDialog open={commandOpen} onOpenChange={setCommandOpen} />
    </header>
  )
}

