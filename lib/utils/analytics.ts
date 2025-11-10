import { createClient } from "@/lib/supabase/client"

export type ClickType = "property_card" | "property_detail" | "inquiry_form" | "agent_profile" | "other"

export interface ClickEvent {
  element_type: ClickType
  element_id?: string
  property_id?: string
  agent_id?: string
  url: string
  user_agent?: string
}

export async function trackClick(event: ClickEvent) {
  try {
    const supabase = createClient()
    await supabase.from("analytics_clicks").insert({
      element_type: event.element_type,
      element_id: event.element_id,
      property_id: event.property_id,
      agent_id: event.agent_id,
      url: event.url,
      user_agent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    })
  } catch (error) {
    console.error("Error tracking click:", error)
    // Don't throw - analytics failures shouldn't break the app
  }
}

export async function trackPageView(url: string, pageType?: string) {
  try {
    const supabase = createClient()
    // For now, we'll use analytics_clicks with a special type
    // In the future, you might want a separate page_views table
    await supabase.from("analytics_clicks").insert({
      element_type: "other",
      url,
      metadata: pageType ? { page_type: pageType } : undefined,
    })
  } catch (error) {
    console.error("Error tracking page view:", error)
  }
}

export async function trackEvent(eventType: string, metadata?: Record<string, any>) {
  try {
    const supabase = createClient()
    await supabase.from("analytics_clicks").insert({
      element_type: "other",
      url: typeof window !== "undefined" ? window.location.href : "",
      metadata: {
        event_type: eventType,
        ...metadata,
      },
    })
  } catch (error) {
    console.error("Error tracking event:", error)
  }
}

