import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminBackButton } from "@/components/admin-back-button"
import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Calendar, Clock, User, Building, MessageSquare, MapPin, Phone, Mail, Edit, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"

export const dynamic = "force-dynamic"

type ViewingDetailParams = {
  params: Promise<{
    id: string
  }>
}

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-amber-100 text-amber-800",
}

export default async function ViewingDetailPage({ params }: ViewingDetailParams) {
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

  // Fetch viewing with relations
  const { data: viewing, error } = await supabase
    .from("viewings")
    .select(`
      *,
      property:properties!property_id(id, title_en, property_code, city_en, address_en),
      agent:agents!agent_id(id, name_en, email, phone)
    `)
    .eq("id", id)
    .single()

  // Fetch lead separately if lead_id exists
  let leadData: any = null
  if (viewing?.lead_id) {
    const { data: lead } = await supabase
      .from("leads")
      .select("id, name, email, phone")
      .eq("id", viewing.lead_id)
      .single()
    leadData = lead
  }

  if (error || !viewing) {
    notFound()
  }

  // Combine viewing with lead data
  const viewingWithLead = {
    ...viewing,
    leads: leadData,
    properties: viewing.property,
    agents: viewing.agent,
  }

  const scheduledDate = viewing.scheduled_date ? new Date(viewing.scheduled_date) : null
  const endDate = scheduledDate && viewing.duration_minutes
    ? new Date(scheduledDate.getTime() + viewing.duration_minutes * 60000)
    : null

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          <AdminBreadcrumbs items={[
            { label: "Viewings", href: "/admin/viewings" },
            { label: `Viewing ${id.substring(0, 8)}` }
          ]} />
          <AdminBackButton href="/admin/viewings" label="Back to Viewings" />
          
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">Viewing Details</h1>
                <Badge className={statusColors[viewing.status as keyof typeof statusColors]}>
                  {viewing.status}
                </Badge>
              </div>
              <p className="text-slate-600">View and manage viewing appointment</p>
            </div>
            <Button asChild>
              <Link href={`/admin/viewings/${viewing.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Viewing
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Viewing Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Viewing Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Scheduled Date & Time</p>
                      <p className="font-medium">
                        {scheduledDate ? format(scheduledDate, "PPpp") : "Not scheduled"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Duration</p>
                      <p className="font-medium">{viewing.duration_minutes || 60} minutes</p>
                    </div>
                    {endDate && (
                      <div>
                        <p className="text-sm text-slate-600 mb-1">End Time</p>
                        <p className="font-medium">{format(endDate, "p")}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Status</p>
                      <Badge className={statusColors[viewing.status as keyof typeof statusColors]}>
                        {viewing.status}
                      </Badge>
                    </div>
                  </div>

                  {viewing.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Notes</p>
                        <p className="text-slate-900 whitespace-pre-wrap">{viewing.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Property Information */}
              {viewingWithLead.properties && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Property
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium text-lg mb-1">{viewingWithLead.properties.title_en}</p>
                      <p className="text-sm text-slate-600 mb-2">Code: {viewingWithLead.properties.property_code}</p>
                      {viewingWithLead.properties.address_en && (
                        <div className="flex items-start gap-2 text-slate-600">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{viewingWithLead.properties.address_en}</span>
                        </div>
                      )}
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/properties/${viewingWithLead.properties.id}`}>
                        View Property
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {viewingWithLead.leads ? (
                    <>
                      <div>
                        <p className="font-medium mb-1">{viewingWithLead.leads.name || "Unknown"}</p>
                        <div className="space-y-1 text-sm text-slate-600">
                          {viewingWithLead.leads.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{viewingWithLead.leads.email}</span>
                            </div>
                          )}
                          {viewingWithLead.leads.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{viewingWithLead.leads.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/leads/${viewingWithLead.leads.id}`}>
                          View Lead
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <div>
                      <p className="font-medium mb-1">{viewing.client_name || "No client name"}</p>
                      <div className="space-y-1 text-sm text-slate-600">
                        {viewing.client_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{viewing.client_email}</span>
                          </div>
                        )}
                        {viewing.client_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{viewing.client_phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Assigned Agent */}
              {viewingWithLead.agents ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Assigned Agent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <p className="font-medium mb-1">{viewingWithLead.agents.name_en}</p>
                      <div className="space-y-1 text-sm text-slate-600">
                        {viewingWithLead.agents.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{viewingWithLead.agents.email}</span>
                          </div>
                        )}
                        {viewingWithLead.agents.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{viewingWithLead.agents.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Assigned Agent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">No agent assigned</p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {viewing.status === "scheduled" && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href={`/admin/viewings/${viewing.id}/edit?status=confirmed`}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Confirmed
                      </Link>
                    </Button>
                  )}
                  {viewing.status !== "completed" && viewing.status !== "cancelled" && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href={`/admin/viewings/${viewing.id}/edit?status=completed`}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </Link>
                    </Button>
                  )}
                  {viewing.status !== "cancelled" && (
                    <Button variant="outline" className="w-full justify-start text-red-600" asChild>
                      <Link href={`/admin/viewings/${viewing.id}/edit?status=cancelled`}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Viewing
                      </Link>
                    </Button>
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

