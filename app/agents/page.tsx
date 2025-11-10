import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, Phone, Languages, Award } from "lucide-react"

export default function AgentsPage() {
  const agents = [
    {
      id: "1",
      nameEn: "Maria Papadopoulos",
      nameGr: "Μαρία Παπαδοπούλου",
      email: "maria@spotlight.gr",
      phone: "+30 210 123 4567",
      bioEn:
        "Senior real estate consultant with 15+ years of experience in luxury properties across Athens and the Greek islands.",
      languages: ["English", "Greek", "French"],
      specialties: ["Luxury Villas", "Waterfront Properties", "Investment Consulting"],
      propertiesCount: 45,
      featured: true,
    },
    {
      id: "2",
      nameEn: "Dimitris Konstantinou",
      nameGr: "Δημήτρης Κωνσταντίνου",
      email: "dimitris@spotlight.gr",
      phone: "+30 210 123 4568",
      bioEn: "Specializing in commercial real estate and investment properties in Athens metropolitan area.",
      languages: ["English", "Greek", "German"],
      specialties: ["Commercial Properties", "Office Spaces", "Investment Analysis"],
      propertiesCount: 38,
      featured: true,
    },
    {
      id: "3",
      nameEn: "Elena Georgiou",
      nameGr: "Έλενα Γεωργίου",
      email: "elena@spotlight.gr",
      phone: "+30 210 123 4569",
      bioEn: "Island property expert with deep knowledge of Cyclades and Ionian islands real estate markets.",
      languages: ["English", "Greek", "Italian"],
      specialties: ["Island Properties", "Vacation Homes", "Rental Management"],
      propertiesCount: 52,
      featured: true,
    },
    {
      id: "4",
      nameEn: "Nikos Alexandrou",
      nameGr: "Νίκος Αλεξάνδρου",
      email: "nikos@spotlight.gr",
      phone: "+30 210 123 4570",
      bioEn: "Residential property specialist focusing on family homes and apartments in Athens suburbs.",
      languages: ["English", "Greek"],
      specialties: ["Residential Properties", "Family Homes", "First-Time Buyers"],
      propertiesCount: 31,
      featured: false,
    },
    {
      id: "5",
      nameEn: "Sofia Nikolaou",
      nameGr: "Σοφία Νικολάου",
      email: "sofia@spotlight.gr",
      phone: "+30 210 123 4571",
      bioEn: "New development specialist with expertise in off-plan properties and construction projects.",
      languages: ["English", "Greek", "Spanish"],
      specialties: ["New Developments", "Off-Plan Properties", "Construction Consulting"],
      propertiesCount: 28,
      featured: false,
    },
    {
      id: "6",
      nameEn: "Yannis Petrou",
      nameGr: "Γιάννης Πέτρου",
      email: "yannis@spotlight.gr",
      phone: "+30 210 123 4572",
      bioEn: "Luxury property consultant specializing in high-end estates and exclusive listings.",
      languages: ["English", "Greek", "Russian"],
      specialties: ["Luxury Estates", "Exclusive Listings", "International Clients"],
      propertiesCount: 41,
      featured: false,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      {/* Page Header */}
      <section className="pt-32 pb-12 bg-white border-b border-slate-200">
        <div className="w-full px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-sky-100 text-sky-700 hover:bg-sky-200 border-0">Our Team</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Meet Our Expert Agents</h1>
            <p className="text-lg text-slate-600 text-pretty">
              Our multilingual team of experienced professionals is dedicated to helping you find your perfect property
              in Greece
            </p>
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="py-16">
        <div className="w-full px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Featured Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents
              .filter((agent) => agent.featured)
              .map((agent) => (
                <Card key={agent.id} className="overflow-hidden hover:shadow-xl transition-shadow border-slate-200">
                  <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <div className="h-32 w-32 rounded-full bg-slate-300 flex items-center justify-center">
                      <span className="text-4xl font-bold text-slate-600">
                        {agent.nameEn
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <Badge className="absolute top-4 right-4 bg-amber-500 hover:bg-amber-600 text-white border-0">
                      Featured
                    </Badge>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{agent.nameEn}</h3>
                      <p className="text-sm text-slate-600">{agent.nameGr}</p>
                    </div>

                    <p className="text-slate-600 leading-relaxed line-clamp-2">{agent.bioEn}</p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Languages className="h-4 w-4" />
                        <span>{agent.languages.join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Award className="h-4 w-4" />
                        <span>{agent.propertiesCount} Active Listings</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {agent.specialties.slice(0, 2).map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent" asChild>
                        <a href={`tel:${agent.phone}`}>
                          <Phone className="h-4 w-4" />
                          {agent.phone}
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent" asChild>
                        <a href={`mailto:${agent.email}`}>
                          <Mail className="h-4 w-4" />
                          {agent.email}
                        </a>
                      </Button>
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/agents/${agent.id}`}>View Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* All Agents */}
      <section className="py-16 bg-white">
        <div className="w-full px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">All Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents
              .filter((agent) => !agent.featured)
              .map((agent) => (
                <Card key={agent.id} className="overflow-hidden hover:shadow-xl transition-shadow border-slate-200">
                  <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <div className="h-32 w-32 rounded-full bg-slate-300 flex items-center justify-center">
                      <span className="text-4xl font-bold text-slate-600">
                        {agent.nameEn
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{agent.nameEn}</h3>
                      <p className="text-sm text-slate-600">{agent.nameGr}</p>
                    </div>

                    <p className="text-slate-600 leading-relaxed line-clamp-2">{agent.bioEn}</p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Languages className="h-4 w-4" />
                        <span>{agent.languages.join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Award className="h-4 w-4" />
                        <span>{agent.propertiesCount} Active Listings</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {agent.specialties.slice(0, 2).map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent" asChild>
                        <a href={`tel:${agent.phone}`}>
                          <Phone className="h-4 w-4" />
                          {agent.phone}
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent" asChild>
                        <a href={`mailto:${agent.email}`}>
                          <Mail className="h-4 w-4" />
                          {agent.email}
                        </a>
                      </Button>
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/agents/${agent.id}`}>View Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
