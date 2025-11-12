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
    <section ref={ref} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-[#FFFFFF] overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        
        {/* Top Section - Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-8 sm:mb-10 md:mb-12 lg:mb-16"
        >
          {/* What We Offer Button */}
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 bg-[#F0F0F0] rounded-full text-xs sm:text-sm font-medium text-[#333333] mb-4 sm:mb-5 md:mb-6"
            style={{ 
              fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 500,
            }}
          >
            What We Offer
          </motion.span>

          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#1a1a1a] mb-4 sm:mb-5 md:mb-6 leading-tight tracking-tight"
            style={{ 
              fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            COMPREHENSIVE<br className="hidden sm:block" /> REAL ESTATE SOLUTIONS
          </motion.h2>

          {/* Description Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-sm sm:text-base md:text-lg text-[#666666] max-w-2xl sm:max-w-3xl leading-relaxed"
            style={{ 
              fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
              fontWeight: 400,
            }}
          >
            Our comprehensive services encompass luxury property sales, sustainable green building investments, and premium vacation rentals.
          </motion.p>
        </motion.div>

        {/* Bottom Section - Large Photo with Service Content */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 items-start">
            
            {/* Left Content - Service Details */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="relative z-10 order-2 lg:order-1"
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
                  {/* Icon */}
                  <motion.div 
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#1a1a1a] rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5 md:mb-6"
                    animate={{ 
                      scale: hoveredIndex !== null && hoveredIndex !== currentIndex ? 0.95 : 1,
                      rotate: hoveredIndex !== null && hoveredIndex !== currentIndex ? -5 : 0
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <currentService.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </motion.div>

                  {/* Title */}
                  <motion.h3 
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mb-4 sm:mb-5 md:mb-6 leading-tight"
                    animate={{ 
                      y: hoveredIndex !== null && hoveredIndex !== currentIndex ? 10 : 0,
                      opacity: hoveredIndex !== null && hoveredIndex !== currentIndex ? 0.7 : 1
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    style={{
                      fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      fontWeight: 700,
                    }}
                  >
                    {currentService.title}
                  </motion.h3>

                  {/* Description */}
                  <motion.p 
                    className="text-sm sm:text-base md:text-lg text-[#666666] leading-relaxed"
                    animate={{ 
                      y: hoveredIndex !== null && hoveredIndex !== currentIndex ? 10 : 0,
                      opacity: hoveredIndex !== null && hoveredIndex !== currentIndex ? 0.7 : 1
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    style={{
                      fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      fontWeight: 400,
                    }}
                  >
                    {currentService.description}
                  </motion.p>
                </motion.div>
              </AnimatePresence>

              {/* Vertical Labels - Left Side (Desktop Only) */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full hidden xl:block">
                <div className="flex flex-col gap-6 items-center">
                  {services.map((service, index) => (
                    <motion.button
                      key={service.id}
                      onClick={() => handleClick(index)}
                      onMouseEnter={() => handleHover(index)}
                      onMouseLeave={handleHoverEnd}
                      className={`writing-mode-vertical text-xs sm:text-sm font-medium cursor-pointer relative group ${
                        index === currentIndex ? "text-[#1a1a1a]" : "text-[#999999]"
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
                          className="absolute left-0 top-0 w-1 h-full bg-[#1a1a1a]"
                          layoutId="activeIndicator"
                          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Image - Large Photo Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="relative order-1 lg:order-2"
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
                  className="relative w-full aspect-[4/3] sm:aspect-[5/3] md:aspect-[3/2] lg:aspect-[4/3] rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl"
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
                    className="w-full h-full"
                  >
                    <Image
                      src={currentService.image || "/placeholder.svg"}
                      alt={currentService.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                      priority={displayIndex === 0}
                    />
                  </motion.div>
                  
                  {/* Number Overlay - Bottom Right (Light Gray) */}
                  <motion.div 
                    className="absolute bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8"
                    animate={{ 
                      opacity: hoveredIndex !== null && hoveredIndex !== currentIndex ? 0.8 : 1,
                      y: hoveredIndex !== null && hoveredIndex !== currentIndex ? 10 : 0
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div className="text-right">
                      <div 
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white/90 mb-1 sm:mb-1.5 drop-shadow-lg"
                        style={{
                          fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                          fontWeight: 700,
                          textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        {currentService.number}
                      </div>
                      <div 
                        className="text-xs sm:text-sm md:text-base text-white/80 font-medium drop-shadow-md"
                        style={{
                          fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                          fontWeight: 500,
                          textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        {currentService.title}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Vertical Line and Text Behind Photo (Desktop Only) */}
              <div className="absolute right-0 top-0 bottom-0 w-px bg-[#E0E0E0] hidden xl:block" />
              <div className="absolute right-8 top-1/2 -translate-y-1/2 translate-x-0 hidden xl:flex flex-col items-center gap-8 pointer-events-none">
                <motion.div
                  className="text-xs sm:text-sm font-medium text-[#999999]"
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  animate={{
                    opacity: hoveredIndex !== null ? 0.6 : 1,
                    y: hoveredIndex !== null ? -5 : 0
                  }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  {currentService.title.toUpperCase()}
                </motion.div>
                <motion.div
                  className="text-xl sm:text-2xl font-bold text-[#999999]"
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

              {/* Vertical Label Right (Next Service) - Desktop Only */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full hidden xl:block">
                <motion.div
                  className="text-xs sm:text-sm font-medium text-[#999999] cursor-pointer"
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
