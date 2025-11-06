"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Star } from "lucide-react"
import Image from "next/image"

const testimonials = [
  {
    name: "Nathan Harper",
    role: "Software Developer",
    text: "Buying my vacation home was surprisingly easy. Sophia really knew her stuff and made the whole process super smooth. I didn't have to worry about a thing.",
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Logan Price",
    role: "Environmental Consultant",
    text: "Emily walked me through every step of my green home investment. She explained things clearly, gave great advice, and honestly just made it all feel doable.",
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Aria Sullivan",
    role: "Digital Nomad",
    text: "Isabella was amazing — super friendly and detail-oriented. I found the perfect rental without any of the usual stress. It actually felt fun.",
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Grace Powell",
    role: "Financial Consultant",
    text: "I had no idea where to start with property investment, but Emily made it all make sense. She was patient, clear, and completely on my side the whole time.",
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Scarlett Mitchell",
    role: "Event Planner",
    text: "I thought the rental process would be a nightmare, but Olivia made it simple. She's sharp, supportive, and gave me a lot of confidence.",
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Samuel Brooks",
    role: "Interior Designer",
    text: "Charlotte totally got what I was looking for. Her design sense and guidance helped me find a home that fits me perfectly. Loved working with her.",
    avatar: "/placeholder.svg?height=80&width=80",
  },
]

export function AnimatedTestimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-16">
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
              className="inline-block px-6 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-700 mb-6"
            >
              What Our Clients Say
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight"
            >
              TRUSTED BY MANY, LOVED BY ALL
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg text-slate-600 leading-relaxed"
            >
              Our clients' success stories reflect our commitment to excellence. See how we've helped them find their
              dream homes, sustainable investments, and perfect getaways.
            </motion.p>
          </motion.div>

          {/* Right Testimonials Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                className="bg-slate-50 rounded-3xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-slate-900 text-slate-900" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">{testimonial.text}</p>
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-600">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
