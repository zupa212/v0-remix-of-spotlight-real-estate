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
    
    // Get current URL and extract route
    const url = event.url || (typeof window !== "undefined" ? window.location.href : "")
    const route = typeof window !== "undefined" ? window.location.pathname : url.split("?")[0]
    
    // Get viewport dimensions and click position (default to center if not available)
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1920
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 1080
    
    // Try to insert with the correct schema
    const { error } = await supabase.from("analytics_clicks").insert({
      route: route,
      element_id: event.element_id || event.property_id || event.agent_id || null,
      x: Math.floor(viewportWidth / 2), // Default to center if not tracking mouse position
      y: Math.floor(viewportHeight / 2),
      viewport_width: viewportWidth,
      viewport_height: viewportHeight,
      clicked_at: new Date().toISOString(),
    })
    
    if (error) {
      console.warn("Error tracking click (non-critical):", error.message)
      // Don't throw - analytics failures shouldn't break the app
    }
  } catch (error) {
    console.warn("Error tracking click (non-critical):", error)
    // Don't throw - analytics failures shouldn't break the app
  }
}

export async function trackPageView(url: string, pageType?: string) {
  try {
    const supabase = createClient()
    const route = url.split("?")[0]
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1920
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 1080
    
    // Use analytics_page_views table if available, otherwise skip
    // Don't use analytics_clicks for page views as it has different schema
    const { error } = await supabase.from("analytics_page_views").insert({
      route: route,
      session_id: typeof window !== "undefined" ? getSessionId() : null,
    })
    
    if (error) {
      console.warn("Error tracking page view (non-critical):", error.message)
    }
  } catch (error) {
    console.warn("Error tracking page view (non-critical):", error)
  }
}

// Helper to get or create session ID
function getSessionId(): string {
  if (typeof window === "undefined") return ""
  let sessionId = sessionStorage.getItem("analytics_session_id")
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem("analytics_session_id", sessionId)
  }
  return sessionId
}

export async function trackEvent(eventType: string, metadata?: Record<string, any>) {
  try {
    const supabase = createClient()
    const url = typeof window !== "undefined" ? window.location.href : ""
    const route = url.split("?")[0]
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1920
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 1080
    
    // Store event type in element_id as a way to track it
    const elementId = `event:${eventType}${metadata?.property_id ? `:${metadata.property_id}` : ""}`
    
    const { error } = await supabase.from("analytics_clicks").insert({
      route: route,
      element_id: elementId,
      x: Math.floor(viewportWidth / 2),
      y: Math.floor(viewportHeight / 2),
      viewport_width: viewportWidth,
      viewport_height: viewportHeight,
      clicked_at: new Date().toISOString(),
    })
    
    if (error) {
      console.warn("Error tracking event (non-critical):", error.message)
    }
  } catch (error) {
    console.warn("Error tracking event (non-critical):", error)
  }
}

