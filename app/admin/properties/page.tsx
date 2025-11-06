import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreVertical, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

export default async function AdminPropertiesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/admin/login")
  }

  // Mock properties data - in production, fetch from Supabase
  const properties = [
    {
      id: "1",
      propertyCode: "SP25-0001",
      titleEn: "Luxury Villa with Sea View",
      location: "Mykonos, Cyclades",
      propertyType: "villa",
      listingType: "sale",
      priceSale: 2500000,
      status: "available",
      published: true,
      createdAt: "2025-01-15",
    },
    {
      id: "2",
      propertyCode: "SP25-0002",
      titleEn: "Modern Apartment in City Center",
      location: "Athens, Attica",
      propertyType: "apartment",
      listingType: "sale",
      priceSale: 450000,
      status: "available",
      published: true,
      createdAt: "2025-01-14",
    },
    {
      id: "3",
      propertyCode: "SP25-0003",
      titleEn: "Beachfront House",
      location: "Santorini, Cyclades",
      propertyType: "house",
      listingType: "sale",
      priceSale: 1800000,
      status: "pending",
      published: true,
      createdAt: "2025-01-13",
    },
    {
      id: "4",
      propertyCode: "SP25-0004",
      titleEn: "Waterfront Apartment",
      location: "Thessaloniki",
      propertyType: "apartment",
      listingType: "rent",
      priceRent: 2800,
      status: "available",
      published: false,
      createdAt: "2025-01-12",
    },
  ]

  const formatPrice = (price: number, currency = "EUR") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

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

          {/* Properties Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
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
                    <TableCell>
                      {property.listingType === "sale"
                        ? formatPrice(property.priceSale!)
                        : `${formatPrice(property.priceRent!)}/mo`}
                    </TableCell>
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
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing <span className="font-medium">1-{properties.length}</span> of{" "}
              <span className="font-medium">{properties.length}</span> properties
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
