"use client"

import * as React from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Eye, UserPlus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { MoreHorizontal } from "lucide-react"
import { useRecentLeads, type RecentLead } from "@/lib/hooks/use-recent-leads"
import { AdminEmptyState } from "@/components/admin-empty-state"
import { MessageSquare } from "lucide-react"

function getScoreBadgeVariant(score: number | null): "default" | "secondary" | "destructive" {
  if (!score) return "secondary"
  if (score >= 75) return "destructive" // Hot
  if (score >= 50) return "default" // Warm
  return "secondary" // Cold
}

function getScoreLabel(score: number | null): string {
  if (!score) return "N/A"
  if (score >= 75) return "Hot"
  if (score >= 50) return "Warm"
  return "Cold"
}

export function AdminRecentLeadsTable() {
  const { data: leads, isLoading, isError, error, refetch } = useRecentLeads(8)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-sm text-muted-foreground">
        Failed to load recent leads. {error?.message}
      </div>
    )
  }

  if (!leads || leads.length === 0) {
    return (
      <AdminEmptyState
        icon={MessageSquare}
        title="No leads yet"
        description="No leads have been captured yet. Start by creating your first lead."
        actionLabel="Create Lead"
        onAction={() => {
          // Navigate to create lead
          window.location.href = "/admin/leads/new"
        }}
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-[70px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <ContextMenu key={lead.id}>
            <ContextMenuTrigger asChild>
              <TableRow>
            <TableCell className="font-medium">{lead.name || lead.full_name || "Unnamed"}</TableCell>
            <TableCell>
              <Badge variant="secondary">{lead.stage || lead.status || "new"}</Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {lead.source || lead.lead_source || "—"}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {lead.created_at
                ? format(new Date(lead.created_at), "MMM d, yyyy")
                : "—"}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Open lead menu">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/leads/${lead.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Agent
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem asChild>
                <Link href={`/admin/leads/${lead.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </ContextMenuItem>
              <ContextMenuItem>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Agent
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </TableBody>
    </Table>
  )
}

