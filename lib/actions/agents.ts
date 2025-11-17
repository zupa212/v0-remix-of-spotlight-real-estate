"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const agentSchema = z.object({
  name_en: z.string().min(1, "English name is required"),
  name_gr: z.string().nullable().optional(),
  email: z.string().email("Invalid email format"),
  phone: z.string().nullable().optional(),
  bio_en: z.string().nullable().optional(),
  bio_gr: z.string().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  languages: z.array(z.string()).nullable().optional(),
  specialties: z.array(z.string()).nullable().optional(),
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

export async function createAgent(formData: z.infer<typeof agentSchema>) {
  try {
    await requireAuth()
    const validatedData = agentSchema.parse(formData)

    const supabase = createClient()
    const { data, error } = await supabase
      .from("agents")
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

    revalidatePath("/admin/agents")
    return { success: true, data }
  } catch (error: any) {
    console.error("Error creating agent:", error)
    return { error: error.message }
  }
}

export async function updateAgent(id: string, formData: Partial<z.infer<typeof agentSchema>>) {
  try {
    await requireAuth()
    const validatedData = agentSchema.partial().parse(formData)

    const supabase = createClient()
    const { data, error } = await supabase
      .from("agents")
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

    revalidatePath("/admin/agents")
    revalidatePath(`/admin/agents/${id}`)
    return { success: true, data }
  } catch (error: any) {
    console.error("Error updating agent:", error)
    return { error: error.message }
  }
}

export async function deleteAgent(id: string) {
  try {
    await requireAuth()

    const supabase = createClient()
    const { error } = await supabase.from("agents").delete().eq("id", id)

    if (error) {
      console.error("Supabase delete error:", error)
      return { error: error.message }
    }

    revalidatePath("/admin/agents")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting agent:", error)
    return { error: error.message }
  }
}

