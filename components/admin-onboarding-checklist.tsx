"use client"

import * as React from "react"
import { X, CheckCircle2, Circle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useProperties } from "@/lib/hooks/use-properties"
import { useLeads } from "@/lib/hooks/use-leads"
import { useAgents } from "@/lib/hooks/use-agents"
import { useRegions } from "@/lib/hooks/use-regions"
import Link from "next/link"

interface ChecklistItem {
  id: string
  label: string
  href: string
  completed: boolean
}

export function AdminOnboardingChecklist() {
  const [isDismissed, setIsDismissed] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("onboarding-checklist-dismissed") === "true"
    }
    return false
  })

  const { data: properties } = useProperties({ limit: 1, enableRealtime: false })
  const { data: leads } = useLeads({ limit: 1, enableRealtime: false })
  const { data: agents } = useAgents()
  const { data: regions } = useRegions()

  const checklistItems: ChecklistItem[] = [
    {
      id: "properties",
      label: "Add your first property",
      href: "/admin/properties/new",
      completed: (properties?.length || 0) > 0,
    },
    {
      id: "leads",
      label: "Capture your first lead",
      href: "/admin/leads",
      completed: (leads?.length || 0) > 0,
    },
    {
      id: "agents",
      label: "Add an agent",
      href: "/admin/agents",
      completed: (agents?.length || 0) > 0,
    },
    {
      id: "regions",
      label: "Configure regions",
      href: "/admin/regions",
      completed: (regions?.length || 0) > 0,
    },
  ]

  const completedCount = checklistItems.filter((item) => item.completed).length
  const allCompleted = completedCount === checklistItems.length

  const handleDismiss = () => {
    setIsDismissed(true)
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding-checklist-dismissed", "true")
    }
  }

  // Don't show if dismissed or all completed
  if (isDismissed || allCompleted) {
    return null
  }

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Getting Started</CardTitle>
            <CardDescription>
              Complete these steps to set up your Spotlight admin panel
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
            aria-label="Dismiss checklist"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {checklistItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent/50"
            >
              {item.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <span
                className={`flex-1 text-sm ${item.completed ? "text-muted-foreground line-through" : "text-foreground"}`}
              >
                {item.label}
              </span>
              {item.completed && (
                <Badge variant="secondary" className="text-xs">
                  Done
                </Badge>
              )}
            </Link>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            {completedCount} of {checklistItems.length} completed
          </div>
          <div className="h-2 flex-1 max-w-[200px] rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${(completedCount / checklistItems.length) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

