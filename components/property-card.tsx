"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Maximize, MapPin } from "lucide-react"
import Image from "next/image"
import { trackClick } from "@/lib/utils/analytics"

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

  const handleClick = () => {
    trackClick({
      element_type: "property_card",
      element_id: id,
      property_id: id,
      url: typeof window !== "undefined" ? window.location.href : "",
    })
  }

  return (
    <Link href={`/properties/${id}`} onClick={handleClick}>
      <Card className="property-card group overflow-hidden border-[#E0E0E0]">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F8F8F8]">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {featured && (
            <Badge className="absolute top-4 left-4 bg-[#E50000] hover:bg-[#CC0000] text-white border-0 font-medium">
              Featured
            </Badge>
          )}
          <Badge className="absolute top-4 right-4 bg-white/95 text-[#333333] hover:bg-white border-0 font-medium">
            For {listingType === "sale" ? "Sale" : "Rent"}
          </Badge>
        </div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="font-bold text-lg text-[#333333] group-hover:text-[#E50000] transition-colors line-clamp-1">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-[#666666] mb-4">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{location}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-[#666666] mb-4 pb-4 border-b border-[#E0E0E0]">
            {bedrooms !== undefined && bedrooms !== null && (
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4" />
                <span>{bedrooms}</span>
              </div>
            )}
            {bathrooms !== undefined && bathrooms !== null && (
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" />
                <span>{bathrooms}</span>
              </div>
            )}
            {area !== undefined && area !== null && (
              <div className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4" />
                <span>{area} m²</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-[#333333]">{formatPrice(price)}</p>
            <Badge variant="secondary" className="capitalize bg-[#F0F0F0] text-[#333333] border-0">
              {propertyType}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
