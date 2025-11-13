import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs"
import { AdminBackButton } from "@/components/admin-back-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import Link from "next/link"
import { Edit, CheckCircle2, Clock, User, Calendar, Circle } from "lucide-react"

// Force dynamic rendering
export const dynamic = "force-dynamic"

type TaskDetailParams = {
  params: Promise<{
    id: string
  }>
}

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Circle },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800", icon: Clock },
  completed: { label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-800", icon: Circle },
}

export default async function TaskDetailPage({ params }: TaskDetailParams) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/admin/login")
  }

  // Validate UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    notFound()
  }

  // Fetch task with relations
  const { data: task, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !task) {
    notFound()
  }

  // Fetch lead separately
  let leadData: any = null
  if (task.lead_id) {
    const { data: lead } = await supabase
      .from("leads")
      .select("id, name, email, phone")
      .eq("id", task.lead_id)
      .single()
    leadData = lead
  }

  // Fetch assignee separately
  let assigneeData: any = null
  if (task.assignee_id) {
    const { data: assignee } = await supabase
      .from("profiles")
      .select("id, name, email")
      .eq("id", task.assignee_id)
      .single()
    assigneeData = assignee
  }

  const taskWithRelations = {
    ...task,
    lead: leadData,
    assignee: assigneeData,
  }

  const statusConfig = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]
  const StatusIcon = statusConfig?.icon || Circle
  const isOverdue = task.status !== "completed" && task.due_at && new Date(task.due_at) < new Date()

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          <AdminBreadcrumbs
            items={[
              { label: "Tasks", href: "/admin/tasks" },
              { label: `Task ${id.substring(0, 8)}` },
            ]}
          />
          <AdminBackButton href="/admin/tasks" label="Back to Tasks" />

          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{task.title}</h1>
                <Badge className={statusConfig?.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig?.label}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive">Overdue</Badge>
                )}
              </div>
              <p className="text-slate-600">View and manage task details</p>
            </div>
            <Button asChild>
              <Link href={`/admin/tasks/${task.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Task
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Task Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {task.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Description</p>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{task.description}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="font-medium">
                        {task.due_at ? (
                          <>
                            {format(new Date(task.due_at), "PPpp")}
                            {isOverdue && (
                              <span className="ml-2 text-red-600 text-sm">(Overdue)</span>
                            )}
                          </>
                        ) : (
                          "No due date"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {format(new Date(task.created_at), "PPpp")}
                      </p>
                    </div>
                    {task.completed_at && (
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="font-medium">
                          {format(new Date(task.completed_at), "PPpp")}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {taskWithRelations.lead && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Related Lead
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{taskWithRelations.lead.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{taskWithRelations.lead.email}</p>
                    </div>
                    {taskWithRelations.lead.phone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{taskWithRelations.lead.phone}</p>
                      </div>
                    )}
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/admin/leads/${taskWithRelations.lead.id}`}>View Lead Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {taskWithRelations.assignee && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Assigned To
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{taskWithRelations.assignee.name || taskWithRelations.assignee.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{taskWithRelations.assignee.email}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge className={statusConfig?.color}>{statusConfig?.label}</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>{format(new Date(task.created_at), "PPpp")}</p>
                  </div>
                  {task.updated_at && (
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p>{format(new Date(task.updated_at), "PPpp")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


