"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createOffer, updateOffer, type OfferInput } from "@/lib/actions/offers"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useLeads } from "@/lib/hooks/use-leads"
import { useProperties } from "@/lib/hooks/use-properties"

interface AdminOfferFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: {
    id: string
    lead_id?: string | null
    property_id: string
    amount: number
    currency: string
    status: string
    notes?: string | null
  }
  leadId?: string
  propertyId?: string
}

export function AdminOfferFormSheet({ open, onOpenChange, initialData, leadId, propertyId }: AdminOfferFormSheetProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const { data: leads } = useLeads({ limit: 100 })
  const { data: properties } = useProperties({ limit: 100 })

  const [formData, setFormData] = React.useState({
    lead_id: initialData?.lead_id || leadId || "",
    property_id: initialData?.property_id || propertyId || "",
    amount: initialData?.amount?.toString() || "",
    currency: initialData?.currency || "EUR",
    status: initialData?.status || "draft",
    notes: initialData?.notes || "",
  })

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        lead_id: initialData.lead_id || "",
        property_id: initialData.property_id,
        amount: initialData.amount?.toString() || "",
        currency: initialData.currency || "EUR",
        status: initialData.status || "draft",
        notes: initialData.notes || "",
      })
    } else {
      setFormData({
        lead_id: leadId || "",
        property_id: propertyId || "",
        amount: "",
        currency: "EUR",
        status: "draft",
        notes: "",
      })
    }
    setError(null)
  }, [initialData, open, leadId, propertyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload: OfferInput = {
        lead_id: formData.lead_id || undefined,
        property_id: formData.property_id,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        status: formData.status as any,
        notes: formData.notes || undefined,
      }

      let result
      if (initialData?.id) {
        result = await updateOffer(initialData.id, payload)
      } else {
        result = await createOffer(payload)
      }

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success(`Offer ${initialData?.id ? "updated" : "created"} successfully!`)
        onOpenChange(false)
        router.refresh()
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save offer"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initialData ? "Edit Offer" : "Create New Offer"}</SheetTitle>
          <SheetDescription>
            {initialData ? "Update offer details" : "Add a new property offer"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Lead Selection */}
          <div className="space-y-2">
            <Label htmlFor="lead_id">Lead (Optional)</Label>
            <Select value={formData.lead_id} onValueChange={(value) => handleSelectChange("lead_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {leads?.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name} {lead.email ? `(${lead.email})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Property Selection */}
          <div className="space-y-2">
            <Label htmlFor="property_id">Property *</Label>
            <Select
              value={formData.property_id}
              onValueChange={(value) => handleSelectChange("property_id", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties?.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title_en || property.code || property.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={formData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="countered">Countered</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Additional notes about this offer..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : initialData ? "Update Offer" : "Create Offer"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

