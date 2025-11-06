"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Image from "next/image"

export function AnimatedHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-sshdNDePUXAdfJDHoAjd5d7RqCbUxQ.png"
          alt="Luxury modern home"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6 px-6 py-2 bg-white/90 backdrop-blur-sm text-slate-900 rounded-full text-sm font-medium hover:bg-white transition-colors"
          >
            Get in Touch
          </motion.button>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
          >
            LET'S MAKE YOUR PROPERTY JOURNEY
            <br />
            EFFORTLESS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed"
          >
            Have questions or ready to take the next step? Whether you're looking to buy, rent, or invest, our team is
            here to guide you every step of the way. Let's turn your property goals into reality.
          </motion.p>
        </motion.div>

        {/* Contact Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="max-w-2xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-700">
                  First Name
                </Label>
                <Input id="firstName" placeholder="First Name" className="bg-white border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-700">
                  Last Name
                </Label>
                <Input id="lastName" placeholder="Last Name" className="bg-white border-slate-200" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  Email
                </Label>
                <Input id="email" type="email" placeholder="Email" className="bg-white border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700">
                  Phone
                </Label>
                <Input id="phone" type="tel" placeholder="Phone" className="bg-white border-slate-200" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-slate-700">
                What Can We Help You ?
              </Label>
              <Textarea
                id="message"
                placeholder="What Can We Help You ?"
                rows={4}
                className="bg-white border-slate-200 resize-none"
              />
            </div>

            <Button className="w-full h-14 text-lg bg-slate-900 hover:bg-slate-800 rounded-full">Book a Call</Button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
