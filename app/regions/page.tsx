import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Building2, TrendingUp } from "lucide-react"

export default function RegionsPage() {
  const regions = [
    {
      slug: "athens",
      nameEn: "Athens",
      nameGr: "Αθήνα",
      description:
        "Greece's vibrant capital, blending ancient history with modern urban living. Prime real estate opportunities in prestigious neighborhoods.",
      imageUrl: "/athens-acropolis-cityscape.jpg",
      propertyCount: 156,
      avgPrice: 350000,
      featured: true,
    },
    {
      slug: "mykonos",
      nameEn: "Mykonos",
      nameGr: "Μύκονος",
      description:
        "Iconic Cycladic island known for luxury villas, stunning beaches, and cosmopolitan lifestyle. A premier destination for high-end properties.",
      imageUrl: "/mykonos-windmills-island.jpg",
      propertyCount: 89,
      avgPrice: 1200000,
      featured: true,
    },
    {
      slug: "santorini",
      nameEn: "Santorini",
      nameGr: "Σαντορίνη",
      description:
        "World-famous for breathtaking sunsets and white-washed architecture. Exclusive properties with unparalleled Aegean Sea views.",
      imageUrl: "/santorini-white-houses-blue-domes.png",
      propertyCount: 124,
      avgPrice: 950000,
      featured: true,
    },
    {
      slug: "thessaloniki",
      nameEn: "Thessaloniki",
      nameGr: "Θεσσαλονίκη",
      description:
        "Greece's cultural capital and second-largest city. Waterfront properties and historic neighborhoods with excellent investment potential.",
      imageUrl: "/thessaloniki-waterfront-city.jpg",
      propertyCount: 98,
      avgPrice: 280000,
      featured: false,
    },
    {
      slug: "crete",
      nameEn: "Crete",
      nameGr: "Κρήτη",
      description:
        "Greece's largest island offering diverse landscapes from beaches to mountains. Traditional villages and modern coastal developments.",
      imageUrl: "/placeholder.svg?key=crete",
      propertyCount: 142,
      avgPrice: 420000,
      featured: false,
    },
    {
      slug: "corfu",
      nameEn: "Corfu",
      nameGr: "Κέρκυρα",
      description:
        "Lush green island in the Ionian Sea. Venetian architecture, pristine beaches, and luxury estates in a Mediterranean paradise.",
      imageUrl: "/placeholder.svg?key=corfu",
      propertyCount: 67,
      avgPrice: 680000,
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
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      {/* Page Header */}
      <section className="pt-32 pb-12 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-sky-100 text-sky-700 hover:bg-sky-200 border-0">Explore Locations</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Discover Greece's Premier Regions</h1>
            <p className="text-lg text-slate-600 text-pretty">
              From cosmopolitan cities to idyllic islands, find your perfect location across Greece's most sought-after
              destinations
            </p>
          </div>
        </div>
      </section>

      {/* Featured Regions */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Featured Regions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regions
              .filter((region) => region.featured)
              .map((region) => (
                <Link key={region.slug} href={`/regions/${region.slug}`} className="group">
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={region.imageUrl || "/placeholder.svg"}
                        alt={region.nameEn}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                      <Badge className="absolute top-4 right-4 bg-amber-500 hover:bg-amber-600 text-white border-0">
                        Featured
                      </Badge>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-3xl font-bold text-white mb-1">{region.nameEn}</h3>
                        <p className="text-white/90 text-sm">{region.nameGr}</p>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <p className="text-slate-600 leading-relaxed line-clamp-2">{region.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Building2 className="h-4 w-4" />
                          <span>{region.propertyCount} Properties</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <TrendingUp className="h-4 w-4" />
                          <span>Avg {formatPrice(region.avgPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* All Regions */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">All Regions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regions
              .filter((region) => !region.featured)
              .map((region) => (
                <Link key={region.slug} href={`/regions/${region.slug}`} className="group">
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={region.imageUrl || "/placeholder.svg"}
                        alt={region.nameEn}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-3xl font-bold text-white mb-1">{region.nameEn}</h3>
                        <p className="text-white/90 text-sm">{region.nameGr}</p>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <p className="text-slate-600 leading-relaxed line-clamp-2">{region.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Building2 className="h-4 w-4" />
                          <span>{region.propertyCount} Properties</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <TrendingUp className="h-4 w-4" />
                          <span>Avg {formatPrice(region.avgPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
