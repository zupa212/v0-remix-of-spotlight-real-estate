"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

type Agent = {
  id: string
  name_en: string
  name_gr: string | null
  bio_en: string | null
  bio_gr: string | null
  avatar_url: string | null
  specialties: string[] | null
}

export function AnimatedTeam() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("agents")
          .select("id, name_en, name_gr, bio_en, bio_gr, avatar_url, specialties")
          .eq("featured", true)
          .order("display_order", { ascending: true })
          .limit(5)

        if (error) {
          console.error("Error fetching agents:", error)
        } else {
          setAgents(data || [])
        }
      } catch (error) {
        console.error("Error fetching agents:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

  return (
    <section ref={ref} className="py-24 bg-slate-50">
      <div className="w-full px-6">
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
            className="inline-block px-6 py-2 bg-white rounded-full text-sm font-medium text-slate-700 mb-6 shadow-sm"
          >
            Meet Our Experts
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-slate-900"
          >
            PERSONALIZED GUIDANCE,
            <br />
            PROVEN EXPERTISE
          </motion.h2>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading team members...</p>
          </div>
        ) : agents.length > 0 ? (
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                className="flex-shrink-0 w-80 snap-center"
              >
                <Link href={`/agents/${agent.id}`} className="block">
                  <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-6 shadow-lg">
                    <Image
                      src={agent.avatar_url || "/placeholder-user.jpg"}
                      alt={agent.name_en}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{agent.name_en}</h3>
                  <p className="text-slate-600">
                    {agent.bio_en || agent.specialties?.join(", ") || "Real Estate Agent"}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
