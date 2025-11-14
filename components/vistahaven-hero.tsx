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
    <section className="relative w-full overflow-hidden bg-gray-50">
      {/* Content Container - Edge to Edge with Card Layout for Desktop */}
      <div className="relative z-10 w-full">
        <div className="w-full px-6 md:px-8 lg:px-10 xl:px-12 pt-24 md:pt-28 lg:pt-32 xl:pt-36 2xl:pt-40 pb-12 md:pb-16 lg:pb-20 xl:pb-24 2xl:pb-28">
          
          {/* Main Content Card - Rectangular with Image Background */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative rounded-2xl md:rounded-3xl lg:rounded-[2rem] p-8 md:p-10 lg:p-12 xl:p-16 2xl:p-20 shadow-2xl overflow-hidden min-h-[1000px] md:min-h-[550px] lg:min-h-[700px] xl:min-h-[850px] 2xl:min-h-[950px] bg-white"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
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
            
            {/* Content - Left Side with Professional Typography */}
            <div className="relative z-10 h-full flex flex-col justify-center max-w-2xl lg:max-w-2xl xl:max-w-3xl pl-0 md:pl-4 lg:pl-6 xl:pl-8">
              <div className="space-y-5 md:space-y-6 lg:space-y-7 xl:space-y-8">
                
                {/* Main Headline */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  className="space-y-0"
                >
                  <h1 
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-[5.5rem] font-bold text-white leading-[1.1] tracking-[-0.02em] drop-shadow-lg"
                    style={{ 
                      fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      lineHeight: '1.1',
                    }}
                  >
                    <span className="block">FIND YOUR</span>
                    <span className="block mt-0.5 sm:mt-1">PERFECT HOME</span>
                    <span className="block mt-0.5 sm:mt-1">TODAY</span>
                  </h1>
                </motion.div>

                {/* Descriptive Text */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
                  className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-[1.25rem] text-white max-w-full sm:max-w-lg md:max-w-xl leading-[1.5] font-normal drop-shadow-md"
                  style={{ 
                    fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                    letterSpacing: '-0.005em',
                    lineHeight: '1.5',
                  }}
                >
                  We provide tailored real estate solutions, guiding you through every step with personalized experiences that meet your unique needs and aspirations.
                </motion.p>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
                  className="pt-1 sm:pt-2"
                >
                  <div className="relative group inline-block w-full sm:w-auto">
                    <Button
                      asChild
                      className="relative bg-white hover:bg-white/95 text-[#1a1a1a] border-2 border-[#1a1a1a] rounded-full px-5 sm:px-7 md:px-9 lg:px-11 xl:px-12 py-2.5 sm:py-3 md:py-3.5 lg:py-4 xl:py-5 text-sm sm:text-base md:text-lg lg:text-xl font-semibold h-auto shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden z-10 w-full sm:w-auto justify-center"
                      style={{
                        fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                        letterSpacing: '-0.01em',
                        fontWeight: 600,
                      }}
                    >
                      <a href="/properties" className="flex items-center gap-2 sm:gap-2.5 md:gap-3 relative z-10 justify-center">
                        <span>Explore Properties</span>
                        <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-[#1a1a1a] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    </Button>
                  </div>
                </motion.div>

                {/* Statistics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex flex-wrap gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 pt-2 sm:pt-3 md:pt-4"
                >
                  {/* Stat 1 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.3, duration: 0.6 }}
                    className="space-y-0.5"
                  >
                    <div 
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white leading-[1] drop-shadow-md"
                      style={{ 
                        fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                        fontWeight: 700,
                        letterSpacing: '-0.03em',
                      }}
                    >
                      {stats.projects}+
                    </div>
                    <div 
                      className="text-[10px] sm:text-xs md:text-sm lg:text-base text-white font-medium leading-[1.2] drop-shadow-sm"
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
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white leading-[1] drop-shadow-md"
                      style={{ 
                        fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                        fontWeight: 700,
                        letterSpacing: '-0.03em',
                      }}
                    >
                      {stats.clients}+
                    </div>
                    <div 
                      className="text-[10px] sm:text-xs md:text-sm lg:text-base text-white font-medium leading-[1.2] drop-shadow-sm"
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
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white leading-[1] drop-shadow-md"
                      style={{ 
                        fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                        fontWeight: 700,
                        letterSpacing: '-0.03em',
                      }}
                    >
                      ${stats.value}M+
                    </div>
                    <div 
                      className="text-[10px] sm:text-xs md:text-sm lg:text-base text-white font-medium leading-[1.2] drop-shadow-sm"
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

        {/* Featured Agents Card - Bottom Right */}
        <motion.div
          initial={{ opacity: 0, x: 50, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 1.2, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute bottom-8 md:bottom-10 lg:bottom-12 xl:bottom-14 right-6 md:right-8 lg:right-10 xl:right-12 2xl:right-16 bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 lg:p-7 xl:p-8 shadow-xl z-20 max-w-[280px] md:max-w-[320px] lg:max-w-[340px]"
          style={{
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-center gap-4 md:gap-5">
            {/* Agent Profile Pictures */}
            <div className="flex -space-x-3 md:-space-x-4 flex-shrink-0">
              {agents.length > 0 ? (
                agents.slice(0, 4).map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
                    className="relative w-12 h-12 md:w-14 md:h-14 rounded-full border-[3px] border-white overflow-hidden bg-[#f0f0f0] shadow-md"
                    style={{ zIndex: 4 - index }}
                  >
                    {agent.avatar_url ? (
                      <Image
                        src={agent.avatar_url}
                        alt={agent.name_en}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#e0e0e0] to-[#d0d0d0] text-[#666666] text-sm font-semibold">
                        {agent.name_en.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                Array.from({ length: 4 }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
                    className="relative w-12 h-12 md:w-14 md:h-14 rounded-full border-[3px] border-white overflow-hidden bg-[#f0f0f0] shadow-md"
                    style={{ zIndex: 4 - index }}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#e0e0e0] to-[#d0d0d0] text-[#666666] text-sm font-semibold">
                      A
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.6 }}
                className="text-base md:text-lg font-bold text-[#1a1a1a] mb-2 leading-tight"
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
                    className="h-3.5 w-3.5 md:h-4 md:w-4 fill-[#FFD700] text-[#FFD700] drop-shadow-sm" 
                  />
                ))}
                <span 
                  className="text-sm md:text-base font-semibold text-[#1a1a1a] ml-1.5"
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
