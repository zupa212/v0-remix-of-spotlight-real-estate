"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  Users,
  Calendar,
  MapPin,
  LayoutDashboard,
  Plus,
  Search,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

interface AdminCommandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface AdminCommandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialSearch?: string
}

export function AdminCommandDialog({ open, onOpenChange, initialSearch = "" }: AdminCommandDialogProps) {
  const router = useRouter()
  const [search, setSearch] = React.useState(initialSearch)

  React.useEffect(() => {
    if (open) {
      setSearch(initialSearch)
    }
  }, [open, initialSearch])

  const runCommand = React.useCallback(
    (command: () => void) => {
      setSearch("")
      onOpenChange(false)
      command()
    },
    [onOpenChange]
  )

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const commands = [
    {
      group: "Navigation",
      items: [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          shortcut: "⌘D",
          action: () => router.push("/admin"),
        },
        {
          label: "Properties",
          icon: Building2,
          shortcut: "⌘P",
          action: () => router.push("/admin/properties"),
        },
        {
          label: "Leads",
          icon: Users,
          shortcut: "⌘L",
          action: () => router.push("/admin/leads"),
        },
        {
          label: "Viewings",
          icon: Calendar,
          shortcut: "⌘V",
          action: () => router.push("/admin/viewings"),
        },
        {
          label: "Regions",
          icon: MapPin,
          shortcut: "⌘R",
          action: () => router.push("/admin/regions"),
        },
      ],
    },
    {
      group: "Actions",
      items: [
        {
          label: "Create Property",
          icon: Plus,
          shortcut: "⌘N",
          action: () => router.push("/admin/properties/new"),
        },
        {
          label: "Find Lead",
          icon: Search,
          shortcut: "⌘F",
          action: () => {
            router.push("/admin/leads")
            // Could open search in leads page
          },
        },
      ],
    },
  ]

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Type a command or search..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {commands.map((group) => (
          <React.Fragment key={group.group}>
            <CommandGroup heading={group.group}>
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <CommandItem
                    key={item.label}
                    onSelect={() => runCommand(item.action)}
                    value={item.label}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                    {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            <CommandSeparator />
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  )
}


