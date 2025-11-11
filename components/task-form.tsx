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
import { Save, X, Calendar } from "lucide-react"

interface TaskFormProps {
  initialData?: any
  isEdit?: boolean
  leadId?: string
}

export function TaskForm({ initialData, isEdit = false, leadId }: TaskFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])

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
    leadId: initialData?.lead_id || leadId || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    dueAt: initialData?.due_at ? formatDateTimeLocal(initialData.due_at) : "",
    status: initialData?.status || "pending",
    assigneeId: initialData?.assignee_id || "",
  })

  useEffect(() => {
    fetchLeads()
    fetchAgents()
  }, [])

  async function fetchLeads() {
    const supabase = createClient()
    const { data } = await supabase
      .from("leads")
      .select("id, full_name, email")
      .order("created_at", { ascending: false })
      .limit(100)

    if (data) {
      setLeads(data)
    }
  }

  async function fetchAgents() {
    const supabase = createClient()
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .order("full_name")

    if (data) {
      setAgents(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to create a task")
      }

      const taskData: any = {
        lead_id: formData.leadId || null,
        title: formData.title,
        description: formData.description || null,
        due_at: formData.dueAt ? new Date(formData.dueAt).toISOString() : null,
        status: formData.status,
        assignee_id: formData.assigneeId || null,
        updated_at: new Date().toISOString(),
      }

      if (isEdit && initialData?.id) {
        // Update existing task
        if (formData.status === "completed" && initialData.status !== "completed") {
          taskData.completed_at = new Date().toISOString()
        } else if (formData.status !== "completed") {
          taskData.completed_at = null
        }

        const { error: updateError } = await supabase.from("tasks").update(taskData).eq("id", initialData.id)

        if (updateError) throw updateError
      } else {
        // Create new task
        const { error: insertError } = await supabase.from("tasks").insert(taskData).select().single()

        if (insertError) throw insertError
      }

      router.push("/admin/tasks")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to save task")
      console.error("Error saving task:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Enter task title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  placeholder="Enter task description..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueAt">Due Date & Time</Label>
                <Input
                  id="dueAt"
                  type="datetime-local"
                  value={formData.dueAt}
                  onChange={(e) => setFormData({ ...formData, dueAt: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leadId">Related Lead</Label>
                <Select
                  value={formData.leadId}
                  onValueChange={(value) => setFormData({ ...formData, leadId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lead (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.full_name} ({lead.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigneeId">Assign To</Label>
                <Select
                  value={formData.assigneeId}
                  onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an assignee (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.full_name || agent.email}
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Saving..." : isEdit ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  )
}


