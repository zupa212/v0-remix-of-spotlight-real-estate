import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { portal: string } }) {
  const supabase = await createServerClient()

  // Check if portal is active
  const { data: mapping } = await supabase
    .from("syndication_mappings")
    .select("*")
    .eq("portal", params.portal)
    .eq("is_active", true)
    .single()

  if (!mapping) {
    return new NextResponse("Feed not found or inactive", { status: 404 })
  }

  // Fetch published properties
  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  if (!properties) {
    return new NextResponse("No properties found", { status: 404 })
  }

  // Generate XML feed
  const xml = generateXMLFeed(params.portal, properties)

  // Update last generated timestamp
  await supabase
    .from("syndication_mappings")
    .update({ last_generated_at: new Date().toISOString() })
    .eq("id", mapping.id)

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  })
}

function generateXMLFeed(portal: string, properties: any[]) {
  const items = properties
    .map(
      (property) => `
    <listing>
      <id>${property.property_code}</id>
      <title><![CDATA[${property.title}]]></title>
      <description><![CDATA[${property.description || ""}]]></description>
      <price>${property.price}</price>
      <currency>${property.currency}</currency>
      <type>${property.type}</type>
      <category>${property.category}</category>
      <city>${property.city}</city>
      <region>${property.region}</region>
      <bedrooms>${property.bedrooms || 0}</bedrooms>
      <bathrooms>${property.bathrooms || 0}</bathrooms>
      <area>${property.area_sqm || 0}</area>
      <url>https://spotlight.gr/properties/${property.property_code}</url>
      ${property.hero_image ? `<image>${property.hero_image}</image>` : ""}
    </listing>
  `,
    )
    .join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
<properties>
  <portal>${portal}</portal>
  <generated>${new Date().toISOString()}</generated>
  <count>${properties.length}</count>
  ${items}
</properties>`
}
