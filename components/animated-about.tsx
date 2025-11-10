"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Eye, Target } from "lucide-react"
import Image from "next/image"

export function AnimatedAbout() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 bg-slate-50">
      <div className="w-full px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block px-6 py-2 bg-[#F0F0F0] rounded-full text-sm font-medium text-[#333333] mb-6 shadow-sm"
            >
              What We Offer
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight"
            >
              REDEFINING EXCELLENCE IN REAL ESTATE
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg text-slate-600 mb-12 leading-relaxed"
            >
              We specialize in luxury properties, sustainable homes, and vacation rentals — driven by a passion for
              exceptional living and a commitment to quality, innovation, and client satisfaction.
            </motion.p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-8">
              {[
                { value: "200+", label: "Projects Complete" },
                { value: "70+", label: "Happy Clients" },
                { value: "$10M+", label: "Project Value" },
                { value: "90%", label: "Client Retention Rate" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                >
                  <div className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">{stat.value}</div>
                  <div className="text-slate-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl"
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ro7pky8TeqxGMSOSzMLye5fGcOhTvR.png"
              alt="Our team"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              icon: Eye,
              title: "Our Vision",
              description:
                "To be a leader in the real estate market, offering unparalleled services in luxury, sustainability, and vacation properties.",
            },
            {
              icon: Target,
              title: "Our Mission",
              description:
                "To create exceptional living experiences through innovation, sustainability, and personalized service in modern real estate.",
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 + index * 0.2, duration: 0.8 }}
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                <item.icon className="w-7 h-7 text-slate-900" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
