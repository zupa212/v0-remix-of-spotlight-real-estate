import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Building2, TrendingUp } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function RegionsPage() {
  const supabase = await createClient()

  // Fetch regions from Supabase
  const { data: regions, error } = await supabase
    .from("regions")
    .select("*")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching regions:", error)
  }

  // Fetch property counts for each region
  const regionsWithCounts = await Promise.all(
    (regions || []).map(async (region) => {
      const { count } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("region_id", region.id)
        .eq("published", true)

      // Calculate average price
      const { data: properties } = await supabase
        .from("properties")
        .select("price_sale")
        .eq("region_id", region.id)
        .eq("published", true)
        .not("price_sale", "is", null)

      const avgPrice =
        properties && properties.length > 0
          ? properties.reduce((sum, p) => sum + Number(p.price_sale || 0), 0) / properties.length
          : null

      return {
        ...region,
        propertyCount: count || 0,
        avgPrice,
      }
    }),
  )

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <div className="pt-24 pb-16">
        <div className="w-full px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Explore Greek Real Estate by Region
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Discover premium properties across Greece's most sought-after destinations, from historic
              cities to idyllic islands
            </p>
          </div>

          {/* Regions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regionsWithCounts.map((region) => (
              <Link key={region.id} href={`/regions/${region.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200">
                    {region.image_url ? (
                      <Image
                        src={region.image_url}
                        alt={region.name_en}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Building2 className="h-16 w-16 text-slate-400" />
                      </div>
                    )}
                    {region.featured && (
                      <Badge className="absolute top-4 right-4 bg-amber-500 hover:bg-amber-600 text-white border-0">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{region.name_en}</h3>
                    {region.name_gr && (
                      <p className="text-lg text-slate-600 mb-4">{region.name_gr}</p>
                    )}
                    {region.description_en && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {region.description_en}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Building2 className="h-4 w-4" />
                        <span>{region.propertyCount} properties</span>
                      </div>
                      {region.avgPrice && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <TrendingUp className="h-4 w-4" />
                          <span>€{Math.round(region.avgPrice).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {(!regions || regions.length === 0) && (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600">No regions available yet</p>
            </div>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
