"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Play, MessageCircle, ArrowRight, Quote } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BeforeAfterSlider } from "./before-after/BeforeAfterSlider"
import { PhoneCompareModal } from "./before-after/PhoneCompareModal"

// Sample Data
const COMPARE_ITEMS = [
    {
        id: "yard",
        title: "Backyard Oasis",
        beforeSrc: "/kapandriti/before/1.png",
        afterSrc: "/kapandriti/after/1.png",
    },
    {
        id: "driveway",
        title: "Main Entrance",
        beforeSrc: "/kapandriti/before/2.png",
        afterSrc: "/kapandriti/after/2.png",
    },
    {
        id: "interior",
        title: "Living Room",
        beforeSrc: "/kapandriti/before/3.png",
        afterSrc: "/kapandriti/after/3.png",
    },
]

const TESTIMONIALS = [
    {
        name: "Alex Papadopoulos",
        role: "Architect",
        text: "The transformation possibilities here are immense. The layout provides huge spaces that are rare to find in modern constructions.",
        rating: 5,
    },
    {
        name: "Maria K.",
        role: "Potential Buyer",
        text: "Presentation makes the property feel ready to live. The visuals helped us understand exactly what we are buying.",
        rating: 5,
    },
    {
        name: "Giorgos D.",
        role: "Investor",
        text: "Strong potential. The calm exterior and the massive basement storage are huge pluses for any family.",
        rating: 5,
    },
]

export function TestimonialsHomePage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [activeItemIndex, setActiveItemIndex] = useState(0)

    const handleOpenModal = (index: number) => {
        setActiveItemIndex(index)
        setIsModalOpen(true)
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-white/20">

            {/* Hero Section */}
            <section className="relative pt-24 pb-20 px-6 lg:px-8 max-w-7xl mx-auto">

                {/* Header Text */}
                <div className="text-center space-y-6 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400"
                    >
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Kapandriti • 336 sqm
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4"
                    >
                        Before / After <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500">Presentation</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto"
                    >
                        Click to compare • Auto-slide every 2 seconds • Drag to reveal
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                    >
                        <Button
                            onClick={() => handleOpenModal(0)}
                            className="bg-white text-black hover:bg-zinc-200 rounded-full h-12 px-8 text-base font-medium transition-transform hover:scale-105"
                        >
                            Open Before/After Viewer
                            <Play className="ml-2 h-4 w-4 fill-current" />
                        </Button>
                        <Button
                            variant="outline"
                            className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-full h-12 px-8 text-base"
                            onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            View Testimonials
                        </Button>
                    </motion.div>
                </div>

                {/* Hero Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Left: Active Slider Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="w-full"
                    >
                        <div className="bg-zinc-900/50 rounded-3xl p-2 border border-zinc-800/50">
                            <BeforeAfterSlider
                                beforeSrc={COMPARE_ITEMS[0].beforeSrc}
                                afterSrc={COMPARE_ITEMS[0].afterSrc}
                                alt="Main Hero Comparison"
                                className="aspect-video"
                                initial={50}
                            />
                        </div>
                        <div className="text-center mt-4 space-y-1">
                            <p className="text-zinc-300 font-medium">Interactive Preview</p>
                            <p className="text-zinc-600 text-sm">Try dragging the slider right here</p>
                        </div>
                    </motion.div>

                    {/* Right: Gallery Grid for Slider Selection */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-white">Project Transformation</h3>
                            <span className="text-zinc-500 text-sm">{COMPARE_ITEMS.length} Scenes</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {COMPARE_ITEMS.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
                                    onClick={() => handleOpenModal(index)}
                                    className={`group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border border-zinc-800 hover:border-zinc-600 transition-colors ${index === 0 ? 'sm:col-span-2 sm:aspect-[21/9]' : ''}`}
                                >
                                    <Image
                                        src={item.afterSrc}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-medium border border-white/10">
                                        Tap to compare
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                                        <h4 className="text-white font-medium">{item.title}</h4>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>

            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-24 bg-zinc-900/30 border-t border-zinc-900">
                <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">What people are saying</h2>
                        <p className="text-zinc-500">Feedback from potential buyers and industry experts</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="bg-zinc-950 border border-zinc-800/50 p-8 rounded-3xl hover:border-zinc-700 transition-colors relative"
                            >
                                <Quote className="absolute top-8 right-8 h-8 w-8 text-zinc-800 fill-zinc-900" />

                                <div className="flex gap-1 mb-6 text-yellow-500">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-current" />
                                    ))}
                                </div>

                                <p className="text-zinc-300 mb-8 leading-relaxed">"{t.text}"</p>

                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">{t.name}</div>
                                        <div className="text-xs text-zinc-500 uppercase tracking-wide">{t.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Modal */}
            <PhoneCompareModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                items={COMPARE_ITEMS}
                activeIndex={activeItemIndex}
                onIndexChange={setActiveItemIndex}
            />

        </div>
    )
}
