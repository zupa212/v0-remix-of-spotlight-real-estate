"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const regionSchema = z.object({
  name_en: z.string().min(1, "English name is required"),
  name_gr: z.string().nullable().optional(),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description_en: z.string().nullable().optional(),
  description_gr: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  featured: z.boolean().optional(),
  display_order: z.number().int().optional(),
})

async function requireAuth() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error("Unauthorized: User not authenticated.")
  }
  return user
}

export async function createRegion(formData: z.infer<typeof regionSchema>) {
  try {
    await requireAuth()
    const validatedData = regionSchema.parse(formData)

    const supabase = createClient()
    const { data, error } = await supabase
      .from("regions")
      .insert({
        ...validatedData,
        name_gr: validatedData.name_gr || validatedData.name_en,
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase insert error:", error)
      return { error: error.message }
    }

    revalidatePath("/admin/regions")
    return { success: true, data }
  } catch (error: any) {
    console.error("Error creating region:", error)
    return { error: error.message }
  }
}

export async function updateRegion(id: string, formData: Partial<z.infer<typeof regionSchema>>) {
  try {
    await requireAuth()
    const validatedData = regionSchema.partial().parse(formData)

    const supabase = createClient()
    const { data, error } = await supabase
      .from("regions")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase update error:", error)
      return { error: error.message }
    }

    revalidatePath("/admin/regions")
    revalidatePath(`/admin/regions/${id}`)
    return { success: true, data }
  } catch (error: any) {
    console.error("Error updating region:", error)
    return { error: error.message }
  }
}

export async function deleteRegion(id: string) {
  try {
    await requireAuth()

    const supabase = createClient()
    const { error } = await supabase.from("regions").delete().eq("id", id)

    if (error) {
      console.error("Supabase delete error:", error)
      return { error: error.message }
    }

    revalidatePath("/admin/regions")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting region:", error)
    return { error: error.message }
  }
}

