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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % services.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length)
  }

  const handleHover = (index: number) => {
    setHoveredIndex(index)
    setCurrentIndex(index)
  }

  const handleHoverEnd = () => {
    setHoveredIndex(null)
  }

  const currentService = services[currentIndex]
  const nextService = services[(currentIndex + 1) % services.length]

  return (
    <section ref={ref} className="py-24 bg-[#FFFFFF] overflow-hidden">
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
            className="inline-block px-6 py-2 bg-[#F0F0F0] rounded-full text-sm font-medium text-[#333333] mb-6 shadow-sm"
          >
            What We Offer
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-[#333333] mb-6"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            COMPREHENSIVE REAL ESTATE SOLUTIONS
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg text-[#666666] max-w-3xl mx-auto"
            style={{ fontFamily: "var(--font-sans)" }}
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
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ 
                    duration: 0.7,
                    ease: [0.4, 0, 0.2, 1] // Custom easing for smooth transition
                  }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-[#333333] rounded-2xl flex items-center justify-center mb-6"
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <currentService.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <motion.h3 
                    className="text-4xl font-bold text-[#333333] mb-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {currentService.title}
                  </motion.h3>
                  <motion.p 
                    className="text-lg text-[#666666] leading-relaxed mb-8"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {currentService.description}
                  </motion.p>

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

              {/* Vertical Labels - Left Side */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full hidden xl:block">
                <div className="flex flex-col gap-6 items-center">
                  <motion.button
                    onClick={prevSlide}
                    className="text-[#333333] hover:text-[#E50000] transition-colors mb-2"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>
                  {services.map((service, index) => (
                    <motion.button
                      key={service.id}
                      onClick={() => setCurrentIndex(index)}
                      onMouseEnter={() => handleHover(index)}
                      onMouseLeave={handleHoverEnd}
                      className={`writing-mode-vertical text-sm font-medium cursor-pointer relative ${
                        index === currentIndex ? "text-[#333333]" : "text-[#999999]"
                      }`}
                      style={{ writingMode: "vertical-rl" }}
                      whileHover={{ 
                        scale: 1.1,
                        color: "#333333"
                      }}
                      transition={{ 
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                    >
                      {service.number} {service.title.toUpperCase()}
                      {index === currentIndex && (
                        <motion.div
                          className="absolute left-0 top-0 w-1 h-full bg-[#E50000]"
                          layoutId="activeIndicator"
                          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        />
                      )}
                    </motion.button>
                  ))}
                  <motion.button
                    onClick={nextSlide}
                    className="text-[#333333] hover:text-[#E50000] transition-colors mt-2"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </motion.button>
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
                  initial={{ opacity: 0, scale: 0.9, x: 50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -50 }}
                  transition={{ 
                    duration: 0.7,
                    ease: [0.4, 0, 0.2, 1] // Smooth cubic-bezier easing
                  }}
                  className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl"
                >
                  <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <Image
                      src={currentService.image || "/placeholder.svg"}
                      alt={currentService.title}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                  <motion.div 
                    className="absolute bottom-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl border border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="text-4xl font-bold text-[#333333]">{currentService.number}</div>
                    <div className="text-sm text-[#666666] font-medium">{currentService.title}</div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Vertical Label Right */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full hidden xl:block">
                <motion.div
                  className="text-sm font-medium text-[#999999] cursor-pointer hover:text-[#333333] transition-colors"
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  whileHover={{ scale: 1.1 }}
                  onClick={nextSlide}
                >
                  {nextService.number} {nextService.title.toUpperCase()}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
