"use client"

import { useEffect } from "react"
import { trackClick } from "@/lib/utils/analytics"

export function PropertyDetailTracking({ propertyId }: { propertyId: string }) {
  useEffect(() => {
    // Track page view
    trackClick({
      element_type: "property_detail",
      element_id: propertyId,
      property_id: propertyId,
      url: typeof window !== "undefined" ? window.location.href : "",
    })
  }, [propertyId])

  return null
}

