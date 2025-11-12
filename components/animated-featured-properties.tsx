"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Bed, Bath, Maximize, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

type Property = {
  id: string
  title_en: string
  city_en: string | null
  region: { name_en: string } | null
  bedrooms: number | null
  bathrooms: number | null
  area_sqm: number | null
  price_sale: number | null
  price_rent: number | null
  currency: string
  listing_type: string
  main_image_url: string | null
  property_type: string
}

export function AnimatedFeaturedProperties() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("properties")
          .select(
            `
            id,
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
            main_image_url,
            region:regions(name_en)
          `
          )
          .eq("published", true)
          .eq("featured", true)
          .order("created_at", { ascending: false })
          .limit(6)

        if (error) {
          console.error("Error fetching featured properties:", error)
        } else {
          setProperties(data || [])
        }
      } catch (error) {
        console.error("Error fetching featured properties:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProperties()
  }, [])

  const formatLocation = (city: string | null, region: { name_en: string } | null) => {
    const parts = [city, region?.name_en].filter(Boolean) as string[]
    if (parts.length === 0) return "Greece"
    return parts.join(", ")
  }

  const formatPrice = (property: Property) => {
    const listingType = property.listing_type === "rent" ? "rent" : "sale"
    const priceValue = listingType === "rent" ? property.price_rent : property.price_sale
    if (!priceValue) return "Price on request"
    const currency = property.currency || "EUR"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceValue)
  }

  const getBadgeText = (listingType: string) => {
    return listingType === "rent" ? "For Rent" : "For Sale"
  }

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="w-full px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block px-6 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-700 mb-6"
          >
            Featured Properties
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            DISCOVER HOMES TAILORED TO YOUR
            <br />
            LIFESTYLE AND NEEDS
          </motion.h2>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-slate-200 rounded-3xl mb-6"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + index * 0.15, duration: 0.8 }}
            >
              <Link href={`/properties/${property.id}`} className="group cursor-pointer block">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-6 shadow-lg">
                  <Image
                    src={property.main_image_url || "/placeholder.svg"}
                    alt={property.title_en || "Property"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm text-slate-900 hover:bg-white border-0 px-4 py-2">
                    {getBadgeText(property.listing_type)}
                  </Badge>
                </div>

                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600">{formatLocation(property.city_en, property.region)}</span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4">{property.title_en || "Untitled Property"}</h3>

                <div className="flex items-center gap-6 mb-4 text-slate-600">
                  {property.bedrooms != null && property.bedrooms > 0 && (
                    <div className="flex items-center gap-2">
                      <Bed className="w-5 h-5" />
                      <span>{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathrooms != null && property.bathrooms > 0 && (
                    <div className="flex items-center gap-2">
                      <Bath className="w-5 h-5" />
                      <span>{property.bathrooms}</span>
                    </div>
                  )}
                  {property.area_sqm != null && property.area_sqm > 0 && (
                    <div className="flex items-center gap-2">
                      <Maximize className="w-5 h-5" />
                      <span>{property.area_sqm.toLocaleString()} m²</span>
                    </div>
                  )}
                </div>

                <div className="text-3xl font-bold text-slate-900">{formatPrice(property)}</div>
              </Link>
            </motion.div>
          ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-600 text-lg mb-4">No featured properties available at the moment.</p>
            <Link href="/properties" className="inline-block px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors">
              Browse All Properties
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
