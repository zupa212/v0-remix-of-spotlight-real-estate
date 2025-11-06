"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Bed, Bath, Maximize, MapPin } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

const properties = [
  {
    id: 1,
    name: "The One",
    location: "Bel Air, LA",
    bedrooms: 6,
    bathrooms: 4,
    sqft: 2780,
    price: 690000,
    image: "/luxury-modern-home-dark-wood.jpg",
    badge: "For Investment",
  },
  {
    id: 2,
    name: "Billionaire Mansion",
    location: "Bel Air, LA",
    bedrooms: 5,
    bathrooms: 3,
    sqft: 3800,
    price: 500000,
    image: "/luxury-mansion-pool.png",
    badge: "For Sell",
  },
  {
    id: 3,
    name: "The Beverly House",
    location: "Beverly Hills, CA",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1500,
    price: 290000,
    image: "/modern-concrete-house-with-pool.jpg",
    badge: "For Rent",
  },
]

export function AnimatedFeaturedProperties() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="container mx-auto px-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + index * 0.15, duration: 0.8 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-6 shadow-lg">
                <Image
                  src={property.image || "/placeholder.svg"}
                  alt={property.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm text-slate-900 hover:bg-white border-0 px-4 py-2">
                  {property.badge}
                </Badge>
              </div>

              <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-600">{property.location}</span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-4">{property.name}</h3>

              <div className="flex items-center gap-6 mb-4 text-slate-600">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5" />
                  <span>{property.bedrooms}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5" />
                  <span>{property.bathrooms}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize className="w-5 h-5" />
                  <span>{property.sqft.toLocaleString()} sq.ft</span>
                </div>
              </div>

              <div className="text-3xl font-bold text-slate-900">$ {property.price.toLocaleString()}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
