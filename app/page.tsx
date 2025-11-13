"use client"

import { SmoothScrollProvider } from "@/components/smooth-scroll-provider"
import { VistahavenHero } from "@/components/vistahaven-hero"
import { AnimatedAbout } from "@/components/animated-about"
import { AnimatedTestimonials } from "@/components/animated-testimonials"
import { AnimatedServices } from "@/components/animated-services"
import { AnimatedFeaturedProperties } from "@/components/animated-featured-properties"
import { AnimatedTeam } from "@/components/animated-team"
import { ContactFormSection } from "@/components/contact-form-section"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-white">
        <SiteHeader />
        <VistahavenHero />
        <AnimatedServices />
        <AnimatedFeaturedProperties />
        <AnimatedAbout />
        <AnimatedTestimonials />
        <AnimatedTeam />
        <ContactFormSection />
        <SiteFooter />
      </div>
    </SmoothScrollProvider>
  )
}
