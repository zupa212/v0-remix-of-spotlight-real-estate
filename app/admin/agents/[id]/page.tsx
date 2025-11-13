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
import Image from "next/image"
import { Edit, User, Mail, Phone, Globe, Calendar, Building2, MessageSquare, Eye } from "lucide-react"

// Force dynamic rendering
export const dynamic = "force-dynamic"

type AgentDetailParams = {
  params: Promise<{
    id: string
  }>
}

export default async function AgentDetailPage({ params }: AgentDetailParams) {
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

  // Fetch agent
  const { data: agent, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !agent) {
    notFound()
  }

  // Fetch agent statistics
  const [propertiesCount, leadsCount, viewingsCount] = await Promise.all([
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", id),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", id),
    supabase
      .from("viewings")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", id),
  ])

  // Fetch recent properties
  const { data: recentProperties } = await supabase
    .from("properties")
    .select("id, title_en, property_code, city_en, price_sale, main_image_url")
    .eq("agent_id", id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch recent leads
  const { data: recentLeads } = await supabase
    .from("leads")
    .select("id, name, email, status, created_at")
    .eq("agent_id", id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          <AdminBreadcrumbs
            items={[
              { label: "Agents", href: "/admin/agents" },
              { label: agent.name_en || "Agent", href: `/agents/${agent.id}` },
            ]}
          />
          <AdminBackButton href="/admin/agents" label="Back to Agents" />

          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {agent.avatar_url && (
                <Image
                  src={agent.avatar_url}
                  alt={agent.name_en}
                  width={96}
                  height={96}
                  className="rounded-full"
                />
              )}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-slate-900">{agent.name_en}</h1>
                  {agent.featured && <Badge variant="default">Featured</Badge>}
                </div>
                {agent.name_gr && <p className="text-slate-600">{agent.name_gr}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/agents/${agent.id}`} target="_blank">
                  <Eye className="h-4 w-4 mr-2" />
                  View Public
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/admin/agents/${agent.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Agent
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio */}
              {(agent.bio_en || agent.bio_gr) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Biography</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {agent.bio_en && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">English</p>
                        <p className="text-sm whitespace-pre-wrap">{agent.bio_en}</p>
                      </div>
                    )}
                    {agent.bio_gr && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Greek</p>
                        <p className="text-sm whitespace-pre-wrap">{agent.bio_gr}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agent.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{agent.email}</p>
                        </div>
                      </div>
                    )}
                    {agent.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{agent.phone}</p>
                        </div>
                      </div>
                    )}
                    {agent.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Website</p>
                          <a
                            href={agent.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {agent.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Languages & Specialties */}
              {(agent.languages || agent.specialties) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Languages & Specialties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {agent.languages && agent.languages.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Languages</p>
                        <div className="flex flex-wrap gap-2">
                          {agent.languages.map((lang: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {agent.specialties && agent.specialties.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Specialties</p>
                        <div className="flex flex-wrap gap-2">
                          {agent.specialties.map((specialty: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Recent Properties */}
              {recentProperties && recentProperties.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Recent Properties ({propertiesCount.count || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentProperties.map((property: any) => (
                        <Link
                          key={property.id}
                          href={`/admin/properties/${property.id}`}
                          className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          {property.main_image_url && (
                            <Image
                              src={property.main_image_url}
                              alt={property.title_en}
                              width={64}
                              height={64}
                              className="rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{property.title_en}</p>
                            <p className="text-sm text-muted-foreground">
                              {property.property_code} • {property.city_en}
                            </p>
                          </div>
                          {property.price_sale && (
                            <p className="font-semibold">
                              €{Number(property.price_sale).toLocaleString()}
                            </p>
                          )}
                        </Link>
                      ))}
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/admin/properties?agent=${agent.id}`}>
                          View All Properties
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Leads */}
              {recentLeads && recentLeads.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Recent Leads ({leadsCount.count || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentLeads.map((lead: any) => (
                        <Link
                          key={lead.id}
                          href={`/admin/leads/${lead.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-sm text-muted-foreground">{lead.email}</p>
                          </div>
                          <Badge variant="outline">{lead.status}</Badge>
                        </Link>
                      ))}
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/admin/leads?agent=${agent.id}`}>
                          View All Leads
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Properties</span>
                    <span className="font-medium">{propertiesCount.count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Leads</span>
                    <span className="font-medium">{leadsCount.count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Viewings</span>
                    <span className="font-medium">{viewingsCount.count || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>{format(new Date(agent.created_at), "PPpp")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p>{format(new Date(agent.updated_at), "PPpp")}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


