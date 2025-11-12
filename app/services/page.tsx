import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AnimatedServices } from "@/components/animated-services"
import { Metadata } from "next"
import { Building2, Home, TrendingUp, Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Services | Spotlight Real Estate",
  description: "Discover our comprehensive real estate services including property sales, rentals, investment consulting, and property management.",
}

export default function ServicesPage() {
  const services = [
    {
      icon: Home,
      title: "Property Sales",
      description: "Expert guidance through every step of buying your dream property. From luxury villas to modern apartments, we help you find the perfect home.",
    },
    {
      icon: Building2,
      title: "Property Rentals",
      description: "Find your ideal rental property with our extensive portfolio. Short-term and long-term rentals available across Greece's most desirable locations.",
    },
    {
      icon: TrendingUp,
      title: "Investment Consulting",
      description: "Make informed real estate investment decisions with our expert market analysis and strategic advice tailored to your goals.",
    },
    {
      icon: Shield,
      title: "Property Management",
      description: "Comprehensive property management services to protect and enhance your investment. We handle everything from maintenance to tenant relations.",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="w-full px-6 lg:px-8 py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Our Services
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Comprehensive real estate solutions tailored to your needs. From finding your dream home to managing your investment portfolio.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="w-full px-6 lg:px-8 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="p-8 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-100 rounded-xl">
                      <service.icon className="h-6 w-6 text-slate-900" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">
                        {service.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Services Section */}
        <AnimatedServices />
      </main>
      <SiteFooter />
    </div>
  )
}

