"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, User, Calendar } from "lucide-react"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import { AdminGlassCard } from "@/components/admin-glass-card"
import { motion } from "framer-motion"

type AuditLog = {
  id: string
  actor_id: string | null
  entity_type: string
  entity_id: string
  action: string
  diff_json: any
  created_at: string
  profiles: { name: string; email: string } | null
}

const actionColors = {
  create: "bg-green-100 text-green-800",
  update: "bg-blue-100 text-blue-800",
  delete: "bg-red-100 text-red-800",
  view: "bg-gray-100 text-gray-800",
  export: "bg-purple-100 text-purple-800",
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only create client and fetch on client side
    if (typeof window === "undefined") return

    try {
      const supabase = createClient()
      fetchAuditLogs(supabase)
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error)
      setLoading(false)
    }
  }, [])

  async function fetchAuditLogs(supabase: ReturnType<typeof createClient>) {
    const { data, error } = await supabase
      .from("audit_logs")
      .select(`
        *,
        profiles(name, email)
      `)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Error fetching audit logs:", error)
    } else {
      setLogs(data || [])
    }
    setLoading(false)
  }

  return (
    <AdminPageWrapper
      title="Audit Logs"
      description="Track all system changes and user actions"
    >
      <AdminGlassCard index={0} title="Recent Activity" headerActions={<FileText className="h-5 w-5 text-blue-600" />} className="overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-slate-600">Loading audit logs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-600">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log, index) => (
                    <TableRow key={log.id} className="border-b border-white/10 hover:bg-white/30 transition-all duration-300">
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-slate-700">{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.profiles ? (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="font-medium text-slate-900">{log.profiles.name}</div>
                              <div className="text-slate-500">{log.profiles.email}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`border border-white/30 backdrop-blur-sm ${actionColors[log.action as keyof typeof actionColors]}`}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize text-slate-700">{log.entity_type}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">{log.entity_id.slice(0, 8)}...</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-slate-500">
                        {log.diff_json?.reason || "Standard operation"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </AdminGlassCard>
    </AdminPageWrapper>
  )
}
