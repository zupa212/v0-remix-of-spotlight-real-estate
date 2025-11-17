"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import { AdminTaskFormSheet } from "@/components/admin-task-form-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2, Circle, Clock, User, Calendar, Plus, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { toggleTaskStatus, deleteTask } from "@/lib/actions/tasks"
import { toast } from "sonner"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Task {
  id: string
  title: string
  description: string | null
  due_at: string
  status: string
  created_at: string
  completed_at: string | null
  lead_id: string | null
  assignee_id: string | null
  lead?: { name: string; email: string; id: string }
  assignee?: { name: string }
}

export function AdminTasksPageClient() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; taskId: string | null; taskTitle: string }>({
    open: false,
    taskId: null,
    taskTitle: "",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchTasks()

    // Realtime subscription
    const channel = supabase
      .channel("tasks-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        fetchTasks()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        lead_id,
        assignee_id
      `
      )
      .order("due_at", { ascending: true })

    // Fetch leads and assignees separately
    const leadIds = (data || []).map((t: any) => t.lead_id).filter((id: string | null) => id !== null) as string[]
    const assigneeIds = (data || [])
      .map((t: any) => t.assignee_id)
      .filter((id: string | null) => id !== null) as string[]

    let leadsMap: Record<string, { name: string; email: string; id: string }> = {}
    if (leadIds.length > 0) {
      const { data: leadsData } = await supabase.from("leads").select("id, name, email").in("id", leadIds)
      if (leadsData) {
        leadsData.forEach((lead: any) => {
          leadsMap[lead.id] = { name: lead.name, email: lead.email, id: lead.id }
        })
      }
    }

    let assigneesMap: Record<string, { name: string }> = {}
    if (assigneeIds.length > 0) {
      const { data: profilesData } = await supabase.from("profiles").select("id, name").in("id", assigneeIds)
      if (profilesData) {
        profilesData.forEach((profile: any) => {
          assigneesMap[profile.id] = { name: profile.name }
        })
      }
    }

    // Combine data
    const tasksWithRelations = (data || []).map((task: any) => ({
      ...task,
      lead: task.lead_id && leadsMap[task.lead_id] ? leadsMap[task.lead_id] : null,
      assignee: task.assignee_id && assigneesMap[task.assignee_id] ? assigneesMap[task.assignee_id] : null,
    }))

    if (!error && tasksWithRelations) {
      setTasks(tasksWithRelations)
    }
    setLoading(false)
  }

  async function handleToggleStatus(taskId: string, currentStatus: string) {
    const result = await toggleTaskStatus(taskId, currentStatus)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Task status updated")
      fetchTasks()
    }
  }

  async function handleDelete(taskId: string) {
    const result = await deleteTask(taskId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Task deleted")
      fetchTasks()
      setDeleteDialog({ open: false, taskId: null, taskTitle: "" })
    }
  }

  const handleNewTaskClick = () => {
    setEditingTask(undefined)
    setIsSheetOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsSheetOpen(true)
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true
    if (filter === "pending") return task.status === "pending"
    if (filter === "completed") return task.status === "completed"
    if (filter === "overdue") {
      return task.status !== "completed" && new Date(task.due_at) < new Date()
    }
    return true
  })

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    overdue: tasks.filter((t) => t.status !== "completed" && new Date(t.due_at) < new Date()).length,
  }

  if (loading) {
    return (
      <AdminPageWrapper title="Tasks" description="Manage your tasks and follow-ups">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminPageWrapper>
    )
  }

  return (
    <AdminPageWrapper
      title="Tasks"
      description="Manage your tasks and follow-ups"
      headerActions={
        <Button onClick={handleNewTaskClick}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      }
    >
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tasks</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Circle className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <Clock className="h-8 w-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            All ({stats.total})
          </Button>
          <Button variant={filter === "pending" ? "default" : "outline"} onClick={() => setFilter("pending")}>
            Pending ({stats.pending})
          </Button>
          <Button variant={filter === "completed" ? "default" : "outline"} onClick={() => setFilter("completed")}>
            Completed ({stats.completed})
          </Button>
          <Button variant={filter === "overdue" ? "default" : "outline"} onClick={() => setFilter("overdue")}>
            Overdue ({stats.overdue})
          </Button>
        </div>
      </Card>

      {/* Tasks List */}
      <Card className="p-6">
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const isOverdue = task.status !== "completed" && new Date(task.due_at) < new Date()
            const dueDate = new Date(task.due_at)

            return (
              <div
                key={task.id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  task.status === "completed" ? "bg-muted/50" : "bg-background"
                } ${isOverdue ? "border-red-200 bg-red-50/50" : ""}`}
              >
                <Checkbox
                  checked={task.status === "completed"}
                  onCheckedChange={() => handleToggleStatus(task.id, task.status)}
                  className="mt-1"
                />

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className={`font-medium ${
                          task.status === "completed" ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                    </div>
                    <Badge variant={task.status === "completed" ? "secondary" : isOverdue ? "destructive" : "default"}>
                      {task.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {task.lead && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{task.lead.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                        {format(dueDate, "MMM dd, yyyy")}
                      </span>
                    </div>
                    {task.assignee && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Assigned to: {task.assignee.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button size="sm" variant="ghost" onClick={() => handleEditTask(task)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          taskId: task.id,
                          taskTitle: task.title,
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    {task.lead && (
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/leads/${task.lead.id}`}>View Lead</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tasks found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Task Create/Edit Sheet */}
      <AdminTaskFormSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} initialData={editingTask} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{deleteDialog.taskTitle}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.taskId && handleDelete(deleteDialog.taskId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPageWrapper>
  )
}

