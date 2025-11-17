import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboardClient } from "./page-client"

// Force dynamic rendering to avoid build-time errors
export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/admin/login")
  }

  return <AdminDashboardClient />
}
