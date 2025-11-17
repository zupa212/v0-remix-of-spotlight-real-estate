"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

const SETTINGS_ID = "00000000-0000-0000-0000-000000000000"

/**
 * Get current settings
 */
export async function getSettings(): Promise<ActionResult<{
  logo_url: string | null
  company_name: string
  company_email: string
  primary_color: string
  accent_color: string
  hot_threshold: number
  warm_threshold: number
}>> {
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

    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", SETTINGS_ID)
      .single()

    if (error) {
      // If settings don't exist, return defaults
      if (error.code === "PGRST116") {
        return {
          success: true,
          data: {
            logo_url: null,
            company_name: "Spotlight Estate Group",
            company_email: "admin@spotlight.gr",
            primary_color: "#0EA5E9",
            accent_color: "#F59E0B",
            hot_threshold: 75,
            warm_threshold: 50,
          },
        }
      }
      throw error
    }

    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get settings",
    }
  }
}

/**
 * Update logo URL
 */
export async function updateLogoUrl(logoUrl: string | null): Promise<ActionResult<{ logo_url: string | null }>> {
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

    const { data, error } = await supabase
      .from("settings")
      .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
      .eq("id", SETTINGS_ID)
      .select()
      .single()

    if (error) throw error

    revalidatePath("/admin/settings")
    revalidatePath("/admin")

    return { success: true, data: { logo_url: data.logo_url } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update logo",
    }
  }
}

/**
 * Update settings
 */
export async function updateSettings(settings: {
  company_name?: string
  company_email?: string
  primary_color?: string
  accent_color?: string
  hot_threshold?: number
  warm_threshold?: number
}): Promise<ActionResult> {
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

    const { error } = await supabase
      .from("settings")
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq("id", SETTINGS_ID)

    if (error) throw error

    revalidatePath("/admin/settings")

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update settings",
    }
  }
}

