import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PropertiesTableClient } from "./page-client"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import { AdminGlassCard } from "@/components/admin-glass-card"

// Force dynamic rendering to avoid build-time errors
export const dynamic = "force-dynamic"

type AdminPropertyRow = {
  id: string
  propertyCode: string
  titleEn: string
  location: string
  propertyType: string
  listingType: string
  priceSale: number | null
  priceRent: number | null
  currency: string
  status: string
  published: boolean
  createdAt: string
  displayPrice: string
}

function formatCurrency(value: number, currency = "EUR") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatLocation(city?: string | null, region?: string | null) {
  const parts = [city, region].filter((part) => typeof part === "string" && part.trim().length > 0) as string[]
  if (parts.length === 0) return "Greece"
  if (parts.length === 1) return parts[0]
  return parts.join(", ")
}

export default async function AdminPropertiesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/admin/login")
  }

  const { data: propertiesData, error: propertiesError } = await supabase
    .from("properties")
    .select(
      `
        id,
        property_code,
        title_en,
        city_en,
        listing_type,
        property_type,
        price_sale,
        price_rent,
        currency,
        status,
        published,
        created_at,
        region:regions(name_en)
      `,
    )
    .order("created_at", { ascending: false })
    .limit(100)

  if (propertiesError) {
    console.error("Failed to load properties", propertiesError)
  }

  const properties: AdminPropertyRow[] = (propertiesData ?? []).map((property) => {
    const listingType = property.listing_type ?? "sale"
    const currency = property.currency ?? "EUR"
    const priceSale = property.price_sale != null ? Number(property.price_sale) : null
    const priceRent = property.price_rent != null ? Number(property.price_rent) : null

    const displayPrice =
      listingType === "rent"
        ? priceRent && priceRent > 0
          ? `${formatCurrency(priceRent, currency)}/mo`
          : "Price on request"
        : priceSale && priceSale > 0
          ? formatCurrency(priceSale, currency)
          : "Price on request"

    return {
      id: property.id,
      propertyCode: property.property_code ?? "—",
      titleEn: property.title_en ?? "Untitled Property",
      location: formatLocation(property.city_en, property.region?.name_en),
      propertyType: property.property_type ?? "property",
      listingType,
      priceSale,
      priceRent,
      currency,
      status: property.status ?? "available",
      published: Boolean(property.published),
      createdAt: property.created_at ?? "",
      displayPrice,
    }
  })

  return (
    <AdminPageWrapper
      title="Properties"
      description="Manage your property listings"
      headerActions={
        <Button asChild className="bg-white/40 backdrop-blur-xl border-white/20">
          <Link href="/admin/properties/new">
            <Plus className="mr-2 h-5 w-5" />
            Add Property
          </Link>
        </Button>
      }
    >
      {propertiesError && (
        <AdminGlassCard index={0} className="mb-6 border-red-200/50 bg-red-50/80">
          <p className="text-sm text-red-700">
            Unable to load the latest property data. Showing cached results if available.
          </p>
        </AdminGlassCard>
      )}

      {/* Properties Table */}
      <AdminGlassCard index={propertiesError ? 1 : 0} className="overflow-hidden">
        <PropertiesTableClient properties={properties} />
      </AdminGlassCard>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing <span className="font-medium">{properties.length}</span> properties
        </p>
      </div>
    </AdminPageWrapper>
  )
}
