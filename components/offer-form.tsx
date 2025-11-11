"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Save, X } from "lucide-react"

interface OfferFormProps {
  initialData?: any
  isEdit?: boolean
  leadId?: string
  propertyId?: string
}

export function OfferForm({ initialData, isEdit = false, leadId, propertyId }: OfferFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])

  const [formData, setFormData] = useState({
    leadId: initialData?.lead_id || leadId || "",
    propertyId: initialData?.property_id || propertyId || "",
    amount: initialData?.amount || "",
    currency: initialData?.currency || "EUR",
    status: initialData?.status || "draft",
    notes: initialData?.notes || "",
    termsJson: initialData?.terms_json || {},
  })

  useEffect(() => {
    fetchLeads()
    fetchProperties()
  }, [])

  async function fetchLeads() {
    const supabase = createClient()
    const { data } = await supabase
      .from("leads")
      .select("id, full_name, email")
      .order("created_at", { ascending: false })
      .limit(100)

    if (data) {
      setLeads(data)
    }
  }

  async function fetchProperties() {
    const supabase = createClient()
    const { data } = await supabase
      .from("properties")
      .select("id, title_en, property_code, price_sale")
      .order("created_at", { ascending: false })
      .limit(100)

    if (data) {
      setProperties(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to create an offer")
      }

      const offerData = {
        lead_id: formData.leadId || null,
        property_id: formData.propertyId || null,
        amount: parseFloat(formData.amount.toString()),
        currency: formData.currency,
        status: formData.status,
        notes: formData.notes || null,
        terms_json: formData.termsJson,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      }

      if (isEdit && initialData?.id) {
        // Update existing offer
        const { error: updateError } = await supabase
          .from("offers")
          .update(offerData)
          .eq("id", initialData.id)

        if (updateError) throw updateError

        // Log event
        await supabase.from("offer_events").insert({
          offer_id: initialData.id,
          type: "note_added",
          payload_json: { status: formData.status, notes: formData.notes },
          created_by: user.id,
        })
      } else {
        // Create new offer
        const { data: newOffer, error: insertError } = await supabase
          .from("offers")
          .insert(offerData)
          .select()
          .single()

        if (insertError) throw insertError

        // Log creation event
        await supabase.from("offer_events").insert({
          offer_id: newOffer.id,
          type: "created",
          payload_json: { amount: offerData.amount, currency: offerData.currency },
          created_by: user.id,
        })
      }

      router.push("/admin/offers")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to save offer")
      console.error("Error saving offer:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedProperty = properties.find((p) => p.id === formData.propertyId)
  const askingPrice = selectedProperty?.price_sale ? parseFloat(selectedProperty.price_sale) : null
  const offerAmount = formData.amount ? parseFloat(formData.amount.toString()) : null
  const priceDiff =
    askingPrice && offerAmount ? ((offerAmount - askingPrice) / askingPrice) * 100 : null

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Offer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leadId">Lead *</Label>
                <Select
                  value={formData.leadId}
                  onValueChange={(value) => setFormData({ ...formData, leadId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.full_name} ({lead.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyId">Property *</Label>
                <Select
                  value={formData.propertyId}
                  onValueChange={(value) => setFormData({ ...formData, propertyId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.property_code} - {property.title_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Offer Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
                {askingPrice && offerAmount && (
                  <p
                    className={`text-sm ${
                      priceDiff && priceDiff >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Asking: {askingPrice.toLocaleString()} {formData.currency} | Difference:{" "}
                    {priceDiff?.toFixed(1)}%
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={8}
                  placeholder="Add any additional notes or terms about this offer..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Saving..." : isEdit ? "Update Offer" : "Create Offer"}
        </Button>
      </div>
    </form>
  )
}


