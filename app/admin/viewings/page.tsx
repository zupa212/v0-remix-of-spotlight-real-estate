"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, MapPin, User, Eye } from "lucide-react"
import Link from "next/link"

type Viewing = {
  id: string
  scheduled_at: string
  status: string
  notes: string | null
  leads: { id: string; name: string; email: string } | null
  properties: { title: string; property_code: string; city: string } | null
  agents: { name: string } | null
}

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  rescheduled: "bg-amber-100 text-amber-800",
}

export default function AdminViewingsPage() {
  const [viewings, setViewings] = useState<Viewing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming")

  const supabase = createBrowserClient()

  useEffect(() => {
    fetchViewings()
  }, [filter])

  async function fetchViewings() {
    setLoading(true)
    let query = supabase
      .from("viewings")
      .select(`
        *,
        leads(id, name, email),
        properties(title, property_code, city),
        agents(name)
      `)
      .order("scheduled_at", { ascending: true })

    const now = new Date().toISOString()

    if (filter === "upcoming") {
      query = query.gte("scheduled_at", now)
    } else if (filter === "past") {
      query = query.lt("scheduled_at", now)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching viewings:", error)
    } else {
      setViewings(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Viewings</h1>
          <p className="text-muted-foreground">Manage property viewing appointments</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant={filter === "upcoming" ? "default" : "outline"} onClick={() => setFilter("upcoming")}>
          Upcoming
        </Button>
        <Button variant={filter === "past" ? "default" : "outline"} onClick={() => setFilter("past")}>
          Past
        </Button>
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
          All
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading viewings...
                </TableCell>
              </TableRow>
            ) : viewings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No viewings found
                </TableCell>
              </TableRow>
            ) : (
              viewings.map((viewing) => (
                <TableRow key={viewing.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <div className="font-medium">{new Date(viewing.scheduled_at).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          {new Date(viewing.scheduled_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {viewing.properties ? (
                      <div className="text-sm">
                        <div className="font-medium">{viewing.properties.title}</div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {viewing.properties.city}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {viewing.leads ? (
                      <div className="text-sm">
                        <div className="font-medium">{viewing.leads.name}</div>
                        <div className="text-muted-foreground">{viewing.leads.email}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {viewing.agents ? (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {viewing.agents.name}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[viewing.status as keyof typeof statusColors]}>
                      {viewing.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {viewing.notes || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {viewing.leads && (
                      <Link href={`/admin/leads/${viewing.leads.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
