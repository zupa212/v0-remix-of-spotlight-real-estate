import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PropertyCard } from "@/components/property-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Building2, TrendingUp, ArrowRight } from "lucide-react"

export default function RegionDetailPage({ params }: { params: { slug: string } }) {
  // Mock region data - in production, fetch from Supabase using params.slug
  const region = {
    slug: params.slug,
    nameEn: "Athens",
    nameGr: "Αθήνα",
    description:
      "Athens, the historic capital of Greece, seamlessly blends ancient heritage with modern urban sophistication. As Europe's oldest capital, it offers a unique real estate market ranging from neoclassical mansions in Kolonaki to contemporary apartments in the revitalized city center. The city's strategic location, excellent infrastructure, and growing economy make it an attractive destination for both residential living and investment opportunities.",
    imageUrl: "/athens-acropolis-cityscape.jpg",
    propertyCount: 156,
    avgPrice: 350000,
    highlights: [
      "Historic city center with UNESCO World Heritage sites",
      "Excellent public transportation and infrastructure",
      "Thriving cultural scene and nightlife",
      "Growing tech and startup ecosystem",
      "Mediterranean climate with mild winters",
      "International schools and universities",
    ],
    neighborhoods: [
      { name: "Kolonaki", description: "Upscale neighborhood with designer boutiques" },
      { name: "Plaka", description: "Historic district at the foot of the Acropolis" },
      { name: "Kifisia", description: "Leafy northern suburb with luxury properties" },
      { name: "Glyfada", description: "Coastal area with beaches and marinas" },
    ],
  }

  const properties = [
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
      id: "7",
      title: "Neoclassical Mansion in Kolonaki",
      location: "Athens, Attica",
      price: 1200000,
      bedrooms: 5,
      bathrooms: 4,
      area: 280,
      imageUrl: "/placeholder.svg?key=mansion",
      propertyType: "house",
      listingType: "sale" as const,
      featured: false,
    },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end overflow-hidden">
        <Image src={region.imageUrl || "/placeholder.svg"} alt={region.nameEn} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />

        <div className="relative z-10 w-full pb-16">
          <div className="w-full px-6 lg:px-8">
            <Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30">
              Region Guide
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">{region.nameEn}</h1>
            <p className="text-2xl text-white/90 mb-6">{region.nameGr}</p>
            <div className="flex flex-wrap gap-6 text-white">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <span>{region.propertyCount} Properties</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span>Avg {formatPrice(region.avgPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* About */}
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">About {region.nameEn}</h2>
                <p className="text-lg text-slate-600 leading-relaxed">{region.description}</p>
              </div>

              {/* Highlights */}
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Key Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {region.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-sky-600" />
                      </div>
                      <p className="text-slate-600">{highlight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Properties */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-slate-900">Properties in {region.nameEn}</h2>
                  <Button variant="outline" asChild>
                    <a href={`/properties?region=${region.slug}`}>
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} {...property} />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Popular Neighborhoods */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Popular Neighborhoods</h3>
                <div className="space-y-4">
                  {region.neighborhoods.map((neighborhood) => (
                    <div key={neighborhood.name} className="pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                      <h4 className="font-semibold text-slate-900 mb-1">{neighborhood.name}</h4>
                      <p className="text-sm text-slate-600">{neighborhood.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-slate-900 text-white rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">Interested in {region.nameEn}?</h3>
                <p className="text-slate-300 mb-6">
                  Get in touch with our local experts to find your perfect property.
                </p>
                <Button asChild className="w-full bg-white text-slate-900 hover:bg-slate-100">
                  <a href="/contact">Contact Us</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
