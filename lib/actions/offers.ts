"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Offer validation schema
const offerSchema = z.object({
  lead_id: z.string().uuid("Lead ID must be a valid UUID").nullable().optional(),
  property_id: z.string().uuid("Property ID must be a valid UUID"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("EUR"),
  status: z.enum(["draft", "submitted", "countered", "accepted", "rejected", "withdrawn"]).default("draft"),
  terms_json: z.record(z.any()).optional(),
  notes: z.string().optional(),
})

const offerUpdateSchema = offerSchema.partial().extend({
  lead_id: z.string().uuid().nullable().optional(),
  property_id: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
})

export type OfferInput = z.infer<typeof offerSchema>
export type OfferUpdateInput = z.infer<typeof offerUpdateSchema>

interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Create a new offer
 */
export async function createOffer(
  input: OfferInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate input
    const validated = offerSchema.parse(input)

    // Insert offer
    const { data, error } = await supabase
      .from("offers")
      .insert({
        lead_id: validated.lead_id || null,
        property_id: validated.property_id,
        amount: validated.amount,
        currency: validated.currency,
        status: validated.status,
        terms_json: validated.terms_json || {},
        notes: validated.notes || null,
        created_by: user.id,
      })
      .select("id")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Log offer event
    await supabase.from("offer_events").insert({
      offer_id: data.id,
      type: "created",
      payload_json: { status: validated.status, amount: validated.amount },
      created_by: user.id,
    })

    // Revalidate paths
    revalidatePath("/admin/offers")
    revalidatePath("/admin/leads")
    revalidatePath("/admin/properties")

    return { success: true, data: { id: data.id } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to create offer" }
  }
}

/**
 * Update an existing offer
 */
export async function updateOffer(
  id: string,
  input: OfferUpdateInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate input
    const validated = offerUpdateSchema.parse(input)

    // Get current offer to track status changes
    const { data: currentOffer } = await supabase
      .from("offers")
      .select("status")
      .eq("id", id)
      .single()

    // Update offer
    const { data, error } = await supabase
      .from("offers")
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, status")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Log status change if status was updated
    if (validated.status && validated.status !== currentOffer?.status) {
      await supabase.from("offer_events").insert({
        offer_id: id,
        type: validated.status as any,
        payload_json: { status: validated.status, previous_status: currentOffer?.status },
        created_by: user.id,
      })
    }

    // Revalidate paths
    revalidatePath("/admin/offers")
    revalidatePath(`/admin/offers/${id}`)
    revalidatePath("/admin/leads")
    revalidatePath("/admin/properties")

    return { success: true, data: { id: data.id } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to update offer" }
  }
}

/**
 * Delete an offer
 */
export async function deleteOffer(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    // Delete offer (cascade will delete offer_events)
    const { error } = await supabase.from("offers").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    // Revalidate paths
    revalidatePath("/admin/offers")
    revalidatePath("/admin/leads")
    revalidatePath("/admin/properties")

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete offer" }
  }
}

/**
 * Update offer status (convenience function)
 */
export async function updateOfferStatus(
  id: string,
  status: "draft" | "submitted" | "countered" | "accepted" | "rejected" | "withdrawn"
): Promise<ActionResult<{ id: string }>> {
  return updateOffer(id, { status })
}

