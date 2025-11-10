import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AgentForm } from "@/components/agent-form"

export const dynamic = "force-dynamic"

type AgentEditParams = {
  params: Promise<{
    id: string
  }>
}

export default async function EditAgentPage({ params }: AgentEditParams) {
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

  // Fetch agent data
  const { data: agent, error } = await supabase.from("agents").select("*").eq("id", id).single()

  if (error || !agent) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Agent</h1>
            <p className="text-slate-600">Update agent details</p>
          </div>

          <AgentForm initialData={agent} isEdit={true} />
        </div>
      </div>
    </div>
  )
}

