import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PropertyCard } from "@/components/property-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, Languages, Award, MapPin, Calendar } from "lucide-react"

export default function AgentProfilePage({ params }: { params: { id: string } }) {
  // Mock agent data - in production, fetch from Supabase using params.id
  const agent = {
    id: params.id,
    nameEn: "Maria Papadopoulos",
    nameGr: "Μαρία Παπαδοπούλου",
    email: "maria@spotlight.gr",
    phone: "+30 210 123 4567",
    bioEn:
      "Maria is a senior real estate consultant with over 15 years of experience in the Greek luxury property market. She specializes in high-end villas, waterfront properties, and investment consulting across Athens and the Greek islands. Her deep understanding of the local market, combined with her multilingual capabilities and extensive network, makes her the go-to expert for international clients seeking premium properties in Greece.",
    languages: ["English", "Greek", "French", "Italian"],
    specialties: ["Luxury Villas", "Waterfront Properties", "Investment Consulting", "International Clients"],
    propertiesCount: 45,
    yearsExperience: 15,
    location: "Athens, Greece",
    featured: true,
  }

  const agentProperties = [
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
      id: "8",
      title: "Waterfront Penthouse",
      location: "Athens, Attica",
      price: 950000,
      bedrooms: 3,
      bathrooms: 2,
      area: 160,
      imageUrl: "/placeholder.svg?key=waterfront-penthouse",
      propertyType: "apartment",
      listingType: "sale" as const,
      featured: false,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Agent Header */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="relative">
                <div className="h-48 w-48 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <span className="text-6xl font-bold text-slate-600">
                    {agent.nameEn
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                {agent.featured && (
                  <Badge className="absolute -top-2 -right-2 bg-amber-500 hover:bg-amber-600 text-white border-0">
                    Featured Agent
                  </Badge>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">{agent.nameEn}</h1>
                <p className="text-xl text-slate-600 mb-6">{agent.nameGr}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-5 w-5" />
                    <span>{agent.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-5 w-5" />
                    <span>{agent.yearsExperience} Years Experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Languages className="h-5 w-5" />
                    <span>{agent.languages.join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Award className="h-5 w-5" />
                    <span>{agent.propertiesCount} Active Listings</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button size="lg" asChild>
                    <a href={`mailto:${agent.email}`}>
                      <Mail className="mr-2 h-5 w-5" />
                      Email Agent
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href={`tel:${agent.phone}`}>
                      <Phone className="mr-2 h-5 w-5" />
                      {agent.phone}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">About {agent.nameEn.split(" ")[0]}</h2>
                  <p className="text-slate-600 leading-relaxed">{agent.bioEn}</p>
                </CardContent>
              </Card>

              {/* Properties */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Current Listings ({agent.propertiesCount})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {agentProperties.map((property) => (
                    <PropertyCard key={property.id} {...property} />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Specialties */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {agent.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Email</div>
                      <a href={`mailto:${agent.email}`} className="text-slate-900 hover:text-sky-600 transition-colors">
                        {agent.email}
                      </a>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Phone</div>
                      <a href={`tel:${agent.phone}`} className="text-slate-900 hover:text-sky-600 transition-colors">
                        {agent.phone}
                      </a>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Languages</div>
                      <div className="text-slate-900">{agent.languages.join(", ")}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-slate-900 text-white border-slate-900">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3">Ready to Find Your Property?</h3>
                  <p className="text-slate-300 mb-6">
                    Schedule a consultation with {agent.nameEn.split(" ")[0]} today.
                  </p>
                  <Button asChild className="w-full bg-white text-slate-900 hover:bg-slate-100">
                    <a href={`mailto:${agent.email}`}>Get in Touch</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
