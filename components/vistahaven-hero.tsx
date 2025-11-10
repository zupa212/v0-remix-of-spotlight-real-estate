"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Star } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

interface Agent {
  id: string
  name_en: string
  avatar_url: string | null
}

export function VistahavenHero() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [stats, setStats] = useState({
    projects: 200,
    clients: 70,
    value: 10,
  })

  useEffect(() => {
    // Fetch featured agents
    const fetchAgents = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("agents")
        .select("id, name_en, avatar_url")
        .eq("featured", true)
        .limit(4)
      
      if (data) {
        setAgents(data)
      }
    }

    fetchAgents()

    // Fetch stats from properties
    const fetchStats = async () => {
      const supabase = createClient()
      const [propertiesResult, leadsResult] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }),
      ])

      const propertiesCount = propertiesResult.count || 0
      const leadsCount = leadsResult.count || 0

      // Calculate project value (sum of price_sale)
      const { data: properties } = await supabase
        .from("properties")
        .select("price_sale")
        .not("price_sale", "is", null)

      const totalValue = properties?.reduce((sum, p) => sum + (Number(p.price_sale) || 0), 0) || 0
      const valueInMillions = Math.round(totalValue / 1000000)

      setStats({
        projects: propertiesCount,
        clients: leadsCount || 70,
        value: valueInMillions || 10,
      })
    }

    fetchStats()
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-sshdNDePUXAdfJDHoAjd5d7RqCbUxQ.png"
            alt="Luxury modern home at dusk"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
      </div>

      {/* Content Container - Edge to Edge */}
      <div className="relative z-10 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          {/* White Container with Padding and Border - Rounded on Mobile */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl md:rounded-2xl p-6 sm:p-8 md:p-12 lg:p-16 border border-white/30 shadow-xl relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Side - Main Content */}
              <div className="space-y-8">
                {/* Main Headline - Each word on new line */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#333333] leading-[1.1] mb-6"
                  style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.02em" }}
                >
                  FIND YOUR
                  <br />
                  PERFECT HOME
                  <br />
                  TODAY
                </motion.h1>

                {/* Descriptive Text */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-lg md:text-xl text-[#666666] max-w-xl leading-relaxed"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  We provide tailored real estate solutions, guiding you through every step with personalized experiences
                  that meet your unique needs and aspirations.
                </motion.p>

                {/* Explore Properties Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="pt-2"
                >
                  <Button
                    asChild
                    className="bg-white text-[#333333] hover:bg-white/95 border border-[#333333] rounded-lg px-6 py-3 text-base font-medium h-auto shadow-sm"
                  >
                    <a href="/properties" className="flex items-center gap-2">
                      Explore Properties
                      <ArrowUpRight className="h-5 w-5" />
                    </a>
                  </Button>
                </motion.div>

                {/* Statistics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="flex flex-wrap gap-8 md:gap-12 pt-6"
                >
                  <div>
                    <div className="text-4xl md:text-5xl font-bold text-[#333333] mb-1" style={{ fontFamily: "var(--font-sans)" }}>
                      {stats.projects}+
                    </div>
                    <div className="text-sm md:text-base text-[#666666] font-medium" style={{ fontFamily: "var(--font-sans)" }}>
                      Projects Complete
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-bold text-[#333333] mb-1" style={{ fontFamily: "var(--font-sans)" }}>
                      {stats.clients}+
                    </div>
                    <div className="text-sm md:text-base text-[#666666] font-medium" style={{ fontFamily: "var(--font-sans)" }}>
                      Happy Clients
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-bold text-[#333333] mb-1" style={{ fontFamily: "var(--font-sans)" }}>
                      ${stats.value}M+
                    </div>
                    <div className="text-sm md:text-base text-[#666666] font-medium" style={{ fontFamily: "var(--font-sans)" }}>
                      Project Value
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Side - Image INSIDE the border with Zoom Out Animation */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="hidden lg:block relative aspect-[4/3] rounded-xl overflow-hidden"
              >
                <motion.div
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.8 }}
                  className="absolute inset-0"
                >
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-sshdNDePUXAdfJDHoAjd5d7RqCbUxQ.png"
                    alt="Luxury modern home at dusk"
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Featured Agents Card - OUTSIDE the border, Bottom Right */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="absolute bottom-8 right-4 lg:bottom-12 lg:right-12 bg-white/95 backdrop-blur-sm rounded-xl p-4 md:p-5 shadow-xl border border-white/20 z-20"
        >
          <div className="flex items-center gap-3 md:gap-4">
            {/* Agent Profile Pictures */}
            <div className="flex -space-x-2 md:-space-x-3">
              {agents.length > 0 ? (
                agents.slice(0, 4).map((agent, index) => (
                  <div
                    key={agent.id}
                    className="relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white overflow-hidden bg-[#F0F0F0]"
                    style={{ zIndex: 4 - index }}
                  >
                    {agent.avatar_url ? (
                      <Image
                        src={agent.avatar_url}
                        alt={agent.name_en}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#E0E0E0] text-[#666666] text-xs font-medium">
                        {agent.name_en.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                // Fallback placeholder avatars
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white overflow-hidden bg-[#F0F0F0]"
                    style={{ zIndex: 4 - index }}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-[#E0E0E0] text-[#666666] text-xs font-medium">
                      A
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Text Content */}
            <div>
              <div className="text-xs md:text-sm font-semibold text-[#333333] mb-1" style={{ fontFamily: "var(--font-sans)" }}>
                {agents.length > 0 ? `${agents.length}+` : "10+"} Featured Agents
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 md:h-4 md:w-4 fill-[#FFD700] text-[#FFD700]" />
                ))}
                <span className="text-xs md:text-sm font-medium text-[#333333] ml-1" style={{ fontFamily: "var(--font-sans)" }}>
                  5/5
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

