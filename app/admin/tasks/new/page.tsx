import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs"
import { AdminBackButton } from "@/components/admin-back-button"
import { TaskForm } from "@/components/task-form"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export default async function NewTaskPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/admin/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          <AdminBreadcrumbs items={[{ label: "Tasks", href: "/admin/tasks" }, { label: "New Task" }]} />
          <AdminBackButton href="/admin/tasks" label="Back to Tasks" />
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Task</h1>
            <p className="text-slate-600">Add a new task or follow-up</p>
          </div>

          <TaskForm />
        </div>
      </div>
    </div>
  )
}


