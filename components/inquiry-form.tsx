"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Send } from "lucide-react"
import { trackClick, trackEvent } from "@/lib/utils/analytics"

interface InquiryFormProps {
  propertyId: string
  propertyTitle: string
}

export function InquiryForm({ propertyId, propertyTitle }: InquiryFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      // Prepare lead data with all required fields
      // Only include fields that exist in the schema
      const leadData: any = {
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        message: formData.message?.trim() || null,
        lead_source: "website", // Explicitly set lead_source
        property_id: propertyId || null,
        status: "new",
      }
      
      // Only add lead_type and priority if they exist (will be added by migration)
      // For now, we'll try to add them and let the database handle it
      try {
        leadData.lead_type = "property_inquiry"
        leadData.priority = "medium"
      } catch {
        // If columns don't exist, they'll be ignored
      }
      
      const { error: insertError, data } = await supabase
        .from("leads")
        .insert(leadData)
        .select()
      
      if (insertError) {
        console.error("Lead insert error:", insertError)
        throw new Error(insertError.message || "Failed to submit inquiry. Please try again.")
      }

      // Track form submission (non-blocking - don't wait for it)
      trackEvent("inquiry_form_submitted", {
        property_id: propertyId,
        property_title: propertyTitle,
      }).catch(() => {
        // Silently fail - analytics shouldn't block form submission
      })

      // Track click on inquiry form (non-blocking)
      trackClick({
        element_type: "inquiry_form",
        element_id: propertyId,
        property_id: propertyId,
        url: typeof window !== "undefined" ? window.location.href : "",
      }).catch(() => {
        // Silently fail - analytics shouldn't block form submission
      })

      setSuccess(true)
      setFormData({ fullName: "", email: "", phone: "", message: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit inquiry")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="border-[#E0E0E0]">
        <CardContent className="p-8 text-center">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Send className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-[#333333] mb-2">Inquiry Sent Successfully!</h3>
          <p className="text-[#666666]">Thank you for your interest. Our team will contact you shortly.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[#E0E0E0]">
      <CardHeader>
        <CardTitle className="text-[#333333]">Request Information</CardTitle>
        <CardDescription className="text-[#666666]">
          Interested in {propertyTitle}? Send us your details and we'll get back to you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-[#333333]">Full Name *</Label>
            <Input
              id="fullName"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="John Doe"
              className="border-[#E0E0E0] focus:border-[#333333]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#333333]">Email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              className="border-[#E0E0E0] focus:border-[#333333]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-[#333333]">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+30 123 456 7890"
              className="border-[#E0E0E0] focus:border-[#333333]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-[#333333]">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="I'm interested in this property..."
              rows={4}
              className="border-[#E0E0E0] focus:border-[#333333]"
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}

          <Button type="submit" className="w-full bg-[#E50000] hover:bg-[#CC0000] text-white" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Inquiry"}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
