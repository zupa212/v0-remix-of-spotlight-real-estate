import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PropertyCard } from "@/components/property-card"
import { PropertyFilters } from "@/components/property-filters"
import { SaveSearchDialog } from "@/components/save-search-dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function PropertiesPage() {
  // Mock properties data - in production, this would come from Supabase
  const properties = [
    {
      id: "1",
      title: "Luxury Villa with Sea View",
      location: "Mykonos, Cyclades",
      price: 2500000,
      bedrooms: 5,
      bathrooms: 4,
      area: 350,
      imageUrl: "/luxury-villa-sea-view-mykonos.jpg",
      propertyType: "villa",
      listingType: "sale" as const,
      featured: true,
    },
    {
      id: "2",
      title: "Modern Apartment in City Center",
      location: "Athens, Attica",
      price: 450000,
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      imageUrl: "/modern-apartment-athens-city.jpg",
      propertyType: "apartment",
      listingType: "sale" as const,
      featured: true,
    },
    {
      id: "3",
      title: "Beachfront House",
      location: "Santorini, Cyclades",
      price: 1800000,
      bedrooms: 4,
      bathrooms: 3,
      area: 280,
      imageUrl: "/beachfront-house-santorini.jpg",
      propertyType: "house",
      listingType: "sale" as const,
      featured: true,
    },
    {
      id: "4",
      title: "Penthouse with Acropolis View",
      location: "Athens, Attica",
      price: 850000,
      bedrooms: 4,
      bathrooms: 3,
      area: 180,
      imageUrl: "/placeholder.svg?key=penthouse",
      propertyType: "apartment",
      listingType: "sale" as const,
      featured: false,
    },
    {
      id: "5",
      title: "Traditional Stone House",
      location: "Crete",
      price: 320000,
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
      imageUrl: "/placeholder.svg?key=stone-house",
      propertyType: "house",
      listingType: "sale" as const,
      featured: false,
    },
    {
      id: "6",
      title: "Waterfront Apartment",
      location: "Thessaloniki",
      price: 2800,
      bedrooms: 2,
      bathrooms: 1,
      area: 85,
      imageUrl: "/placeholder.svg?key=waterfront",
      propertyType: "apartment",
      listingType: "rent" as const,
      featured: false,
    },
  ]

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
          <PropertyFilters />

          {/* Results Header */}
          <div className="flex items-center justify-between mt-8 mb-6">
            <p className="text-slate-600">
              Showing <span className="font-semibold text-slate-900">{properties.length}</span> properties
            </p>
            <div className="flex items-center gap-3">
              <SaveSearchDialog filters={{ type: "all", priceRange: "all" }} />
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="bedrooms">Most Bedrooms</SelectItem>
                  <SelectItem value="area">Largest Area</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center gap-2">
            <Button variant="outline" disabled>
              Previous
            </Button>
            <Button variant="outline" className="bg-slate-900 text-white hover:bg-slate-800 hover:text-white">
              1
            </Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
