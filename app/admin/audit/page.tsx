"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminBackButton } from "@/components/admin-back-button"
import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, User, Calendar } from "lucide-react"

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
      const supabase = createBrowserClient()
      fetchAuditLogs(supabase)
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error)
      setLoading(false)
    }
  }, [])

  async function fetchAuditLogs(supabase: ReturnType<typeof createBrowserClient>) {
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
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">Track all system changes and user actions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading audit logs...</p>
          ) : (
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
                    <TableCell colSpan={6} className="text-center py-8">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.profiles ? (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{log.profiles.name}</div>
                              <div className="text-muted-foreground">{log.profiles.email}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={actionColors[log.action as keyof typeof actionColors]}>{log.action}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{log.entity_type}</TableCell>
                      <TableCell className="font-mono text-xs">{log.entity_id.slice(0, 8)}...</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {log.diff_json?.reason || "Standard operation"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  )
}
