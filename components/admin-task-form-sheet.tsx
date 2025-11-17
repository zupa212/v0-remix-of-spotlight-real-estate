"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTask, updateTask, type TaskInput } from "@/lib/actions/tasks"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useLeads } from "@/lib/hooks/use-leads"
import { createClient } from "@/lib/supabase/client"

interface AdminTaskFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: {
    id: string
    lead_id?: string | null
    title: string
    description?: string | null
    due_at?: string | null
    status: string
    assignee_id?: string | null
  }
  leadId?: string
}

interface Profile {
  id: string
  name: string
}

export function AdminTaskFormSheet({ open, onOpenChange, initialData, leadId }: AdminTaskFormSheetProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [profiles, setProfiles] = React.useState<Profile[]>([])

  const { data: leads } = useLeads({ limit: 100 })

  React.useEffect(() => {
    // Fetch profiles for assignees
    const fetchProfiles = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("profiles").select("id, name").order("name")
      if (data) {
        setProfiles(data)
      }
    }
    fetchProfiles()
  }, [])

  const [formData, setFormData] = React.useState({
    lead_id: initialData?.lead_id || leadId || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    due_at: initialData?.due_at ? new Date(initialData.due_at).toISOString().slice(0, 16) : "",
    status: initialData?.status || "pending",
    assignee_id: initialData?.assignee_id || "",
  })

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        lead_id: initialData.lead_id || "",
        title: initialData.title,
        description: initialData.description || "",
        due_at: initialData.due_at ? new Date(initialData.due_at).toISOString().slice(0, 16) : "",
        status: initialData.status || "pending",
        assignee_id: initialData.assignee_id || "",
      })
    } else {
      setFormData({
        lead_id: leadId || "",
        title: "",
        description: "",
        due_at: "",
        status: "pending",
        assignee_id: "",
      })
    }
    setError(null)
  }, [initialData, open, leadId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload: TaskInput = {
        lead_id: formData.lead_id || undefined,
        title: formData.title,
        description: formData.description || undefined,
        due_at: formData.due_at ? new Date(formData.due_at).toISOString() : undefined,
        status: formData.status as any,
        assignee_id: formData.assignee_id || undefined,
      }

      let result
      if (initialData?.id) {
        result = await updateTask(initialData.id, payload)
      } else {
        result = await createTask(payload)
      }

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success(`Task ${initialData?.id ? "updated" : "created"} successfully!`)
        onOpenChange(false)
        router.refresh()
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save task"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initialData ? "Edit Task" : "Create New Task"}</SheetTitle>
          <SheetDescription>
            {initialData ? "Update task details" : "Add a new task"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Lead Selection */}
          <div className="space-y-2">
            <Label htmlFor="lead_id">Lead (Optional)</Label>
            <Select value={formData.lead_id} onValueChange={(value) => handleSelectChange("lead_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {leads?.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name} ({lead.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Task title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Task description..."
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due_at">Due Date</Label>
            <Input
              id="due_at"
              type="datetime-local"
              value={formData.due_at}
              onChange={handleChange}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label htmlFor="assignee_id">Assignee (Optional)</Label>
            <Select
              value={formData.assignee_id}
              onValueChange={(value) => handleSelectChange("assignee_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : initialData ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

