"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
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
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [agentFilter, setAgentFilter] = useState<string>("all")
  const [agents, setAgents] = useState<Array<{ id: string; name_en: string }>>([])
  const [searchTerm, setSearchTerm] = useState("")

  const supabase = createClient()

  useEffect(() => {
    fetchAgents()
  }, [])

  useEffect(() => {
    fetchViewings()
  }, [filter, statusFilter, agentFilter])

  async function fetchAgents() {
    const { data } = await supabase.from("agents").select("id, name_en").order("name_en")
    if (data) {
      setAgents(data)
    }
  }

  async function fetchViewings() {
    setLoading(true)
    let query = supabase
      .from("viewings")
      .select(`
        *,
        leads(id, full_name, email),
        properties(title_en, property_code, city_en),
        agents(id, name_en, name_gr)
      `)
      .order("scheduled_date", { ascending: true })

    const now = new Date().toISOString()

    if (filter === "upcoming") {
      query = query.gte("scheduled_date", now)
    } else if (filter === "past") {
      query = query.lt("scheduled_date", now)
    }

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }

    if (agentFilter !== "all") {
      query = query.eq("agent_id", agentFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching viewings:", error)
    } else {
      // Transform data to match expected format
      const transformed = (data || []).map((v: any) => ({
        ...v,
        scheduled_at: v.scheduled_date,
        leads: v.leads ? { id: v.leads.id, name: v.leads.full_name, email: v.leads.email } : null,
        properties: v.properties ? { 
          title: v.properties.title_en || "", 
          property_code: v.properties.property_code || "", 
          city: v.properties.city_en || "" 
        } : null,
        agents: v.agents ? { 
          name: v.agents.name_en || v.agents.name_gr 
        } : null,
      }))
      setViewings(transformed)
    }
    setLoading(false)
  }

  const filteredViewings = viewings.filter((viewing) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const propertyMatch = viewing.properties?.title?.toLowerCase().includes(searchLower) ||
        viewing.properties?.property_code?.toLowerCase().includes(searchLower) ||
        viewing.properties?.city?.toLowerCase().includes(searchLower)
      const leadMatch = viewing.leads?.name?.toLowerCase().includes(searchLower) ||
        viewing.leads?.email?.toLowerCase().includes(searchLower)
      const agentMatch = viewing.agents?.name?.toLowerCase().includes(searchLower)
      return propertyMatch || leadMatch || agentMatch
    }
    return true
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Viewings</h1>
              <p className="text-slate-600">Manage property viewing appointments</p>
            </div>
            <Button asChild>
              <Link href="/admin/viewings/new">
                <Plus className="mr-2 h-5 w-5" />
                Schedule Viewing
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Input
                placeholder="Search viewings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>

            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              filteredViewings.map((viewing) => (
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
                    <div className="flex items-center justify-end gap-2">
                      {viewing.properties && (
                        <Link href={`/properties/${viewing.properties.property_code}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      {viewing.leads && (
                        <Link href={`/admin/leads/${viewing.leads.id}`}>
                          <Button variant="ghost" size="sm">
                            <User className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      <Link href={`/admin/viewings/${viewing.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
        </div>
      </div>
    </div>
  )
}
