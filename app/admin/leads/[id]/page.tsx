"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Calendar, User, Building, ArrowLeft, MessageSquare } from "lucide-react"
import Link from "next/link"

type Lead = {
  id: string
  full_name: string
  email: string
  phone: string | null
  status: string
  lead_source: string
  budget_min: number | null
  budget_max: number | null
  message: string | null
  property_id: string | null
  agent_id: string | null
  created_at: string
  properties: { title_en: string; property_code: string; city_en: string } | null
  agents: { id: string; name_en: string; email: string; phone: string } | null
  // Aliases for compatibility
  name?: string
  source?: string
}

type Viewing = {
  id: string
  scheduled_date: string
  status: string
  notes: string | null
  property_id: string | null
  agent_id: string | null
  // Alias for compatibility
  scheduled_at?: string
}

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-purple-100 text-purple-800",
  qualified: "bg-green-100 text-green-800",
  viewing: "bg-amber-100 text-amber-800",
  offer: "bg-orange-100 text-orange-800",
  won: "bg-emerald-100 text-emerald-800",
  lost: "bg-gray-100 text-gray-800",
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [viewings, setViewings] = useState<Viewing[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchLeadDetails()
    fetchViewings()
    fetchAgents()
    fetchActivities()
  }, [params.id])

  async function fetchLeadDetails() {
    const { data, error } = await supabase
      .from("leads")
      .select(`
        id,
        full_name,
        email,
        phone,
        status,
        lead_source,
        budget_min,
        budget_max,
        message,
        property_id,
        agent_id,
        created_at,
        updated_at,
        properties!leads_property_id_fkey(title_en, property_code, city_en),
        agents!leads_agent_id_fkey(id, name_en, email, phone)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching lead:", error)
    } else if (data) {
      // Add aliases for compatibility
      setLead({
        ...data,
        name: data.full_name,
        source: data.lead_source,
      })
    }
    setLoading(false)
  }

  async function fetchViewings() {
    const { data, error } = await supabase
      .from("viewings")
      .select("id, scheduled_date, status, notes, property_id, agent_id")
      .eq("lead_id", params.id)
      .order("scheduled_date", { ascending: false })

    if (error) {
      console.error("Error fetching viewings:", error)
    } else if (data) {
      // Add alias for compatibility
      const viewingsWithAlias = data.map((v: any) => ({
        ...v,
        scheduled_at: v.scheduled_date,
      }))
      setViewings(viewingsWithAlias)
    }
  }

  async function fetchActivities() {
    // Fetch from lead_activity table if it exists, otherwise create mock activities from lead updates
    const { data: activityData } = await supabase
      .from("lead_activity")
      .select("*")
      .eq("lead_id", params.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (activityData && activityData.length > 0) {
      setActivities(
        activityData.map((a) => ({
          id: a.id,
          type: a.activity_type || "note",
          description: a.description || a.notes || "",
          created_at: a.created_at,
        }))
      )
    } else {
      // Create activity from lead creation
      if (lead) {
        setActivities([
          {
            id: "1",
            type: "created",
            description: `Lead created from ${lead.source || lead.lead_source || "website"}`,
            created_at: lead.created_at,
          },
        ])
      }
    }
  }

  async function fetchAgents() {
    const { data, error } = await supabase.from("agents").select("id, name_en").order("name_en")

    if (error) {
      console.error("Error fetching agents:", error)
    } else {
      setAgents(data || [])
    }
  }

  async function updateStatus(newStatus: string) {
    setUpdatingStatus(true)
    const oldStatus = lead?.status
    const { error } = await supabase.from("leads").update({ status: newStatus }).eq("id", params.id)

    if (error) {
      console.error("Error updating status:", error)
      alert("Failed to update status")
    } else {
      setLead((prev) => (prev ? { ...prev, status: newStatus } : null))
      // Create activity log entry
      await supabase.from("lead_activity").insert({
        lead_id: params.id,
        activity_type: "status_change",
        description: `Status changed from ${oldStatus} to ${newStatus}`,
        notes: `Status updated`,
      })
      fetchActivities()
    }
    setUpdatingStatus(false)
  }

  async function assignAgent(agentId: string) {
    const agentName = agents.find((a) => a.id === agentId)?.name_en || "Unassigned"
    const { error } = await supabase.from("leads").update({ agent_id: agentId || null }).eq("id", params.id)

    if (error) {
      console.error("Error assigning agent:", error)
      alert("Failed to assign agent")
    } else {
      fetchLeadDetails()
      // Create activity log entry
      await supabase.from("lead_activity").insert({
        lead_id: params.id,
        activity_type: "assignment",
        description: agentId ? `Assigned to ${agentName}` : "Unassigned from agent",
        notes: agentId ? `Agent assignment: ${agentName}` : "Agent unassigned",
      })
      fetchActivities()
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>
  }

  if (!lead) {
    return <div className="flex items-center justify-center min-h-[400px]">Lead not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/leads">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">{lead.name || lead.full_name || "Unnamed Lead"}</h1>
          <p className="text-muted-foreground">Lead ID: {lead.id.slice(0, 8)}</p>
        </div>
        <Badge className={statusColors[lead.status as keyof typeof statusColors]}>{lead.status}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </div>
                <p className="font-medium">{lead.email}</p>
              </div>

              {lead.phone && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </div>
                  <p className="font-medium">{lead.phone}</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Inquiry Date</span>
                </div>
                <p className="font-medium">{new Date(lead.created_at).toLocaleDateString()}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>Source</span>
                </div>
                <p className="font-medium capitalize">{lead.source || lead.lead_source || "website"}</p>
              </div>
            </div>

            {lead.properties && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Interested Property</span>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="font-medium">{lead.properties.title_en}</p>
                  <p className="text-sm text-muted-foreground">
                    {lead.properties.property_code} • {lead.properties.city_en}
                  </p>
                </div>
              </div>
            )}

            {(lead.budget_min || lead.budget_max) && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Budget Range</p>
                <p className="font-medium">
                  €{lead.budget_min?.toLocaleString()} - €{lead.budget_max?.toLocaleString()}
                </p>
              </div>
            )}

            {lead.message && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>Message</span>
                </div>
                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-sm">{lead.message}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={lead.status} onValueChange={updateStatus} disabled={updatingStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="viewing">Viewing</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned Agent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lead.agents ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{lead.agents.name || lead.agents.name_en || "Unknown Agent"}</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {lead.agents.email && <p>{lead.agents.email}</p>}
                    {lead.agents.phone && <p>{lead.agents.phone}</p>}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No agent assigned</p>
              )}

              <Select
                value={lead.agent_id || "unassigned"}
                onValueChange={(value) => assignAgent(value === "unassigned" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Viewings History</CardTitle>
        </CardHeader>
        <CardContent>
          {viewings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No viewings scheduled yet</p>
          ) : (
            <div className="space-y-4">
              {viewings.map((viewing) => (
                <div key={viewing.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <p className="font-medium">{new Date(viewing.scheduled_at || viewing.scheduled_date).toLocaleString()}</p>
                    {viewing.notes && <p className="text-sm text-muted-foreground">{viewing.notes}</p>}
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {viewing.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity recorded yet</p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                    {index < activities.length - 1 && <div className="w-px h-full bg-slate-200 mt-2"></div>}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium capitalize">{activity.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
