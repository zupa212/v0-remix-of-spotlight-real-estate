import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreVertical, Eye, Edit, Trash2 } from "lucide-react"

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
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Properties</h1>
              <p className="text-slate-600">Manage your property listings</p>
            </div>
            <Button asChild>
              <Link href="/admin/properties/new">
                <Plus className="mr-2 h-5 w-5" />
                Add Property
              </Link>
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input placeholder="Search properties..." className="pl-10" />
            </div>
          </div>

          {propertiesError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Unable to load the latest property data. Showing cached results if available.
            </div>
          )}

          {/* Properties Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            {properties.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-mono text-sm">{property.propertyCode}</TableCell>
                      <TableCell className="font-medium">{property.titleEn}</TableCell>
                      <TableCell className="text-slate-600">{property.location}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {property.propertyType}
                        </Badge>
                      </TableCell>
                      <TableCell>{property.displayPrice}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            property.status === "available"
                              ? "bg-green-100 text-green-700"
                              : property.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-700"
                          }
                        >
                          {property.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={property.published ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}
                        >
                          {property.published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/properties/${property.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/properties/${property.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-slate-600">No properties found. Create your first listing to get started.</div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing <span className="font-medium">{properties.length}</span> properties
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
