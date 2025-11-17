"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Mail,
  MessageCircle,
  Send,
  Calendar,
  FileText,
  Clock,
  User,
  Phone,
  Building2,
  Plus,
  X,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { QuickReplyButtons } from "@/components/quick-reply-buttons"
import { createViewingFromLead } from "@/lib/actions/viewings"
import { toast } from "sonner"
import { useProperties } from "@/lib/hooks/use-properties"
import { useAgents } from "@/lib/hooks/use-agents"
import { scoreLead } from "@/lib/utils/lead-scoring"
import type { Lead } from "@/lib/hooks/use-leads"

interface LeadActivity {
  id: string
  activity_type: string
  description: string | null
  metadata: any
  created_at: string
  created_by: string | null
}

interface AdminLeadDrawerProps {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminLeadDrawer({ lead, open, onOpenChange }: AdminLeadDrawerProps) {
  const supabase = createClient()
  const [noteText, setNoteText] = React.useState("")
  const [isAddingNote, setIsAddingNote] = React.useState(false)
  const [isSchedulingViewing, setIsSchedulingViewing] = React.useState(false)
  const [viewingForm, setViewingForm] = React.useState({
    propertyId: "",
    agentId: "",
    scheduledDate: "",
    scheduledTime: "",
    notes: "",
  })

  const { data: properties } = useProperties({ limit: 100, enableRealtime: false })
  const { data: agents } = useAgents()

  // Fetch lead activities
  const { data: activities, refetch: refetchActivities } = useQuery({
    queryKey: ["lead-activities", lead?.id],
    queryFn: async (): Promise<LeadActivity[]> => {
      if (!lead?.id) return []

      const { data, error } = await supabase
        .from("lead_activity")
        .select("id, activity_type, description, metadata, created_at, created_by")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!lead?.id && open,
  })

  const handleAddNote = async () => {
    if (!lead?.id || !noteText.trim()) return

    setIsAddingNote(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase.from("lead_activity").insert({
        lead_id: lead.id,
        activity_type: "note",
        description: noteText,
        created_by: user?.id || null,
      })

      if (error) throw error

      toast.success("Note added")
      setNoteText("")
      refetchActivities()
    } catch (err: any) {
      toast.error(`Failed to add note: ${err.message}`)
    } finally {
      setIsAddingNote(false)
    }
  }

  const handleScheduleViewing = async () => {
    if (!lead?.id || !viewingForm.propertyId || !viewingForm.scheduledDate) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSchedulingViewing(true)
    try {
      const scheduledDateTime = `${viewingForm.scheduledDate}T${viewingForm.scheduledTime || "10:00"}:00`

      const result = await createViewingFromLead(
        lead.id,
        viewingForm.propertyId,
        new Date(scheduledDateTime).toISOString(),
        viewingForm.agentId || undefined,
        viewingForm.notes || undefined
      )

      if (result.success) {
        toast.success("Viewing scheduled successfully")
        setViewingForm({
          propertyId: "",
          agentId: "",
          scheduledDate: "",
          scheduledTime: "",
          notes: "",
        })
        setIsSchedulingViewing(false)
        refetchActivities()
      } else {
        toast.error(result.error || "Failed to schedule viewing")
      }
    } catch (err: any) {
      toast.error(`Failed to schedule viewing: ${err.message}`)
    } finally {
      setIsSchedulingViewing(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "email":
      case "email_sent":
        return <Mail className="h-4 w-4 text-blue-600" />
      case "whatsapp":
      case "whatsapp_contact":
        return <MessageCircle className="h-4 w-4 text-green-600" />
      case "telegram":
      case "telegram_contact":
        return <Send className="h-4 w-4 text-blue-500" />
      case "note":
        return <FileText className="h-4 w-4 text-gray-600" />
      case "viewing_scheduled":
        return <Calendar className="h-4 w-4 text-purple-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (!lead) return null

  const scoring = scoreLead({
    budget_fit: lead.score ? lead.score / 100 : null,
    readiness: lead.score ? lead.score / 100 : null,
    property_code: lead.property_code,
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Lead Details</SheetTitle>
          <SheetDescription>View and manage lead information</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <div className="space-y-6 pr-4">
            {/* Lead Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {(lead.name || lead.full_name)?.charAt(0)?.toUpperCase() || "L"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{lead.name || lead.full_name || "Unnamed Lead"}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={scoring.variant}>{scoring.label}</Badge>
                      <Badge variant="outline">{lead.stage || lead.status || "new"}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                {lead.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.phone}</span>
                  </div>
                )}
                {lead.property_code && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.property_code}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(lead.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <QuickReplyButtons
                  leadId={lead.id}
                  leadName={lead.name || lead.full_name || ""}
                  leadPhone={lead.phone || undefined}
                />
              </div>
            </div>

            <Separator />

            {/* Add Note */}
            <div className="space-y-2">
              <Label>Add Note</Label>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note about this lead..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={!noteText.trim() || isAddingNote}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </div>

            <Separator />

            {/* Schedule Viewing */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Schedule Viewing</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSchedulingViewing(!isSchedulingViewing)}
                >
                  {isSchedulingViewing ? <X className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                </Button>
              </div>

              {isSchedulingViewing && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label htmlFor="property">Property *</Label>
                    <Select
                      value={viewingForm.propertyId}
                      onValueChange={(value) =>
                        setViewingForm({ ...viewingForm, propertyId: value })
                      }
                    >
                      <SelectTrigger id="property">
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties?.map((prop) => (
                          <SelectItem key={prop.id} value={prop.id}>
                            {prop.code || prop.title_en || prop.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agent">Agent</Label>
                    <Select
                      value={viewingForm.agentId}
                      onValueChange={(value) =>
                        setViewingForm({ ...viewingForm, agentId: value })
                      }
                    >
                      <SelectTrigger id="agent">
                        <SelectValue placeholder="Select agent (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No agent</SelectItem>
                        {agents?.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={viewingForm.scheduledDate}
                        onChange={(e) =>
                          setViewingForm({ ...viewingForm, scheduledDate: e.target.value })
                        }
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={viewingForm.scheduledTime}
                        onChange={(e) =>
                          setViewingForm({ ...viewingForm, scheduledTime: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="viewing-notes">Notes</Label>
                    <Textarea
                      id="viewing-notes"
                      placeholder="Additional notes for the viewing..."
                      value={viewingForm.notes}
                      onChange={(e) =>
                        setViewingForm({ ...viewingForm, notes: e.target.value })
                      }
                      rows={2}
                    />
                  </div>

                  <Button
                    onClick={handleScheduleViewing}
                    disabled={isSchedulingViewing || !viewingForm.propertyId || !viewingForm.scheduledDate}
                    className="w-full"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Viewing
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Activity Timeline */}
            <div className="space-y-4">
              <h4 className="font-semibold">Activity Timeline</h4>
              {!activities || activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity recorded yet</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        {index < activities.length - 1 && (
                          <div className="w-px h-full bg-border mt-2 min-h-[40px]" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium capitalize text-sm">
                            {activity.activity_type.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.created_at), "MMM d, yyyy HH:mm")}
                          </p>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

