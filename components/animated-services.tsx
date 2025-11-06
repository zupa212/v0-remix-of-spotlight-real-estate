"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Home, Leaf, Palmtree } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const services = [
  {
    id: 1,
    icon: Home,
    title: "Luxury Residences",
    description:
      "Experience unparalleled elegance in our luxury residences, featuring exquisite design, premium amenities, and prime locations for the most discerning tastes.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-918DtplfoNqnkzA1wdAwkwnZWQUEj8.png",
    number: "01",
  },
  {
    id: 2,
    icon: Leaf,
    title: "Eco Green Buildings",
    description:
      "Discover sustainable living in our eco-friendly properties, designed to minimize environmental impact while offering modern comforts and energy efficiency.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yNlFCdpqUjIib7OmB3I92R5SOTWNlD.png",
    number: "02",
  },
  {
    id: 3,
    icon: Palmtree,
    title: "Unique Vacation Homes",
    description:
      "Escape to our unique vacation homes, offering personalized experiences in stunning locations with all the amenities for an unforgettable getaway.",
    image: "/luxury-vacation-home.png",
    number: "03",
  },
]

export function AnimatedServices() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % services.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length)
  }

  const currentService = services[currentIndex]
  const nextService = services[(currentIndex + 1) % services.length]

  return (
    <section ref={ref} className="py-24 bg-slate-50 overflow-hidden">
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
            What We Offer
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            COMPREHENSIVE REAL ESTATE SOLUTIONS
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg text-slate-600 max-w-3xl mx-auto"
          >
            Our comprehensive services encompass luxury property sales, sustainable green building investments, and
            premium vacation rentals.
          </motion.p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="relative z-10"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentService.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6">
                    <currentService.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-4xl font-bold text-slate-900 mb-6">{currentService.title}</h3>
                  <p className="text-lg text-slate-600 leading-relaxed mb-8">{currentService.description}</p>

                  <div className="flex gap-4">
                    <Button
                      onClick={prevSlide}
                      variant="outline"
                      size="icon"
                      className="rounded-full w-12 h-12 border-slate-300 bg-transparent"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={nextSlide}
                      variant="outline"
                      size="icon"
                      className="rounded-full w-12 h-12 border-slate-300 bg-transparent"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Vertical Labels */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full hidden xl:block">
                <div className="flex flex-col gap-8">
                  {services.map((service, index) => (
                    <button
                      key={service.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`writing-mode-vertical text-sm font-medium transition-colors ${
                        index === currentIndex ? "text-slate-900" : "text-slate-400"
                      }`}
                      style={{ writingMode: "vertical-rl" }}
                    >
                      {service.number} {service.title.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="relative"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentService.id}
                  initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.95, rotate: 2 }}
                  transition={{ duration: 0.6 }}
                  className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl"
                >
                  <Image
                    src={currentService.image || "/placeholder.svg"}
                    alt={currentService.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-8 right-8 bg-white rounded-2xl px-6 py-4 shadow-lg">
                    <div className="text-4xl font-bold text-slate-900">{currentService.number}</div>
                    <div className="text-sm text-slate-600">{currentService.title}</div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Vertical Label Right */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full hidden xl:block">
                <div
                  className="text-sm font-medium text-slate-400"
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                >
                  {nextService.number} {nextService.title.toUpperCase()}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
