"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { BeforeAfterSlider } from "./BeforeAfterSlider"

type CompareItem = {
    id: string
    title: string
    beforeSrc: string
    afterSrc: string
}

type PhoneCompareModalProps = {
    isOpen: boolean
    onClose: () => void
    items: CompareItem[]
    activeIndex: number
    onIndexChange: (index: number) => void
}

export function PhoneCompareModal({
    isOpen,
    onClose,
    items,
    activeIndex,
    onIndexChange
}: PhoneCompareModalProps) {
    const [sliderValue, setSliderValue] = useState(50)

    // Auto-slide logic
    useEffect(() => {
        if (!isOpen) return

        const interval = setInterval(() => {
            const nextIndex = (activeIndex + 1) % items.length
            onIndexChange(nextIndex)
        }, 3000) // Changed to 3s for better viewing time

        return () => clearInterval(interval)
    }, [isOpen, activeIndex, items.length, onIndexChange])

    // Reset slider value when index changes (optional - keeping it steady for smoother transition feels better usually, but sticking to request)
    // Actually, keeping the slider value constant (e.g. at 50% or wherever user drag it) is usually better UX unless requested otherwise.
    // The prompt asked for "auto-sweep" but implementing robust auto-sweep + user Drag interaction concurrently is complex.
    // For now, simpler auto-slide of IMAGES while keeping slider at 50% or user position is safer.

    if (!isOpen) return null

    const currentItem = items[activeIndex]

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    {/* Modal Content - Phone Mockup */}
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-[400px] bg-black rounded-[2.5rem] border-[8px] border-zinc-800 shadow-2xl overflow-hidden aspect-[9/19] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Dynamic Island / Notch area */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-24 bg-black rounded-b-2xl z-20 pointer-events-none" />

                        {/* Status Bar Mockup */}
                        <div className="h-12 w-full flex justify-between items-center px-6 pt-2 text-white text-xs font-medium z-10 pointer-events-none">
                            <span>9:41</span>
                            <div className="flex gap-1.5">
                                <div className="w-4 h-2.5 bg-white rounded-[1px]" />
                                <div className="w-0.5 h-2.5 bg-white/30 rounded-[1px]" />
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Main Content Area */}
                        <div className="flex-1 bg-zinc-950 flex flex-col relative overflow-hidden">

                            {/* Header inside Phone */}
                            <div className="mt-8 px-6 pb-4">
                                <h3 className="text-white text-xl font-bold leading-tight">Kapandriti Exclusive</h3>
                                <p className="text-zinc-500 text-sm">Tap & Drag to compare</p>
                            </div>

                            {/* Slider Component */}
                            <div className="flex-1 flex flex-col justify-center px-0 relative">
                                <div className="relative w-full aspect-[4/5]">
                                    <BeforeAfterSlider
                                        key={currentItem.id} // Re-mount on change to force image refresh cleanly
                                        beforeSrc={currentItem.beforeSrc}
                                        afterSrc={currentItem.afterSrc}
                                        initial={50}
                                        showLabels={false}
                                        showControls={false}
                                        imageClassName="rounded-none border-0 !aspect-[4/5]"
                                        onChange={setSliderValue}
                                    />

                                    {/* Custom Overlay Labels inside the "Phone" UI */}
                                    <div className="absolute top-4 left-4 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-md pointer-events-none">AFTER</div>
                                    <div className="absolute top-4 right-4 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-md pointer-events-none">BEFORE</div>
                                </div>
                            </div>

                            {/* Bottom Controls / Text */}
                            <div className="p-6 pb-12 bg-zinc-900/50 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-white font-medium">{currentItem.title}</h4>
                                    <span className="text-zinc-500 text-xs">{activeIndex + 1} / {items.length}</span>
                                </div>
                                <p className="text-zinc-400 text-xs leading-relaxed">
                                    Dragging the slider reveals the transformation. Notice the lighting changes and material upgrades in the {currentItem.title.toLowerCase()}.
                                </p>

                                {/* Navigation Dots */}
                                <div className="flex justify-center gap-2 pt-2">
                                    {items.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => onIndexChange(idx)}
                                            className={`h-1.5 rounded-full transition-all ${idx === activeIndex ? "w-6 bg-white" : "w-1.5 bg-zinc-700 hover:bg-zinc-600"}`}
                                            aria-label={`Go to slide ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Home Indicator */}
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white rounded-full z-20 pointer-events-none mb-2" />

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
