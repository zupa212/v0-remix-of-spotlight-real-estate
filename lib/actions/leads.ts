"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Reply to lead via WhatsApp
 * Creates a deep link and logs activity
 */
export async function replyWhatsApp(
  leadId: string,
  message?: string
): Promise<ActionResult<{ url: string }>> {
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

    // Get lead details
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id, full_name, phone, email")
      .eq("id", leadId)
      .single()

    if (leadError || !lead) {
      return { success: false, error: "Lead not found" }
    }

    if (!lead.phone) {
      return { success: false, error: "Lead has no phone number" }
    }

    // Clean phone number (remove non-digits, add country code if needed)
    let cleanPhone = lead.phone.replace(/\D/g, "")
    
    // If phone doesn't start with country code, assume Greece (+30)
    if (!cleanPhone.startsWith("30") && cleanPhone.length === 10) {
      cleanPhone = "30" + cleanPhone
    }

    // Create WhatsApp deep link
    const encodedMessage = message ? encodeURIComponent(message) : ""
    const whatsappUrl = message
      ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
      : `https://wa.me/${cleanPhone}`

    // Log activity
    const { error: activityError } = await supabase.from("lead_activity").insert({
      lead_id: leadId,
      activity_type: "whatsapp_contact",
      description: message
        ? `WhatsApp message sent to ${lead.full_name}: ${message}`
        : `WhatsApp conversation opened with ${lead.full_name}`,
      metadata: {
        phone: lead.phone,
        url: whatsappUrl,
      },
      created_by: user.id,
    })

    if (activityError) {
      console.error("Error logging WhatsApp activity:", activityError)
      // Don't fail the whole operation if logging fails
    }

    // Update lead's last_contacted_at
    await supabase
      .from("leads")
      .update({
        last_contacted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId)

    revalidatePath("/admin/leads")
    revalidatePath(`/admin/leads/${leadId}`)

    return { success: true, data: { url: whatsappUrl } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create WhatsApp link" }
  }
}

/**
 * Reply to lead via Telegram
 * Creates a deep link and logs activity
 */
export async function replyTelegram(
  leadId: string,
  message?: string
): Promise<ActionResult<{ url: string }>> {
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

    // Get lead details
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id, full_name, phone, email")
      .eq("id", leadId)
      .single()

    if (leadError || !lead) {
      return { success: false, error: "Lead not found" }
    }

    // Telegram requires username or phone number
    // For now, we'll use phone number if available, otherwise return error
    if (!lead.phone) {
      return { success: false, error: "Lead has no phone number. Telegram requires phone number or username." }
    }

    // Clean phone number
    let cleanPhone = lead.phone.replace(/\D/g, "")
    
    // If phone doesn't start with country code, assume Greece (+30)
    if (!cleanPhone.startsWith("30") && cleanPhone.length === 10) {
      cleanPhone = "30" + cleanPhone
    }

    // Create Telegram deep link
    // Note: Telegram links work differently - we can use tg:// or https://t.me/
    // For phone numbers, we use tg://resolve?phone=...
    const encodedMessage = message ? encodeURIComponent(message) : ""
    const telegramUrl = message
      ? `https://t.me/+${cleanPhone}?text=${encodedMessage}`
      : `https://t.me/+${cleanPhone}`

    // Log activity
    const { error: activityError } = await supabase.from("lead_activity").insert({
      lead_id: leadId,
      activity_type: "telegram_contact",
      description: message
        ? `Telegram message sent to ${lead.full_name}: ${message}`
        : `Telegram conversation opened with ${lead.full_name}`,
      metadata: {
        phone: lead.phone,
        url: telegramUrl,
      },
      created_by: user.id,
    })

    if (activityError) {
      console.error("Error logging Telegram activity:", activityError)
      // Don't fail the whole operation if logging fails
    }

    // Update lead's last_contacted_at
    await supabase
      .from("leads")
      .update({
        last_contacted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId)

    revalidatePath("/admin/leads")
    revalidatePath(`/admin/leads/${leadId}`)

    return { success: true, data: { url: telegramUrl } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create Telegram link" }
  }
}

