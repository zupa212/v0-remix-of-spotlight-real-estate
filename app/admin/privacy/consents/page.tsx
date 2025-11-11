import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs"
import { AdminBackButton } from "@/components/admin-back-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { FileText, User, Calendar } from "lucide-react"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export default async function ConsentRecordsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/admin/login")
  }

  // Fetch consent records
  const { data: consents, error } = await supabase
    .from("consents")
    .select(
      `
      *,
      lead:leads!lead_id(id, full_name, email)
    `,
    )
    .order("accepted_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("Error fetching consents:", error)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          <AdminBreadcrumbs
            items={[
              { label: "Privacy", href: "/admin/privacy" },
              { label: "Consent Records" },
            ]}
          />
          <AdminBackButton href="/admin/privacy" label="Back to Privacy" />

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Consent Records</h1>
            <p className="text-slate-600">View all GDPR consent records</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Consent Ledger
              </CardTitle>
            </CardHeader>
            <CardContent>
              {consents && consents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Lead</TableHead>
                      <TableHead>Consent Text</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consents.map((consent: any) => (
                      <TableRow key={consent.id}>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(consent.accepted_at), "PPpp")}
                          </div>
                        </TableCell>
                        <TableCell>
                          {consent.lead ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{consent.lead.full_name}</div>
                                <div className="text-sm text-muted-foreground">{consent.lead.email}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No lead</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm line-clamp-2">{consent.consent_text}</p>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs text-muted-foreground">{consent.ip_address || "N/A"}</code>
                        </TableCell>
                        <TableCell>
                          {consent.lead && (
                            <Link href={`/admin/leads/${consent.lead.id}`}>
                              <Button variant="ghost" size="sm">
                                View Lead
                              </Button>
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No consent records found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


