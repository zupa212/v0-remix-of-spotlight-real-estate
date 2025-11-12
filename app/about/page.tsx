import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AnimatedAbout } from "@/components/animated-about"
import { AnimatedTeam } from "@/components/animated-team"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us | Spotlight Real Estate",
  description: "Learn about Spotlight Real Estate, your trusted partner in luxury real estate across Greece.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="pt-20">
        <AnimatedAbout />
        <AnimatedTeam />
      </main>
      <SiteFooter />
    </div>
  )
}

