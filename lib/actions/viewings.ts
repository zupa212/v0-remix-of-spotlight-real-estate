"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Viewing validation schema
const viewingSchema = z.object({
  property_id: z.string().uuid("Property ID must be a valid UUID"),
  lead_id: z.string().uuid().nullable().optional(),
  agent_id: z.string().uuid().nullable().optional(),
  scheduled_at: z.string().datetime("Scheduled date must be a valid datetime"),
  duration_minutes: z.number().int().min(15).max(480).default(60),
  status: z.enum(["scheduled", "confirmed", "completed", "cancelled", "no_show"]).default("scheduled"),
  client_name: z.string().optional(),
  client_email: z.string().email().optional().or(z.literal("")),
  client_phone: z.string().optional(),
  notes: z.string().optional(),
})

const viewingUpdateSchema = viewingSchema.partial().extend({
  property_id: z.string().uuid().optional(),
  scheduled_at: z.string().datetime().optional(),
})

export type ViewingInput = z.infer<typeof viewingSchema>
export type ViewingUpdateInput = z.infer<typeof viewingUpdateSchema>

interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Create a new viewing
 */
export async function createViewing(
  input: ViewingInput
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
    const validated = viewingSchema.parse(input)

    // If lead_id is provided, don't use client_name/email/phone
    const viewingData = {
      property_id: validated.property_id,
      lead_id: validated.lead_id || null,
      agent_id: validated.agent_id || null,
      scheduled_date: validated.scheduled_at, // Database column is scheduled_date
      duration_minutes: validated.duration_minutes,
      status: validated.status,
      client_name: validated.lead_id ? null : validated.client_name || null,
      client_email: validated.lead_id ? null : validated.client_email || null,
      client_phone: validated.lead_id ? null : validated.client_phone || null,
      notes: validated.notes || null,
      created_by: user.id,
    }

    // Insert viewing
    const { data, error } = await supabase
      .from("viewings")
      .insert(viewingData)
      .select("id")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // If lead_id is provided, update lead status to "viewing_scheduled"
    if (validated.lead_id) {
      await supabase
        .from("leads")
        .update({ status: "viewing_scheduled", updated_at: new Date().toISOString() })
        .eq("id", validated.lead_id)

      // Create lead activity entry
      await supabase.from("lead_activity").insert({
        lead_id: validated.lead_id,
        activity_type: "viewing_scheduled",
        description: `Viewing scheduled for ${new Date(validated.scheduled_at).toLocaleDateString()}`,
        created_by: user.id,
      })
    }

    revalidatePath("/admin/viewings")
    revalidatePath("/admin/leads")

    return { success: true, data: { id: data.id } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Validation failed" }
    }
    return { success: false, error: err instanceof Error ? err.message : "Failed to create viewing" }
  }
}

/**
 * Update an existing viewing
 */
export async function updateViewing(
  id: string,
  input: ViewingUpdateInput
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
    const validated = viewingUpdateSchema.parse(input)

    // Map scheduled_at to scheduled_date for database
    const updateData: any = { ...validated }
    if (validated.scheduled_at) {
      updateData.scheduled_date = validated.scheduled_at
      delete updateData.scheduled_at
    }

    // Update viewing
    const { data, error } = await supabase
      .from("viewings")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/viewings")
    revalidatePath(`/admin/viewings/${id}`)

    return { success: true, data: { id: data.id } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Validation failed" }
    }
    return { success: false, error: err instanceof Error ? err.message : "Failed to update viewing" }
  }
}

/**
 * Delete a viewing
 */
export async function deleteViewing(id: string): Promise<ActionResult<void>> {
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

    // Delete viewing
    const { error } = await supabase.from("viewings").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/viewings")

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete viewing" }
  }
}

/**
 * Create viewing from lead (convenience function)
 */
export async function createViewingFromLead(
  leadId: string,
  propertyId: string,
  scheduledDate: string,
  agentId?: string,
  notes?: string
): Promise<ActionResult<{ id: string }>> {
  return createViewing({
    property_id: propertyId,
    lead_id: leadId,
    agent_id: agentId || null,
    scheduled_at: scheduledDate,
    duration_minutes: 60,
    status: "scheduled",
    notes: notes || null,
  })
}

