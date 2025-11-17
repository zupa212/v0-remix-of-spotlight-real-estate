"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar, CheckCircle2, Clock, X, Video, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useUpcomingViewings, type UpcomingViewing } from "@/lib/hooks/use-upcoming-viewings"
import { AdminEmptyState } from "@/components/admin-empty-state"

export function AdminUpcomingViewingsList() {
  const { data: viewings, isLoading, isError, error, refetch } = useUpcomingViewings(7)

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
        Failed to load upcoming viewings. {error?.message}
      </div>
    )
  }

  if (!viewings || viewings.length === 0) {
    return (
      <AdminEmptyState
        icon={Calendar}
        title="No upcoming viewings"
        description="You don't have any viewings scheduled for the next 7 days."
        actionLabel="Schedule Viewing"
        onAction={() => {
          window.location.href = "/admin/viewings/new"
        }}
      />
    )
  }

  return (
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
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


