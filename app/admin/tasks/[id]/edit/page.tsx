import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs"
import { AdminBackButton } from "@/components/admin-back-button"
import { TaskForm } from "@/components/task-form"

// Force dynamic rendering
export const dynamic = "force-dynamic"

type TaskEditParams = {
  params: Promise<{
    id: string
  }>
}

export default async function EditTaskPage({ params }: TaskEditParams) {
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

  // Fetch task data
  const { data: task, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !task) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          <AdminBreadcrumbs
            items={[
              { label: "Tasks", href: "/admin/tasks" },
              { label: `Task ${id.substring(0, 8)}`, href: `/admin/tasks/${id}` },
              { label: "Edit" },
            ]}
          />
          <AdminBackButton href={`/admin/tasks/${id}`} label="Back to Task Details" />

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Task</h1>
            <p className="text-slate-600">Update task details</p>
          </div>

          <TaskForm initialData={task} isEdit={true} />
        </div>
      </div>
    </div>
  )
}


