"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PropertyCard } from "@/components/property-card"
import { PropertyFilters } from "@/components/property-filters"
import { SaveSearchDialog } from "@/components/save-search-dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { ChevronLeft, ChevronRight } from "lucide-react"

type PropertyListItem = {
  id: string
  title: string
  location: string
  price: number
  currency: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  imageUrl: string
  propertyType: string
  listingType: "sale" | "rent"
  featured: boolean
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatLocation(city?: string | null, region?: { name_en: string } | null) {
  const parts = [city, region?.name_en].filter((part) => typeof part === "string" && part.trim().length > 0) as string[]
  if (parts.length === 0) return "Greece"
  if (parts.length === 1) return toTitleCase(parts[0])
  return parts.map((part) => toTitleCase(part)).join(", ")
}

export default function PropertiesPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [properties, setProperties] = useState<PropertyListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [regions, setRegions] = useState<Array<{ id: string; name_en: string; slug: string }>>([])

  // Get filters from URL
  const search = searchParams.get("search") || ""
  const propertyType = searchParams.get("type") || "all"
  const listingType = searchParams.get("listing") || "all"
  const minPrice = searchParams.get("minPrice") || ""
  const maxPrice = searchParams.get("maxPrice") || ""
  const bedrooms = searchParams.get("bedrooms") || "any"
  const bathrooms = searchParams.get("bathrooms") || "any"
  const region = searchParams.get("region") || "all"
  const sort = searchParams.get("sort") || "newest"
  const page = parseInt(searchParams.get("page") || "1", 10)
  const perPage = parseInt(searchParams.get("perPage") || "12", 10)

  // Update URL params
  const updateSearchParams = (updates: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === "all" || value === "any" || value === 1) {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    })
    router.push(`/properties?${params.toString()}`)
  }

  // Fetch regions for filter dropdown
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from("regions").select("id, name_en, slug").order("display_order", { ascending: true })

        if (!error && data) {
          setRegions(data)
        }
      } catch (err) {
        console.error("Error fetching regions:", err)
      }
    }

    fetchRegions()
  }, [])

  // Fetch properties with filters
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true)
      setError(null)

      try {
        const supabase = createClient()

        // Get region_id if region filter is set
        let regionId: string | null = null
        if (region !== "all" && regions.length > 0) {
          const selectedRegion = regions.find((r) => r.slug === region)
          if (selectedRegion) {
            regionId = selectedRegion.id
          }
        }
        let query = supabase
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
            bedrooms,
            bathrooms,
            area_sqm,
            featured,
            main_image_url,
            created_at,
            region_id,
            region:regions(id, name_en, slug)
          `,
            { count: "exact" }
          )
          .eq("published", true)

        // Apply search
        if (search) {
          query = query.or(`title_en.ilike.%${search}%,city_en.ilike.%${search}%,property_code.ilike.%${search}%`)
        }

        // Apply filters
        if (propertyType !== "all") {
          query = query.eq("property_type", propertyType)
        }

        if (listingType !== "all") {
          query = query.eq("listing_type", listingType)
        }

        if (minPrice) {
          const min = Number(minPrice)
          if (listingType === "rent") {
            query = query.gte("price_rent", min)
          } else {
            query = query.gte("price_sale", min)
          }
        }

        if (maxPrice) {
          const max = Number(maxPrice)
          if (listingType === "rent") {
            query = query.lte("price_rent", max)
          } else {
            query = query.lte("price_sale", max)
          }
        }

        if (bedrooms !== "any") {
          query = query.gte("bedrooms", Number(bedrooms))
        }

        if (bathrooms !== "any") {
          query = query.gte("bathrooms", Number(bathrooms))
        }

        // Apply region filter
        if (regionId) {
          query = query.eq("region_id", regionId)
        }

        // Apply sorting
        switch (sort) {
          case "price-low":
            if (listingType === "rent") {
              query = query.order("price_rent", { ascending: true, nullsFirst: false })
            } else {
              query = query.order("price_sale", { ascending: true, nullsFirst: false })
            }
            break
          case "price-high":
            if (listingType === "rent") {
              query = query.order("price_rent", { ascending: false, nullsFirst: false })
            } else {
              query = query.order("price_sale", { ascending: false, nullsFirst: false })
            }
            break
          case "bedrooms":
            query = query.order("bedrooms", { ascending: false, nullsFirst: false })
            break
          case "area":
            query = query.order("area_sqm", { ascending: false, nullsFirst: false })
            break
          case "featured":
            query = query.order("featured", { ascending: false }).order("created_at", { ascending: false })
            break
          default: // newest
            query = query.order("created_at", { ascending: false })
        }

        // Apply pagination
        const from = (page - 1) * perPage
        const to = from + perPage - 1
        query = query.range(from, to)

        const { data, error: queryError, count } = await query

        if (queryError) {
          console.error("Failed to load properties", queryError)
          setError(queryError.message)
        } else {
          let mappedProperties: PropertyListItem[] = (data || []).map((property) => {
            const listingTypeValue = property.listing_type === "rent" ? "rent" : "sale"
            const priceValue =
              listingTypeValue === "rent"
                ? Number(property.price_rent ?? 0)
                : Number(property.price_sale ?? property.price_rent ?? 0)

            return {
              id: property.id,
              title: property.title_en ?? "Untitled Property",
              location: formatLocation(property.city_en, property.region),
              price: Number.isFinite(priceValue) ? priceValue : 0,
              currency: property.currency ?? "EUR",
              bedrooms: property.bedrooms ?? undefined,
              bathrooms: property.bathrooms ?? undefined,
              area: property.area_sqm != null ? Number(property.area_sqm) : undefined,
              imageUrl: property.main_image_url || "/placeholder.svg",
              propertyType: property.property_type ?? "property",
              listingType: listingTypeValue,
              featured: Boolean(property.featured),
            }
          })

          setProperties(mappedProperties)
          setTotalCount(count || 0)
        }
      } catch (err) {
        console.error("Error fetching properties:", err)
        setError(err instanceof Error ? err.message : "Failed to load properties")
      } finally {
        setLoading(false)
      }
    }

    // Only fetch properties if regions are loaded (for region filter to work)
    if (regions.length > 0 || region === "all") {
      fetchProperties()
    }
  }, [search, propertyType, listingType, minPrice, maxPrice, bedrooms, bathrooms, region, sort, page, perPage, regions])

  const totalPages = Math.ceil(totalCount / perPage)

  const handleFilterChange = (filters: any) => {
    updateSearchParams({
      search: filters.search || "",
      type: filters.propertyType || "all",
      listing: filters.listingType || "all",
      minPrice: filters.minPrice || "",
      maxPrice: filters.maxPrice || "",
      bedrooms: filters.bedrooms || "any",
      region: filters.region || "all",
      page: 1, // Reset to first page on filter change
    })
  }

  const handleSortChange = (value: string) => {
    updateSearchParams({ sort: value, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePerPageChange = (value: string) => {
    updateSearchParams({ perPage: Number(value), page: 1 })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      {/* Page Header */}
      <section className="pt-32 pb-12 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-sky-100 text-sky-700 hover:bg-sky-200 border-0">Property Listings</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Find Your Perfect Property</h1>
            <p className="text-lg text-slate-600 text-pretty">
              Browse our extensive collection of premium properties across Greece
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Results */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <PropertyFilters
            onFilterChange={handleFilterChange}
            initialFilters={{
              search,
              propertyType,
              listingType,
              minPrice,
              maxPrice,
              bedrooms,
              region,
            }}
          />

          {/* Results Header */}
          <div className="flex items-center justify-between mt-8 mb-6 flex-wrap gap-4">
            <p className="text-slate-600">
              {loading ? (
                "Loading..."
              ) : (
                <>
                  Showing <span className="font-semibold text-slate-900">{properties.length}</span> of{" "}
                  <span className="font-semibold text-slate-900">{totalCount}</span> properties
                </>
              )}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <SaveSearchDialog filters={{ type: propertyType, priceRange: "all" }} />
              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="bedrooms">Most Bedrooms</SelectItem>
                  <SelectItem value="area">Largest Area</SelectItem>
                  <SelectItem value="featured">Featured First</SelectItem>
                </SelectContent>
              </Select>
              <Select value={String(perPage)} onValueChange={handlePerPageChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 per page</SelectItem>
                  <SelectItem value="24">24 per page</SelectItem>
                  <SelectItem value="48">48 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-slate-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <>
              {/* Properties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property) => (
                  <PropertyCard key={property.id} {...property} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (page <= 3) {
                        pageNum = i + 1
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = page - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          onClick={() => handlePageChange(pageNum)}
                          className={page === pageNum ? "bg-slate-900 text-white hover:bg-slate-800" : ""}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-12 text-center text-slate-600">
              {error
                ? "Unable to display properties at the moment. Please refresh the page or try again later."
                : "No properties match your search criteria. Try adjusting your filters."}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

