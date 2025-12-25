"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

type Testimonial = {
    name: string
    role?: string
    text: string
    rating?: number
}

type TestimonialsSectionProps = {
    testimonials: Testimonial[]
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
    if (!testimonials || testimonials.length === 0) return null

    return (
        <section id="testimonials" className="py-24 bg-zinc-950 border-t border-zinc-900 text-zinc-200">
            <div className="container mx-auto px-6 lg:px-8 max-w-7xl">

                {/* Heading */}
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl font-bold text-white">What people are saying</h2>
                    <p className="text-zinc-500">Feedback from potential buyers and industry experts</p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="bg-zinc-900/40 border border-zinc-800/50 p-8 rounded-3xl hover:border-zinc-700 transition-colors relative"
                        >
                            <Quote className="absolute top-8 right-8 h-8 w-8 text-zinc-800 fill-zinc-900" />

                            <div className="flex gap-1 mb-6 text-yellow-500">
                                {[...Array(t.rating || 5)].map((_, idx) => (
                                    <Star key={idx} className="h-4 w-4 fill-current" />
                                ))}
                            </div>

                            <p className="text-zinc-300 mb-8 leading-relaxed italic">"{t.text}"</p>

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">
                                    {t.name[0]}
                                </div>
                                <div>
                                    <div className="font-medium text-white">{t.name}</div>
                                    {t.role && (
                                        <div className="text-xs text-zinc-500 uppercase tracking-wide">{t.role}</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
