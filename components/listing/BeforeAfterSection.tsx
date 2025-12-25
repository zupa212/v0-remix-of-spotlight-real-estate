"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BeforeAfterSlider } from "@/components/kapandriti/before-after/BeforeAfterSlider"

type CompareItem = {
    id: string
    title: string
    beforeSrc: string
    afterSrc: string
    note?: string
}

type BeforeAfterSectionProps = {
    compareItems: CompareItem[]
}

export function BeforeAfterSection({ compareItems }: BeforeAfterSectionProps) {

    // If no items, return null or empty
    if (!compareItems || compareItems.length === 0) return null

    return (
        <section className="py-16 md:py-24 bg-zinc-950 text-zinc-200" id="transformation">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl space-y-12">

                {/* Section Heading */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400"
                    >
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Μεταμόρφωση
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold text-white" // Removed tracking-tight for Greek
                    >
                        Πριν / Μετά
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium" // Added font-medium
                    >
                        Σύρετε τον δείκτη για να δείτε την αλλαγή. Κάντε κλικ για λεπτομέρειες.
                    </motion.p>
                </div>

                {/* Responsive Grid Layout: Stacked on Mobile, 2-Column on Desktop (Big view) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 min-h-[600px]">
                    {compareItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col gap-4 group"
                        >
                            <div
                                className="relative w-full aspect-[9/16] bg-zinc-900 rounded-[2rem] overflow-hidden border border-zinc-800 shadow-2xl transition-all duration-500 group-hover:border-zinc-600 group-hover:shadow-zinc-900/50"
                            >
                                <BeforeAfterSlider
                                    beforeSrc={item.beforeSrc}
                                    afterSrc={item.afterSrc}
                                    alt={item.title}
                                    className="h-full w-full"
                                    imageClassName="h-full w-full !aspect-[9/16]"
                                    initial={50}
                                    showLabels={false}
                                    showControls={false}
                                />

                                {/* Title Overlay */}
                                <div className="absolute top-6 left-0 right-0 text-center pointer-events-none z-10 lg:hidden">
                                    <span className="bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-white font-medium text-sm border border-white/10 shadow-lg">
                                        {item.title}
                                    </span>
                                </div>

                                <div className="hidden lg:block absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
                                    <h3 className="text-white text-xl font-bold text-center drop-shadow-md">{item.title}</h3>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    )
}
