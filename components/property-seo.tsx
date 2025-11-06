import type { Metadata } from "next"

type PropertySEOProps = {
  property: {
    property_code: string
    title: string
    description: string | null
    price: number
    currency: string
    type: string
    category: string
    city: string
    region: string
    bedrooms: number | null
    bathrooms: number | null
    area_sqm: number | null
    hero_image: string | null
  }
}

export function generatePropertyMetadata(property: PropertySEOProps["property"]): Metadata {
  const title = `${property.title} - ${property.city} | Spotlight Real Estate`
  const description =
    property.description ||
    `${property.type} for ${property.category} in ${property.city}. ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, ${property.area_sqm}m². Price: €${property.price.toLocaleString()}`
  const url = `https://spotlight.gr/properties/${property.property_code}`
  const imageUrl = property.hero_image || "/placeholder.svg?height=630&width=1200"

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Spotlight Real Estate",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  }
}

export function PropertyJSONLD({ property }: PropertySEOProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: `https://spotlight.gr/properties/${property.property_code}`,
    image: property.hero_image,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.currency,
      availability: "https://schema.org/InStock",
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: property.city,
      addressRegion: property.region,
      addressCountry: "GR",
    },
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.area_sqm,
      unitCode: "MTK",
    },
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}
