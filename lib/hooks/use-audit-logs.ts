"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface AuditLog {
  id: string
  entity_type: string
  entity_id: string
  action: string
  actor_id: string | null
  actor_name: string | null
  changes: Record<string, any> | null
  created_at: string
}

interface UseAuditLogsOptions {
  entity?: string
  action?: string
  limit?: number
}

export function useAuditLogs(options: UseAuditLogsOptions = {}) {
  const supabase = createClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["audit-logs", options],
    queryFn: async (): Promise<AuditLog[]> => {
      let query = supabase
        .from("audit_logs")
        .select("id, entity_type, entity_id, action, actor_id, changes, created_at")
        .order("created_at", { ascending: false })

      if (options.entity) {
        query = query.eq("entity_type", options.entity)
      }
      if (options.action) {
        query = query.eq("action", options.action)
      }
      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data: logs, error: logsError } = await query

      if (logsError) throw logsError

      // Fetch actor names
      const actorIds = logs
        ?.map((log) => log.actor_id)
        .filter((id): id is string => id !== null) || []

      let actorMap: Record<string, string> = {}
      if (actorIds.length > 0) {
        const { data: users } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", actorIds)

        if (users) {
          users.forEach((user) => {
            actorMap[user.id] = user.full_name || "Unknown"
          })
        }
      }

      return (logs || []).map((log) => ({
        ...log,
        actor_name: log.actor_id ? actorMap[log.actor_id] || null : null,
      }))
    },
  })

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  }
}


