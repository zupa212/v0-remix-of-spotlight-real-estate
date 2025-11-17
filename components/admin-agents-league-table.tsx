"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { AdminEmptyState } from "@/components/admin-empty-state"
import { Users } from "lucide-react"
import { format } from "date-fns"

interface AgentPerformance {
  id: string
  name_en: string
  deals_won: number
  viewings_scheduled: number
  response_time_hours: number | null
  nps_score: number | null
}

export function AdminAgentsLeagueTable() {
  const supabase = createClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["agents-performance"],
    queryFn: async (): Promise<AgentPerformance[]> => {
      // Get all agents
      const { data: agents } = await supabase.from("agents").select("id, name_en")

      if (!agents) return []

      // Get performance metrics for each agent
      const performance = await Promise.all(
        agents.map(async (agent) => {
          // Deals won (leads with stage 'won' assigned to this agent)
          const { count: dealsWon } = await supabase
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("agent_id", agent.id)
            .eq("stage", "won")

          // Viewings scheduled
          const { count: viewingsScheduled } = await supabase
            .from("viewings")
            .select("id", { count: "exact", head: true })
            .eq("agent_id", agent.id)

          // Response time (average time from lead creation to first activity)
          const { data: leads } = await supabase
            .from("leads")
            .select("id, created_at")
            .eq("agent_id", agent.id)
            .limit(10)

          let avgResponseTime: number | null = null
          if (leads && leads.length > 0) {
            const responseTimes = await Promise.all(
              leads.map(async (lead) => {
                const { data: firstActivity } = await supabase
                  .from("lead_activity")
                  .select("created_at")
                  .eq("lead_id", lead.id)
                  .order("created_at", { ascending: true })
                  .limit(1)
                  .single()

                if (firstActivity) {
                  const leadTime = new Date(lead.created_at).getTime()
                  const activityTime = new Date(firstActivity.created_at).getTime()
                  return (activityTime - leadTime) / (1000 * 60 * 60) // hours
                }
                return null
              })
            )

            const validTimes = responseTimes.filter((t) => t !== null) as number[]
            if (validTimes.length > 0) {
              avgResponseTime = validTimes.reduce((a, b) => a + b, 0) / validTimes.length
            }
          }

          return {
            id: agent.id,
            name_en: agent.name_en,
            deals_won: dealsWon || 0,
            viewings_scheduled: viewingsScheduled || 0,
            response_time_hours: avgResponseTime,
            nps_score: null, // NPS would require survey data
          }
        })
      )

      // Sort by deals won (descending)
      return performance.sort((a, b) => b.deals_won - a.deals_won)
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load data: {error?.message}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminEmptyState
            icon={Users}
            title="No agent data"
            description="Agent performance metrics will appear here once agents start working with leads."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Performance League Table</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Deals Won</TableHead>
              <TableHead>Viewings Scheduled</TableHead>
              <TableHead>Avg Response Time</TableHead>
              <TableHead>NPS Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((agent, index) => (
              <TableRow key={agent.id}>
                <TableCell>
                  <Badge variant={index < 3 ? "default" : "secondary"}>#{index + 1}</Badge>
                </TableCell>
                <TableCell className="font-medium">{agent.name_en}</TableCell>
                <TableCell>
                  <Badge variant="default">{agent.deals_won}</Badge>
                </TableCell>
                <TableCell>{agent.viewings_scheduled}</TableCell>
                <TableCell>
                  {agent.response_time_hours
                    ? `${agent.response_time_hours.toFixed(1)}h`
                    : "—"}
                </TableCell>
                <TableCell>
                  {agent.nps_score !== null ? (
                    <Badge variant={agent.nps_score >= 50 ? "default" : "secondary"}>
                      {agent.nps_score}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}


