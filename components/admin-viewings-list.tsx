"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar, CheckCircle2, Clock, X, Video, MapPin, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useViewings, type Viewing } from "@/lib/hooks/use-viewings"
import { AdminEmptyState } from "@/components/admin-empty-state"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface AdminViewingsListProps {
  filters?: {
    agent?: string
    property?: string
    dateFrom?: string
    dateTo?: string
  }
  showUpcoming?: boolean
}

export function AdminViewingsList({ filters = {}, showUpcoming = true }: AdminViewingsListProps) {
  const [viewMode, setViewMode] = React.useState<"upcoming" | "past">("upcoming")
  const { data: viewings, isLoading, isError, error, refetch } = useViewings({
    ...filters,
    upcoming: viewMode === "upcoming",
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-sm text-muted-foreground">
        Failed to load viewings. {error?.message}
      </div>
    )
  }

  if (!viewings || viewings.length === 0) {
    return (
      <AdminEmptyState
        icon={Calendar}
        title={`No ${viewMode === "upcoming" ? "upcoming" : "past"} viewings`}
        description={
          viewMode === "upcoming"
            ? "You don't have any viewings scheduled."
            : "No past viewings found."
        }
        actionLabel={viewMode === "upcoming" ? "Schedule Viewing" : undefined}
        onAction={
          viewMode === "upcoming"
            ? () => {
                window.location.href = "/admin/viewings/new"
              }
            : undefined
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as any)}>
          <ToggleGroupItem value="upcoming" aria-label="Upcoming">
            Upcoming
          </ToggleGroupItem>
          <ToggleGroupItem value="past" aria-label="Past">
            Past
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-3">
        {viewings.map((viewing) => (
          <Card key={viewing.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {viewing.scheduled_at
                        ? format(new Date(viewing.scheduled_at), "MMM d, yyyy 'at' h:mm a")
                        : "TBD"}
                    </span>
                    <Badge variant={viewing.status === "confirmed" ? "default" : "secondary"}>
                      {viewing.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {viewing.property_code && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Property: </span>
                        <span className="font-medium">{viewing.property_code}</span>
                      </div>
                    )}
                    {viewing.lead_name && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Lead: </span>
                        <span className="font-medium">{viewing.lead_name}</span>
                      </div>
                    )}
                    {viewing.agent_name && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Agent: </span>
                        <span className="font-medium">{viewing.agent_name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {viewing.type === "virtual" ? (
                      <>
                        <Badge variant="outline" className="gap-1">
                          <Video className="h-3 w-3" />
                          Virtual
                        </Badge>
                        {viewing.meeting_link && (
                          <a
                            href={viewing.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Join Meeting
                          </a>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        Onsite
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {viewMode === "upcoming" && (
                    <>
                      <Button size="sm" variant="outline">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Clock className="h-4 w-4 mr-1" />
                        Reschedule
                      </Button>
                      <Button size="sm" variant="ghost">
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4 mr-1" />
                    iCal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


