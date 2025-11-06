import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Maximize, MapPin } from "lucide-react"
import Image from "next/image"

interface PropertyCardProps {
  id: string
  title: string
  location: string
  price: number
  currency?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  imageUrl: string
  propertyType: string
  listingType: "sale" | "rent"
  featured?: boolean
}

export function PropertyCard({
  id,
  title,
  location,
  price,
  currency = "EUR",
  bedrooms,
  bathrooms,
  area,
  imageUrl,
  propertyType,
  listingType,
  featured,
}: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Link href={`/properties/${id}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {featured && (
            <Badge className="absolute top-4 left-4 bg-amber-500 hover:bg-amber-600 text-white border-0">
              Featured
            </Badge>
          )}
          <Badge className="absolute top-4 right-4 bg-white/95 text-slate-900 hover:bg-white border-0">
            For {listingType === "sale" ? "Sale" : "Rent"}
          </Badge>
        </div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="font-semibold text-lg text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-4">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{location}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
            {bedrooms && (
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4" />
                <span>{bedrooms}</span>
              </div>
            )}
            {bathrooms && (
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" />
                <span>{bathrooms}</span>
              </div>
            )}
            {area && (
              <div className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4" />
                <span>{area} m²</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-slate-900">{formatPrice(price)}</p>
            <Badge variant="secondary" className="capitalize">
              {propertyType}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
