"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import { AdminOfferFormSheet } from "@/components/admin-offer-form-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, DollarSign, Clock, CheckCircle2, Plus, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { updateOfferStatus, deleteOffer } from "@/lib/actions/offers"
import { toast } from "sonner"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Offer {
  id: string
  amount: number
  currency: string
  status: string
  notes: string | null
  created_at: string
  updated_at: string
  lead_id: string | null
  property_id: string
  lead?: { name: string; email: string }
  property?: { title_en: string; property_code: string; price_sale: number; id: string }
}

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-800", icon: FileText },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-800", icon: Clock },
  countered: { label: "Countered", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: FileText },
  withdrawn: { label: "Withdrawn", color: "bg-gray-100 text-gray-800", icon: FileText },
}

export function AdminOffersPageClient() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | undefined>(undefined)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; offerId: string | null; offerTitle: string }>({
    open: false,
    offerId: null,
    offerTitle: "",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchOffers()

    // Realtime subscription
    const channel = supabase
      .channel("offers-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, () => {
        fetchOffers()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchOffers() {
    const { data, error } = await supabase
      .from("offers")
      .select(
        `
        *,
        property:properties!property_id(title_en, property_code, price_sale, id)
      `
      )
      .order("created_at", { ascending: false })

    // Fetch leads separately
    const leadIds = (data || []).map((o: any) => o.lead_id).filter((id: string | null) => id !== null) as string[]

    let leadsMap: Record<string, { name: string; email: string }> = {}
    if (leadIds.length > 0) {
      const { data: leadsData } = await supabase.from("leads").select("id, name, email").in("id", leadIds)
      if (leadsData) {
        leadsData.forEach((lead: any) => {
          leadsMap[lead.id] = { name: lead.name, email: lead.email }
        })
      }
    }

    // Combine data
    const offersWithRelations = (data || []).map((offer: any) => ({
      ...offer,
      lead: offer.lead_id && leadsMap[offer.lead_id] ? leadsMap[offer.lead_id] : null,
    }))

    if (!error && offersWithRelations) {
      setOffers(offersWithRelations)
    }
    setLoading(false)
  }

  async function handleUpdateStatus(offerId: string, newStatus: string) {
    const result = await updateOfferStatus(offerId, newStatus as any)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Offer status updated")
      fetchOffers()
    }
  }

  async function handleDelete(offerId: string) {
    const result = await deleteOffer(offerId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Offer deleted")
      fetchOffers()
      setDeleteDialog({ open: false, offerId: null, offerTitle: "" })
    }
  }

  const handleNewOfferClick = () => {
    setEditingOffer(undefined)
    setIsSheetOpen(true)
  }

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer)
    setIsSheetOpen(true)
  }

  const filteredOffers = offers.filter((offer) => {
    const matchesStatus = statusFilter === "all" || offer.status === statusFilter
    const matchesSearch =
      offer.lead?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.property?.title_en.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const stats = {
    total: offers.length,
    draft: offers.filter((o) => o.status === "draft").length,
    submitted: offers.filter((o) => o.status === "submitted").length,
    accepted: offers.filter((o) => o.status === "accepted").length,
    totalValue: offers.filter((o) => o.status === "accepted").reduce((sum, o) => sum + Number(o.amount), 0),
  }

  if (loading) {
    return (
      <AdminPageWrapper title="Offers" description="Track and manage property offers">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminPageWrapper>
    )
  }

  return (
    <AdminPageWrapper
      title="Offers"
      description="Track and manage property offers"
      headerActions={
        <Button onClick={handleNewOfferClick}>
          <Plus className="mr-2 h-4 w-4" />
          New Offer
        </Button>
      }
    >
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Offers</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Offers</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.submitted}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Accepted</p>
              <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">€{stats.totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex gap-4">
          <Input
            placeholder="Search offers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="countered">Countered</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Offers List */}
      <div className="space-y-4">
        {filteredOffers.map((offer) => {
          const statusConfig = STATUS_CONFIG[offer.status as keyof typeof STATUS_CONFIG]
          const StatusIcon = statusConfig?.icon || FileText
          const priceDiff = offer.property?.price_sale
            ? ((offer.amount - offer.property.price_sale) / offer.property.price_sale) * 100
            : 0

          return (
            <Card key={offer.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{offer.property?.title_en || "Property"}</h3>
                      <p className="text-sm text-muted-foreground">{offer.property?.property_code}</p>
                    </div>
                    <Badge className={statusConfig?.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig?.label}
                    </Badge>
                  </div>

                  {/* Offer Details */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Offer Amount</p>
                      <p className="text-xl font-bold">
                        {offer.currency} {offer.amount.toLocaleString()}
                      </p>
                      {priceDiff !== 0 && (
                        <p className={`text-xs ${priceDiff > 0 ? "text-green-600" : "text-red-600"}`}>
                          {priceDiff > 0 ? "+" : ""}
                          {priceDiff.toFixed(1)}% vs asking
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Buyer</p>
                      <p className="font-medium">{offer.lead?.name || "N/A"}</p>
                      <p className="text-xs text-muted-foreground">{offer.lead?.email || ""}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="font-medium">{format(new Date(offer.created_at), "MMM dd, yyyy")}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(offer.created_at), "HH:mm")}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {offer.notes && (
                    <div className="bg-muted/50 p-3 rounded">
                      <p className="text-sm">{offer.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    {offer.status === "draft" && (
                      <Button size="sm" onClick={() => handleUpdateStatus(offer.id, "submitted")}>
                        Submit Offer
                      </Button>
                    )}
                    {offer.status === "submitted" && (
                      <>
                        <Button size="sm" variant="default" onClick={() => handleUpdateStatus(offer.id, "accepted")}>
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(offer.id, "countered")}>
                          Counter
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(offer.id, "rejected")}>
                          Reject
                        </Button>
                      </>
                    )}
                    {offer.status === "countered" && (
                      <>
                        <Button size="sm" onClick={() => handleUpdateStatus(offer.id, "accepted")}>
                          Accept Counter
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(offer.id, "rejected")}>
                          Reject Counter
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleEditOffer(offer)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          offerId: offer.id,
                          offerTitle: offer.property?.title_en || "Offer",
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    {offer.property && (
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/properties/${offer.property.id}`}>View Property</Link>
                      </Button>
                    )}
                    {offer.lead && (
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/leads/${offer.lead_id}`}>View Lead</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}

        {filteredOffers.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No offers found</p>
              <Button className="mt-4" onClick={handleNewOfferClick}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Offer
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Offer Create/Edit Sheet */}
      <AdminOfferFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        initialData={editingOffer}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the offer for "{deleteDialog.offerTitle}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.offerId && handleDelete(deleteDialog.offerId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPageWrapper>
  )
}

