import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminPropertiesPageClient } from "./page-client"

// Force dynamic rendering to avoid build-time errors
export const dynamic = "force-dynamic"

export default async function AdminPropertiesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/admin/login")
  }

  return <AdminPropertiesPageClient />
}
