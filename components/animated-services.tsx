"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Home, Leaf, Palmtree } from "lucide-react"
import Image from "next/image"

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

  const handleHover = (index: number) => {
    setHoveredIndex(index)
  }

  const handleHoverEnd = () => {
    setHoveredIndex(null)
  }

  const handleClick = (index: number) => {
    setCurrentIndex(index)
  }

  // Determine which service to show based on hover or current index
  const displayIndex = hoveredIndex !== null ? hoveredIndex : currentIndex
  const currentService = services[displayIndex]
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
                  key={displayIndex}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ 
                    opacity: 1, 
                    x: hoveredIndex !== null && hoveredIndex !== currentIndex ? -15 : 0 
                  }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ 
                    duration: hoveredIndex !== null ? 0.4 : 0.7,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-[#333333] rounded-2xl flex items-center justify-center mb-6"
                    animate={{ 
                      scale: hoveredIndex !== null && hoveredIndex !== currentIndex ? 0.95 : 1,
                      rotate: hoveredIndex !== null && hoveredIndex !== currentIndex ? -5 : 0
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <currentService.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <motion.h3 
                    className="text-4xl font-bold text-[#333333] mb-6"
                    animate={{ 
                      y: hoveredIndex !== null && hoveredIndex !== currentIndex ? 10 : 0,
                      opacity: hoveredIndex !== null && hoveredIndex !== currentIndex ? 0.7 : 1
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {currentService.title}
                  </motion.h3>
                  <motion.p 
                    className="text-lg text-[#666666] leading-relaxed mb-8"
                    animate={{ 
                      y: hoveredIndex !== null && hoveredIndex !== currentIndex ? 10 : 0,
                      opacity: hoveredIndex !== null && hoveredIndex !== currentIndex ? 0.7 : 1
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {currentService.description}
                  </motion.p>
                </motion.div>
              </AnimatePresence>

              {/* Vertical Labels - Left Side (NO NAVIGATION BUTTONS) */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full hidden xl:block">
                <div className="flex flex-col gap-6 items-center">
                  {services.map((service, index) => (
                    <motion.button
                      key={service.id}
                      onClick={() => handleClick(index)}
                      onMouseEnter={() => handleHover(index)}
                      onMouseLeave={handleHoverEnd}
                      className={`writing-mode-vertical text-sm font-medium cursor-pointer relative group ${
                        index === currentIndex ? "text-[#333333]" : "text-[#999999]"
                      }`}
                      style={{ writingMode: "vertical-rl" }}
                      whileHover={{ 
                        scale: 1.05,
                        x: -5
                      }}
                      transition={{ 
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                    >
                      <span className="relative z-10">
                        {service.number} {service.title.toUpperCase()}
                      </span>
                      {index === currentIndex && (
                        <motion.div
                          className="absolute left-0 top-0 w-1 h-full bg-[#E50000]"
                          layoutId="activeIndicator"
                          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        />
                      )}
                    </motion.button>
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
                  key={displayIndex}
                  initial={{ opacity: 0, scale: 0.9, x: 50 }}
                  animate={{ 
                    opacity: 1, 
                    scale: hoveredIndex !== null && hoveredIndex !== currentIndex ? 0.98 : 1,
                    x: hoveredIndex !== null && hoveredIndex !== currentIndex ? 20 : 0
                  }}
                  exit={{ opacity: 0, scale: 0.9, x: -50 }}
                  transition={{ 
                    duration: hoveredIndex !== null ? 0.4 : 0.7,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl"
                >
                  <motion.div
                    animate={{ 
                      scale: hoveredIndex !== null && hoveredIndex !== currentIndex ? 1.05 : 1,
                      x: hoveredIndex !== null && hoveredIndex !== currentIndex ? -10 : 0
                    }}
                    transition={{ 
                      duration: 0.4,
                      ease: [0.4, 0, 0.2, 1]
                    }}
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
                    animate={{ 
                      opacity: hoveredIndex !== null && hoveredIndex !== currentIndex ? 0.8 : 1,
                      y: hoveredIndex !== null && hoveredIndex !== currentIndex ? 10 : 0
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div className="text-4xl font-bold text-[#333333]">{currentService.number}</div>
                    <div className="text-sm text-[#666666] font-medium">{currentService.title}</div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Vertical Line and Text Behind Photo */}
              <div className="absolute right-0 top-0 bottom-0 w-px bg-[#E0E0E0] hidden xl:block" />
              <div className="absolute right-8 top-1/2 -translate-y-1/2 translate-x-0 hidden xl:flex flex-col items-center gap-8 pointer-events-none">
                {/* Vertical Text */}
                <motion.div
                  className="text-sm font-medium text-[#999999]"
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  animate={{
                    opacity: hoveredIndex !== null ? 0.6 : 1,
                    y: hoveredIndex !== null ? -5 : 0
                  }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  {currentService.title.toUpperCase()}
                </motion.div>
                {/* Vertical Number */}
                <motion.div
                  className="text-2xl font-bold text-[#999999]"
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  animate={{
                    opacity: hoveredIndex !== null ? 0.6 : 1,
                    y: hoveredIndex !== null ? -5 : 0
                  }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  {currentService.number}
                </motion.div>
              </div>

              {/* Vertical Label Right (Next Service) */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full hidden xl:block">
                <motion.div
                  className="text-sm font-medium text-[#999999] cursor-pointer"
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  onMouseEnter={() => handleHover((currentIndex + 1) % services.length)}
                  onMouseLeave={handleHoverEnd}
                  onClick={() => handleClick((currentIndex + 1) % services.length)}
                  whileHover={{ scale: 1.05, x: 5 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
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
