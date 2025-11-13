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
import { Edit, FileText, DollarSign, User, Building2, Clock, CheckCircle2, TrendingDown } from "lucide-react"

// Force dynamic rendering
export const dynamic = "force-dynamic"

type OfferDetailParams = {
  params: Promise<{
    id: string
  }>
}

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-800", icon: FileText },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-800", icon: Clock },
  countered: { label: "Countered", color: "bg-yellow-100 text-yellow-800", icon: TrendingDown },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: TrendingDown },
  withdrawn: { label: "Withdrawn", color: "bg-gray-100 text-gray-800", icon: TrendingDown },
}

export default async function OfferDetailPage({ params }: OfferDetailParams) {
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

  // Fetch offer
  const { data: offer, error } = await supabase
    .from("offers")
    .select(
      `
      *,
      property:properties!property_id(id, title_en, property_code, price_sale, city_en)
    `,
    )
    .eq("id", id)
    .single()

  if (error || !offer) {
    notFound()
  }

  // Fetch lead separately
  let leadData: any = null
  if (offer.lead_id) {
    const { data: lead } = await supabase
      .from("leads")
      .select("id, name, email, phone")
      .eq("id", offer.lead_id)
      .single()
    leadData = lead
  }

  // Fetch created_by profile separately
  let profileData: any = null
  if (offer.created_by) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, email")
      .eq("id", offer.created_by)
      .single()
    profileData = profile
  }

  // Fetch offer events (history)
  const { data: events } = await supabase
    .from("offer_events")
    .select("*")
    .eq("offer_id", id)
    .order("created_at", { ascending: false })

  // Fetch profiles for events
  const eventProfileIds = (events || []).map((e: any) => e.created_by).filter((id: string | null) => id !== null) as string[]
  let eventProfilesMap: Record<string, { name: string }> = {}
  if (eventProfileIds.length > 0) {
    const { data: eventProfiles } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", eventProfileIds)
    if (eventProfiles) {
      eventProfiles.forEach((p: any) => {
        eventProfilesMap[p.id] = { name: p.name }
      })
    }
  }

  const offerWithRelations = {
    ...offer,
    lead: leadData,
    created_by_profile: profileData,
  }

  const eventsWithProfiles = (events || []).map((event: any) => ({
    ...event,
    created_by_profile: event.created_by && eventProfilesMap[event.created_by] ? eventProfilesMap[event.created_by] : null,
  }))

  const statusConfig = STATUS_CONFIG[offer.status as keyof typeof STATUS_CONFIG]
  const StatusIcon = statusConfig?.icon || FileText
  const priceDiff = offer.property?.price_sale
    ? ((Number(offer.amount) - Number(offer.property.price_sale)) / Number(offer.property.price_sale)) *
      100
    : null

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          <AdminBreadcrumbs
            items={[
              { label: "Offers", href: "/admin/offers" },
              { label: `Offer ${id.substring(0, 8)}` },
            ]}
          />
          <AdminBackButton href="/admin/offers" label="Back to Offers" />

          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">Offer Details</h1>
                <Badge className={statusConfig?.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig?.label}
                </Badge>
              </div>
              <p className="text-slate-600">View and manage offer information</p>
            </div>
            <Button asChild>
              <Link href={`/admin/offers/${offer.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Offer
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Offer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Offer Amount</p>
                      <p className="text-2xl font-bold">
                        {offer.currency} {Number(offer.amount).toLocaleString()}
                      </p>
                      {priceDiff !== null && (
                        <p className={`text-sm ${priceDiff >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {priceDiff >= 0 ? "+" : ""}
                          {priceDiff.toFixed(1)}% vs asking price
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Asking Price</p>
                      <p className="text-xl font-semibold">
                        {offer.property?.price_sale
                          ? `${offer.currency} ${Number(offer.property.price_sale).toLocaleString()}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {offer.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Notes</p>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{offer.notes}</p>
                      </div>
                    </div>
                  )}

                  {offer.terms_json && Object.keys(offer.terms_json).length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Terms</p>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <pre className="text-sm">{JSON.stringify(offer.terms_json, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Offer History */}
              {events && events.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Offer History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {eventsWithProfiles.map((event: any) => (
                        <div key={event.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{event.type}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(event.created_at), "PPpp")}
                              </span>
                            </div>
                            {event.created_by_profile && (
                              <p className="text-sm text-muted-foreground">
                                by {event.created_by_profile.name}
                              </p>
                            )}
                            {event.payload_json && Object.keys(event.payload_json).length > 0 && (
                              <div className="mt-2 text-sm bg-muted/50 p-2 rounded">
                                <pre className="text-xs">{JSON.stringify(event.payload_json, null, 2)}</pre>
                              </div>
                            )}
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Lead Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {offerWithRelations.lead ? (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{offerWithRelations.lead.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{offerWithRelations.lead.email}</p>
                      </div>
                      {offerWithRelations.lead.phone && (
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{offerWithRelations.lead.phone}</p>
                        </div>
                      )}
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/admin/leads/${offerWithRelations.lead.id}`}>View Lead Details</Link>
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No lead associated</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Property Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {offer.property ? (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Property Code</p>
                        <p className="font-medium">{offer.property.property_code}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Title</p>
                        <p className="font-medium">{offer.property.title_en}</p>
                      </div>
                      {offer.property.city_en && (
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{offer.property.city_en}</p>
                        </div>
                      )}
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/admin/properties/${offer.property.id}`}>View Property Details</Link>
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No property associated</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>{format(new Date(offer.created_at), "PPpp")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p>{format(new Date(offer.updated_at), "PPpp")}</p>
                  </div>
                  {offerWithRelations.created_by_profile && (
                    <div>
                      <p className="text-muted-foreground">Created By</p>
                      <p>{offerWithRelations.created_by_profile.name}</p>
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


