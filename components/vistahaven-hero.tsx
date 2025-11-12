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
      if (typeof window === 'undefined') return
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
      if (typeof window === 'undefined') return
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
    <section className="relative w-full overflow-hidden bg-white">
      {/* White Background - Clean and Simple */}
      <div className="absolute inset-0 w-full bg-white" />

      {/* Content Container - Edge to Edge with Rectangular Layout */}
      <div className="relative z-10 w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 md:pb-20">
          
          {/* Main Content Card - Rectangular with Image Background */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative rounded-2xl sm:rounded-3xl md:rounded-[2rem] p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 border border-gray-100 shadow-2xl overflow-hidden aspect-[16/9] sm:aspect-[16/8] md:aspect-[16/7] lg:aspect-[16/6.5]"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Background Image - Full Slide */}
            <motion.div
              initial={{ scale: 1.15, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 2, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0"
            >
              <Image
                src="/home walppaper.png"
                alt="Luxury modern home with mountain backdrop at dusk"
                fill
                className="object-cover object-center"
                priority
                quality={95}
                sizes="100vw"
              />
            </motion.div>
            
            
            {/* Content - Left Side with Professional Typography - Stretched Layout */}
            <div className="relative z-10 h-full flex flex-col justify-center max-w-2xl lg:max-w-2xl xl:max-w-3xl">
              <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-7">
                
                {/* Main Headline - Professional Typography - Compact */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  className="space-y-0"
                >
                  <h1 
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold text-white leading-[1.1] tracking-[-0.02em]"
                    style={{ 
                      fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      lineHeight: '1.1',
                    }}
                  >
                    <span className="block">FIND YOUR</span>
                    <span className="block mt-0 sm:mt-0.5">PERFECT HOME</span>
                    <span className="block mt-0 sm:mt-0.5">TODAY</span>
                  </h1>
                </motion.div>

                {/* Descriptive Text - Professional Typography - Compact */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
                  className="text-base sm:text-lg md:text-xl lg:text-[1.25rem] text-white max-w-xl leading-[1.5] font-normal"
                  style={{ 
                    fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                    letterSpacing: '-0.005em',
                    lineHeight: '1.5',
                  }}
                >
                  We provide tailored real estate solutions, guiding you through every step with personalized experiences that meet your unique needs and aspirations.
                </motion.p>

                {/* CTA Button - Professional White Button - Compact */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
                  className="pt-0.5"
                >
                  <div className="relative group inline-block">
                    <Button
                      asChild
                      className="relative bg-white hover:bg-white/95 text-[#1a1a1a] border-2 border-[#1a1a1a] rounded-full px-7 sm:px-9 md:px-11 lg:px-12 py-3.5 sm:py-4 md:py-4.5 lg:py-5 text-base sm:text-lg md:text-xl font-semibold h-auto shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden z-10"
                      style={{
                        fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                        letterSpacing: '-0.01em',
                        fontWeight: 600,
                      }}
                    >
                      <a href="/properties" className="flex items-center gap-2.5 sm:gap-3 relative z-10">
                        <span>Explore Properties</span>
                        <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#1a1a1a] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    </Button>
                  </div>
                </motion.div>

                {/* Statistics - Professional Layout - Horizontal Compact */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex flex-wrap gap-8 sm:gap-10 md:gap-12 lg:gap-14 xl:gap-16 pt-3 sm:pt-4 md:pt-5"
                >
                  {/* Stat 1 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.3, duration: 0.6 }}
                    className="space-y-0.5"
                  >
                    <div 
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1]"
                      style={{ 
                        fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                        fontWeight: 700,
                        letterSpacing: '-0.03em',
                      }}
                    >
                      {stats.projects}+
                    </div>
                    <div 
                      className="text-xs sm:text-sm md:text-base text-white font-medium leading-[1.2]"
                      style={{ 
                        fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                        letterSpacing: '0em',
                        fontWeight: 500,
                      }}
                    >
                      Projects Complete
                    </div>
                  </motion.div>

                  {/* Stat 2 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                    className="space-y-0.5"
                  >
                    <div 
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1]"
                      style={{ 
                        fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                        fontWeight: 700,
                        letterSpacing: '-0.03em',
                      }}
                    >
                      {stats.clients}+
                    </div>
                    <div 
                      className="text-xs sm:text-sm md:text-base text-white font-medium leading-[1.2]"
                      style={{ 
                        fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                        letterSpacing: '0em',
                        fontWeight: 500,
                      }}
                    >
                      Happy Clients
                    </div>
                  </motion.div>

                  {/* Stat 3 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                    className="space-y-0.5"
                  >
                    <div 
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1]"
                      style={{ 
                        fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                        fontWeight: 700,
                        letterSpacing: '-0.03em',
                      }}
                    >
                      ${stats.value}M+
                    </div>
                    <div 
                      className="text-xs sm:text-sm md:text-base text-white font-medium leading-[1.2]"
                      style={{ 
                        fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                        letterSpacing: '0em',
                        fontWeight: 500,
                      }}
                    >
                      Project Value
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Featured Agents Card - Bottom Right, Refined Design */}
        <motion.div
          initial={{ opacity: 0, x: 50, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 1.2, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute bottom-[8%] sm:bottom-[7.5%] md:bottom-[7%] lg:bottom-[6.5%] right-4 sm:right-6 md:right-8 lg:right-12 xl:right-16 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 shadow-xl border border-gray-100 z-20 max-w-[280px] sm:max-w-[320px]"
          style={{
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Agent Profile Pictures - Refined Stack */}
            <div className="flex -space-x-3 sm:-space-x-4 flex-shrink-0">
              {agents.length > 0 ? (
                agents.slice(0, 4).map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
                    className="relative w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-[3px] border-white overflow-hidden bg-[#f0f0f0] shadow-md"
                    style={{ zIndex: 4 - index }}
                  >
                    {agent.avatar_url ? (
                      <Image
                        src={agent.avatar_url}
                        alt={agent.name_en}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 44px, 56px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#e0e0e0] to-[#d0d0d0] text-[#666666] text-sm sm:text-base font-semibold">
                        {agent.name_en.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                // Fallback placeholder avatars
                Array.from({ length: 4 }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
                    className="relative w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-[3px] border-white overflow-hidden bg-[#f0f0f0] shadow-md"
                    style={{ zIndex: 4 - index }}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#e0e0e0] to-[#d0d0d0] text-[#666666] text-sm sm:text-base font-semibold">
                      A
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Text Content - Perfect Typography */}
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.6 }}
                className="text-sm sm:text-base md:text-lg font-bold text-[#1a1a1a] mb-2 leading-tight"
                style={{ 
                  fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                }}
              >
                {agents.length > 0 ? `${agents.length}+` : "10+"} Featured Agents
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7, duration: 0.6 }}
                className="flex items-center gap-1"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-[#FFD700] text-[#FFD700] drop-shadow-sm" 
                  />
                ))}
                <span 
                  className="text-xs sm:text-sm md:text-base font-semibold text-[#1a1a1a] ml-1.5"
                  style={{ 
                    fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                  }}
                >
                  5/5
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
