"use client"

import * as React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useLeads, type Lead } from "@/lib/hooks/use-leads"
import { scoreLead } from "@/lib/utils/lead-scoring"
import { format } from "date-fns"
import { GripVertical } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { AdminLeadDrawer } from "@/components/admin-lead-drawer"

const STAGES = [
  { id: "new", label: "New", color: "bg-blue-500" },
  { id: "contacted", label: "Contacted", color: "bg-yellow-500" },
  { id: "qualified", label: "Qualified", color: "bg-purple-500" },
  { id: "viewing", label: "Viewing", color: "bg-indigo-500" },
  { id: "offer", label: "Offer", color: "bg-orange-500" },
  { id: "won", label: "Won", color: "bg-green-500" },
  { id: "lost", label: "Lost", color: "bg-red-500" },
]

interface LeadCardProps {
  lead: Lead
  onOpenDrawer: (lead: Lead) => void
}

function LeadCard({ lead, onOpenDrawer }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const scoring = scoreLead({
    budget_fit: lead.score ? lead.score / 100 : null,
    readiness: lead.score ? lead.score / 100 : null,
    property_code: lead.property_code,
  })

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="mb-2 cursor-move hover:shadow-md transition-shadow"
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => onOpenDrawer(lead)}
          >
            <div className="font-medium text-sm mb-1">{lead.name || "Unnamed Lead"}</div>
            {lead.email && (
              <div className="text-xs text-muted-foreground mb-1">{lead.email}</div>
            )}
            {lead.phone && (
              <div className="text-xs text-muted-foreground mb-2">{lead.phone}</div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={scoring.variant} className="text-xs">
                {scoring.label} ({scoring.score})
              </Badge>
              {lead.property_code && (
                <Badge variant="outline" className="text-xs">
                  {lead.property_code}
                </Badge>
              )}
            </div>
            {lead.last_activity && (
              <div className="text-xs text-muted-foreground mt-2">
                {format(new Date(lead.last_activity), "MMM d")}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StageColumnProps {
  stage: typeof STAGES[number]
  leads: Lead[]
  onOpenDrawer: (lead: Lead) => void
}

function StageColumn({ stage, leads, onOpenDrawer }: StageColumnProps) {
  const sortableIds = leads.map((lead) => lead.id)

  return (
    <div className="flex-1 min-w-[280px]">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${stage.color}`} />
            <CardTitle className="text-sm font-medium">{stage.label}</CardTitle>
            <Badge variant="secondary" className="ml-auto">
              {leads.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onOpenDrawer={onOpenDrawer} />
            ))}
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  )
}

export function AdminLeadsPipeline() {
  const { data: allLeads, isLoading, isError, error, refetch } = useLeads()
  const queryClient = useQueryClient()
  const supabase = createClient()
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Group leads by stage
  const leadsByStage = React.useMemo(() => {
    if (!allLeads) return {}
    const grouped: Record<string, Lead[]> = {}
    STAGES.forEach((stage) => {
      grouped[stage.id] = []
    })
    allLeads.forEach((lead) => {
      const stage = lead.stage || "new"
      if (!grouped[stage]) grouped[stage] = []
      grouped[stage].push(lead)
    })
    return grouped
  }, [allLeads])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const leadId = active.id as string
    const newStage = over.id as string

    // Find the lead
    const lead = allLeads?.find((l) => l.id === leadId)
    if (!lead) return

    // Optimistic update
    queryClient.setQueryData(["leads"], (old: Lead[] | undefined) => {
      if (!old) return old
      return old.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
    })

    try {
      // Update in database
      const { error: updateError } = await supabase
        .from("leads")
        .update({ stage: newStage })
        .eq("id", leadId)

      if (updateError) throw updateError

      // Create activity log
      await supabase.from("lead_activity").insert({
        lead_id: leadId,
        activity_type: "stage_change",
        description: `Moved from ${lead.stage} to ${newStage}`,
      })

      toast.success("Lead stage updated")
      refetch()
    } catch (err) {
      toast.error("Failed to update lead stage")
      // Revert optimistic update
      refetch()
    }
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <div key={stage.id} className="flex-1 min-w-[280px]">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-2" />
                <Skeleton className="h-20 w-full mb-2" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-sm text-muted-foreground">
        Failed to load leads. {error?.message}
      </div>
    )
  }

  const handleOpenDrawer = (lead: Lead) => {
    setSelectedLead(lead)
    setDrawerOpen(true)
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              leads={leadsByStage[stage.id] || []}
              onOpenDrawer={handleOpenDrawer}
            />
          ))}
        </div>
      </DndContext>
      <AdminLeadDrawer
        lead={selectedLead}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  )
}


