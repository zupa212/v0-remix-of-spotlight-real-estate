"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"

const team = [
  {
    name: "Noah Clarke",
    role: "Eco-Friendly Property Specialist",
    image: "/professional-man-blue-background.jpg",
  },
  {
    name: "Benjamin Foster",
    role: "Urban Development Advisor",
    image: "/professional-man-gray-suit.jpg",
  },
  {
    name: "Emily Chen",
    role: "Investment Property Consultant",
    image: "/professional-woman-business-suit.png",
  },
  {
    name: "Michael Anderson",
    role: "Vacation Rental Specialist",
    image: "/professional-man-gray-suit-smiling.jpg",
  },
  {
    name: "Charlotte Morgan",
    role: "High-End Property Consultant",
    image: "/professional-woman-dark-blazer.jpg",
  },
]

export function AnimatedTeam() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
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

        <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
              className="flex-shrink-0 w-80 snap-center"
            >
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-6 shadow-lg">
                <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{member.name}</h3>
              <p className="text-slate-600">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
