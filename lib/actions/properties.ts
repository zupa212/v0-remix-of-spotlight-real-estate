"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Property validation schema
const propertySchema = z.object({
  // Basic info
  title_en: z.string().min(1, "English title is required"),
  title_gr: z.string().min(1, "Greek title is required"),
  description_en: z.string().optional(),
  description_gr: z.string().optional(),

  // Type and status
  property_type: z.enum(["apartment", "house", "villa", "land", "commercial", "office"]),
  listing_type: z.enum(["sale", "rent", "both"]),
  status: z.enum(["available", "pending", "sold", "rented", "off-market"]).optional(),

  // Location
  region_id: z.string().uuid().nullable().optional(),
  address_en: z.string().optional(),
  address_gr: z.string().optional(),
  city_en: z.string().optional(),
  city_gr: z.string().optional(),
  postal_code: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),

  // Pricing
  price_sale: z.number().positive().nullable().optional(),
  price_rent: z.number().positive().nullable().optional(),
  currency: z.string().default("EUR"),

  // Details
  bedrooms: z.number().int().min(0).nullable().optional(),
  bathrooms: z.number().int().min(0).nullable().optional(),
  area_sqm: z.number().positive().nullable().optional(),
  plot_size_sqm: z.number().positive().nullable().optional(),
  floor_number: z.number().int().nullable().optional(),
  total_floors: z.number().int().nullable().optional(),
  year_built: z.number().int().nullable().optional(),
  energy_rating: z.string().nullable().optional(),

  // Features
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),

  // Media
  main_image_url: z.string().url().nullable().optional(),
  tour_3d_url: z.string().url().nullable().optional(),
  video_url: z.string().url().nullable().optional(),

  // SEO
  meta_title_en: z.string().optional(),
  meta_title_gr: z.string().optional(),
  meta_description_en: z.string().optional(),
  meta_description_gr: z.string().optional(),

  // Management
  agent_id: z.string().uuid().nullable().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  display_order: z.number().int().default(0),
})

const propertyUpdateSchema = propertySchema.partial()

export type PropertyInput = z.infer<typeof propertySchema>
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>

interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Create a new property
 */
export async function createProperty(
  input: PropertyInput
): Promise<ActionResult<{ id: string; property_code: string }>> {
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
    const validated = propertySchema.parse(input)

    // Generate property code (format: SP{YY}-{0001})
    const year = new Date().getFullYear().toString().slice(-2)
    const { count } = await supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
    const codeNumber = ((count || 0) + 1).toString().padStart(4, "0")
    const property_code = `SP${year}-${codeNumber}`

    // Insert property
    const { data, error } = await supabase
      .from("properties")
      .insert({
        ...validated,
        property_code,
        created_by: user.id,
        status: validated.status || "available",
      })
      .select("id, property_code")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/properties")
    revalidatePath("/properties")

    return { success: true, data: { id: data.id, property_code: data.property_code } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Validation failed" }
    }
    return { success: false, error: err instanceof Error ? err.message : "Failed to create property" }
  }
}

/**
 * Update an existing property
 */
export async function updateProperty(
  id: string,
  input: PropertyUpdateInput
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
    const validated = propertyUpdateSchema.parse(input)

    // Update property
    const { data, error } = await supabase
      .from("properties")
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/properties")
    revalidatePath(`/admin/properties/${id}`)
    revalidatePath("/properties")
    revalidatePath(`/properties/${id}`)

    return { success: true, data: { id: data.id } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Validation failed" }
    }
    return { success: false, error: err instanceof Error ? err.message : "Failed to update property" }
  }
}

/**
 * Delete a property
 */
export async function deleteProperty(id: string): Promise<ActionResult<void>> {
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

    // Delete property
    const { error } = await supabase.from("properties").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/properties")
    revalidatePath("/properties")

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete property" }
  }
}

/**
 * Bulk update properties
 */
export async function bulkUpdateProperties(
  ids: string[],
  updates: PropertyUpdateInput
): Promise<ActionResult<{ count: number }>> {
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
    const validated = propertyUpdateSchema.parse(updates)

    // Bulk update
    const { data, error } = await supabase
      .from("properties")
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .in("id", ids)
      .select("id")

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/properties")
    revalidatePath("/properties")

    return { success: true, data: { count: data?.length || 0 } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Validation failed" }
    }
    return { success: false, error: err instanceof Error ? err.message : "Failed to bulk update properties" }
  }
}


