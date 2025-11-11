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
import { Bell, Mail, MessageSquare, Send, TrendingUp, Edit } from "lucide-react"

// Force dynamic rendering
export const dynamic = "force-dynamic"

type SavedSearchDetailParams = {
  params: Promise<{
    id: string
  }>
}

export default async function SavedSearchDetailPage({ params }: SavedSearchDetailParams) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/admin/login")
  }

  // Fetch saved search
  const { data: search, error } = await supabase
    .from("saved_searches")
    .select(
      `
      *,
      user:profiles!user_id(id, full_name, email)
    `,
    )
    .eq("id", id)
    .single()

  if (error || !search) {
    notFound()
  }

  // Fetch alert stats
  const { data: alerts } = await supabase
    .from("alerts_log")
    .select("*")
    .eq("saved_search_id", id)
    .order("sent_at", { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          <AdminBreadcrumbs
            items={[
              { label: "Saved Searches", href: "/admin/saved-searches" },
              { label: search.name || "Search" },
            ]}
          />
          <AdminBackButton href="/admin/saved-searches" label="Back to Saved Searches" />

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{search.name}</h1>
              <p className="text-slate-600">View saved search details and matches</p>
            </div>
            <Button asChild>
              <Link href={`/admin/saved-searches/${search.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Search
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Search Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {search.filters_json && Object.keys(search.filters_json).length > 0 ? (
                      <div className="space-y-3">
                        {search.filters_json.property_type && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Property Type</p>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(search.filters_json.property_type)
                                ? search.filters_json.property_type.map((type: string, idx: number) => (
                                    <Badge key={idx} variant="outline">
                                      {type}
                                    </Badge>
                                  ))
                                : (
                                  <Badge variant="outline">{search.filters_json.property_type}</Badge>
                                )}
                            </div>
                          </div>
                        )}
                        {search.filters_json.listing_type && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Listing Type</p>
                            <Badge variant="outline">{search.filters_json.listing_type}</Badge>
                          </div>
                        )}
                        {search.filters_json.price_min && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Min Price</p>
                            <p className="font-medium">€{search.filters_json.price_min.toLocaleString()}</p>
                          </div>
                        )}
                        {search.filters_json.price_max && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Max Price</p>
                            <p className="font-medium">€{search.filters_json.price_max.toLocaleString()}</p>
                          </div>
                        )}
                        {search.filters_json.bedrooms_min && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Min Bedrooms</p>
                            <p className="font-medium">{search.filters_json.bedrooms_min}+</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No filters specified</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Alert History */}
              {alerts && alerts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Alert History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {alerts.map((alert: any) => (
                        <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <Badge variant={alert.status === "sent" ? "default" : "destructive"}>
                              {alert.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {alert.sent_at ? format(new Date(alert.sent_at), "PPpp") : "Not sent"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={search.is_active ? "default" : "secondary"}>
                      {search.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Frequency</p>
                    <p className="font-medium">{search.frequency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Channels</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {search.channels.map((channel: string) => (
                        <Badge key={channel} variant="outline">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Info */}
              {search.user && (
                <Card>
                  <CardHeader>
                    <CardTitle>User</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{search.user.full_name || search.user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{search.user.email}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>{format(new Date(search.created_at), "PPpp")}</p>
                  </div>
                  {search.last_notified_at && (
                    <div>
                      <p className="text-muted-foreground">Last Notified</p>
                      <p>{format(new Date(search.last_notified_at), "PPpp")}</p>
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


