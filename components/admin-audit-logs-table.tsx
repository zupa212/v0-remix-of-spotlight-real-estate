"use client"

import * as React from "react"
import { format } from "date-fns"
import { Eye } from "lucide-react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuditLogs, type AuditLog } from "@/lib/hooks/use-audit-logs"
import { AdminEmptyState } from "@/components/admin-empty-state"
import { FileText } from "lucide-react"

function DiffViewer({ changes }: { changes: Record<string, any> | null }) {
  if (!changes) {
    return <p className="text-sm text-muted-foreground">No changes recorded</p>
  }

  return (
    <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-96">
      {JSON.stringify(changes, null, 2)}
    </pre>
  )
}

export function AdminAuditLogsTable() {
  const { data: logs, isLoading, isError, error, refetch } = useAuditLogs({ limit: 100 })
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-sm text-muted-foreground">
        Failed to load audit logs. {error?.message}
      </div>
    )
  }

  if (!logs || logs.length === 0) {
    return (
      <AdminEmptyState
        icon={FileText}
        title="No audit logs"
        description="Audit logs will appear here as actions are performed in the system."
      />
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entity</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{log.entity_type}</div>
                  <div className="text-xs text-muted-foreground">{log.entity_id}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{log.action}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {log.actor_name || "System"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(log.created_at), "MMM d, yyyy 'at' h:mm a")}
              </TableCell>
              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Diff
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Audit Log Details</DialogTitle>
                      <DialogDescription>
                        Changes made to {log.entity_type} on{" "}
                        {format(new Date(log.created_at), "PPpp")}
                      </DialogDescription>
                    </DialogHeader>
                    <DiffViewer changes={log.changes} />
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}


