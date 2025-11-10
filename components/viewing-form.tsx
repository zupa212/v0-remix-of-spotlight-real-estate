"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Save, X, Calendar, Clock, User, Building, MessageSquare } from "lucide-react"

interface ViewingFormProps {
  initialData?: any
  isEdit?: boolean
  propertyId?: string
  leadId?: string
}

export function ViewingForm({ initialData, isEdit = false, propertyId, leadId }: ViewingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [properties, setProperties] = useState<Array<{ id: string; title_en: string; property_code: string }>>([])
  const [leads, setLeads] = useState<Array<{ id: string; full_name: string; email: string }>>([])
  const [agents, setAgents] = useState<Array<{ id: string; name_en: string }>>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [propertiesRes, leadsRes, agentsRes] = await Promise.all([
        supabase.from("properties").select("id, title_en, property_code").eq("published", true).order("title_en"),
        supabase.from("leads").select("id, full_name, email").order("created_at", { ascending: false }).limit(100),
        supabase.from("agents").select("id, name_en").order("name_en"),
      ])

      if (propertiesRes.data) setProperties(propertiesRes.data)
      if (leadsRes.data) setLeads(leadsRes.data)
      if (agentsRes.data) setAgents(agentsRes.data)
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  // Format date for input[type="datetime-local"]
  const formatDateTimeLocal = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const [formData, setFormData] = useState({
    propertyId: initialData?.property_id || propertyId || "",
    leadId: initialData?.lead_id || leadId || "",
    agentId: initialData?.agent_id || "",
    scheduledDate: initialData?.scheduled_date ? formatDateTimeLocal(initialData.scheduled_date) : "",
    durationMinutes: initialData?.duration_minutes || 60,
    status: initialData?.status || "scheduled",
    clientName: initialData?.client_name || "",
    clientEmail: initialData?.client_email || "",
    clientPhone: initialData?.client_phone || "",
    notes: initialData?.notes || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validation
    if (!formData.propertyId) {
      setError("Property is required")
      setIsSubmitting(false)
      return
    }

    if (!formData.scheduledDate) {
      setError("Scheduled date and time is required")
      setIsSubmitting(false)
      return
    }

    // If no lead selected, client info is required
    if (!formData.leadId && !formData.clientName) {
      setError("Either select a lead or provide client name")
      setIsSubmitting(false)
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      // Convert datetime-local to ISO string
      const scheduledDate = new Date(formData.scheduledDate).toISOString()

      const viewingData = {
        property_id: formData.propertyId,
        lead_id: formData.leadId || null,
        agent_id: formData.agentId || null,
        scheduled_date: scheduledDate,
        duration_minutes: Number.parseInt(formData.durationMinutes.toString()),
        status: formData.status,
        client_name: formData.leadId ? null : formData.clientName || null,
        client_email: formData.leadId ? null : formData.clientEmail || null,
        client_phone: formData.leadId ? null : formData.clientPhone || null,
        notes: formData.notes || null,
        created_by: user.id,
      }

      if (isEdit && initialData?.id) {
        const { error: updateError } = await supabase
          .from("viewings")
          .update(viewingData)
          .eq("id", initialData.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from("viewings").insert(viewingData)

        if (insertError) throw insertError
      }

      router.push("/admin/viewings")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save viewing")
      console.error("Error saving viewing:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">Loading form data...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Property Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Property
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="propertyId">Property *</Label>
            <Select
              value={formData.propertyId}
              onValueChange={(value) => setFormData({ ...formData, propertyId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title_en} ({property.property_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lead Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Lead (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leadId">Select Lead</Label>
            <Select
              value={formData.leadId}
              onValueChange={(value) => {
                const selectedLead = leads.find((l) => l.id === value)
                setFormData({
                  ...formData,
                  leadId: value,
                  clientName: selectedLead?.full_name || "",
                  clientEmail: selectedLead?.email || "",
                })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a lead (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None - Enter client info manually</SelectItem>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.full_name} ({lead.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Client Info (if no lead selected) */}
      {!formData.leadId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="John Doe"
                required={!formData.leadId}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Client Phone</Label>
              <Input
                id="clientPhone"
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                placeholder="+30 123 456 7890"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Viewing Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Viewing Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Date & Time *</Label>
            <Input
              id="scheduledDate"
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="durationMinutes">Duration (minutes)</Label>
            <Input
              id="durationMinutes"
              type="number"
              min="15"
              max="480"
              step="15"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: Number.parseInt(e.target.value) || 60 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agentId">Assigned Agent</Label>
            <Select
              value={formData.agentId}
              onValueChange={(value) => setFormData({ ...formData, agentId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an agent (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about the viewing..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting} className="bg-sky-600 hover:bg-sky-700">
          {isSubmitting ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? "Update Viewing" : "Schedule Viewing"}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/viewings")}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  )
}

