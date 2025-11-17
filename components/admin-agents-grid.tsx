"use client"

import * as React from "react"
import Link from "next/link"
import { Mail, Phone, Star, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAgents, type Agent } from "@/lib/hooks/use-agents"
import { AdminEmptyState } from "@/components/admin-empty-state"
import { Users } from "lucide-react"

interface AdminAgentsGridProps {
  onEditAgent?: (agent: Agent) => void
}

export function AdminAgentsGrid({ onEditAgent }: AdminAgentsGridProps) {
  const { data: agents, isLoading, isError, error, refetch } = useAgents()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-20 w-20 rounded-full mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto mt-2" />
            </CardHeader>
            <CardContent>
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
        Failed to load agents. {error?.message}
      </div>
    )
  }

  if (!agents || agents.length === 0) {
    return (
      <AdminEmptyState
        icon={Users}
        title="No agents yet"
        description="Get started by adding your first agent."
        actionLabel="Add Agent"
        onAction={() => {
          window.location.href = "/admin/agents/new"
        }}
      />
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <Card key={agent.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={agent.avatar_url || undefined} alt={agent.name_en} />
                <AvatarFallback className="text-lg">
                  {agent.name_en.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className="font-semibold text-lg">{agent.name_en}</h3>
            {agent.name_gr && (
              <p className="text-sm text-muted-foreground">{agent.name_gr}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {agent.specialties && agent.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center">
                {agent.specialties.map((specialty, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            )}
            {agent.languages && agent.languages.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center">
                {agent.languages.map((lang, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span>{agent.listings_count || 0} listings</span>
              </div>
            </div>
            <div className="space-y-1 pt-2 border-t">
              {agent.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${agent.email}`}
                    className="text-primary hover:underline"
                  >
                    {agent.email}
                  </a>
                </div>
              )}
              {agent.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${agent.phone}`}
                    className="text-primary hover:underline"
                  >
                    {agent.phone}
                  </a>
                </div>
              )}
            </div>
            <div className="pt-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEditAgent?.(agent)}
              >
                Edit
              </Button>
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/admin/agents/${agent.id}`}>View</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


