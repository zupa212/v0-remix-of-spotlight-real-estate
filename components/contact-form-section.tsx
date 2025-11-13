"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function ContactFormSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      })
      alert("Thank you! We'll contact you soon.")
    }, 1000)
  }

  return (
    <section ref={ref} className="relative w-full overflow-hidden">
      {/* Background Image - Blurred */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/MNaTdWhKQ4PCxwtMgQRe9ROUJo.avif"
          alt="Modern house background"
          fill
          className="object-cover"
          quality={90}
          sizes="100vw"
          priority
        />
        {/* Blur overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
          
          {/* Top Section - Light Blue Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16"
          >
            {/* Get in Touch Button */}
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-block px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-[#E8F4F8] rounded-full text-xs sm:text-sm md:text-base font-medium text-[#1a1a1a] mb-4 sm:mb-5 md:mb-6"
              style={{
                fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontWeight: 500,
              }}
            >
              Get in Touch
            </motion.span>

            {/* Main Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-5 md:mb-6 leading-tight"
              style={{
                fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
              }}
            >
              LET&apos;S MAKE YOUR<br />PROPERTY JOURNEY<br />EFFORTLESS
            </motion.h2>

            {/* Description Text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-white max-w-3xl mx-auto leading-relaxed px-4"
              style={{
                fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontWeight: 400,
                textShadow: '0 1px 10px rgba(0, 0, 0, 0.3)',
              }}
            >
              Have questions or ready to take the next step? Whether you&apos;re looking to buy, rent, or invest, our team is here to guide you every step of the way. Let&apos;s turn your property goals into reality.
            </motion.p>
          </motion.div>

          {/* Form Container - Large White Rounded Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="max-w-2xl mx-auto bg-white rounded-2xl sm:rounded-3xl md:rounded-[2rem] p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 md:space-y-7">
              {/* First Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="w-full px-0 py-3 sm:py-4 text-sm sm:text-base md:text-lg bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-[#1a1a1a] transition-colors placeholder:text-gray-400"
                  style={{
                    fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontWeight: 400,
                  }}
                />
              </motion.div>

              {/* Last Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="w-full px-0 py-3 sm:py-4 text-sm sm:text-base md:text-lg bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-[#1a1a1a] transition-colors placeholder:text-gray-400"
                  style={{
                    fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontWeight: 400,
                  }}
                />
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-0 py-3 sm:py-4 text-sm sm:text-base md:text-lg bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-[#1a1a1a] transition-colors placeholder:text-gray-400"
                  style={{
                    fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontWeight: 400,
                  }}
                />
              </motion.div>

              {/* Phone */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-0 py-3 sm:py-4 text-sm sm:text-base md:text-lg bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-[#1a1a1a] transition-colors placeholder:text-gray-400"
                  style={{
                    fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontWeight: 400,
                  }}
                />
              </motion.div>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.1 }}
              >
                <input
                  type="text"
                  id="message"
                  name="message"
                  placeholder="What Can We Help You ?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  className="w-full px-0 py-3 sm:py-4 text-sm sm:text-base md:text-lg bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-[#1a1a1a] transition-colors placeholder:text-gray-400"
                  style={{
                    fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontWeight: 400,
                  }}
                />
              </motion.div>

              {/* Submit Button - Black Rounded */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="pt-4 sm:pt-5"
              >
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1a1a1a] hover:bg-[#000000] text-white rounded-full px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-4.5 lg:py-5 text-sm sm:text-base md:text-lg font-semibold h-auto shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Book a Call"}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

