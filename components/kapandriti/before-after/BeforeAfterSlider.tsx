"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { GripVertical, ArrowLeft, ArrowRight, RotateCcw } from "lucide-react"

type BeforeAfterSliderProps = {
    beforeSrc: string
    afterSrc: string
    alt?: string
    className?: string
    imageClassName?: string
    height?: number
    initial?: number
    showLabels?: boolean
    showControls?: boolean
    onChange?: (value: number) => void
}

export function BeforeAfterSlider({
    beforeSrc,
    afterSrc,
    alt = "Comparison image",
    className = "",
    imageClassName = "",
    initial = 50,
    showLabels = true,
    showControls = true,
    onChange,
}: BeforeAfterSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(initial)
    const containerRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)

    // Notify parent of changes
    useEffect(() => {
        onChange?.(sliderPosition)
    }, [sliderPosition, onChange])

    const handleMove = useCallback(
        (clientX: number) => {
            if (!containerRef.current) return

            const rect = containerRef.current.getBoundingClientRect()
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
            const percentage = Math.max(0, Math.min((x / rect.width) * 100, 100))

            setSliderPosition(percentage)
        },
        []
    )

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault()
        isDragging.current = true
        containerRef.current?.setPointerCapture(e.pointerId)
        handleMove(e.clientX)
    }

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isDragging.current) {
            handleMove(e.clientX)
        }
    }

    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        isDragging.current = false
        containerRef.current?.releasePointerCapture(e.pointerId)
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const step = e.shiftKey ? 10 : 2
        let newValue = sliderPosition

        switch (e.key) {
            case "ArrowLeft":
                newValue = Math.max(0, sliderPosition - step)
                break
            case "ArrowRight":
                newValue = Math.min(100, sliderPosition + step)
                break
            case "Home":
                newValue = 0
                break
            case "End":
                newValue = 100
                break
            case "Enter":
            case " ":
                newValue = 50
                break
            default:
                return
        }

        e.preventDefault()
        setSliderPosition(newValue)
    }

    return (
        <div className={`w-full flex flex-col gap-4 ${className}`}>

            {/* Slider Container */}
            <div
                ref={containerRef}
                className={`relative w-full overflow-hidden select-none touch-none group cursor-ew-resize rounded-2xl md:rounded-3xl shadow-lg border border-white/10 ${imageClassName}`}
                style={{ aspectRatio: '16/9' }} // Default aspect ratio, override with height prop if needed
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onKeyDown={onKeyDown}
                role="slider"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={sliderPosition}
                aria-label="Before and after comparison slider"
                tabIndex={0}
            >
                {/* BEFORE Image (Background - Right Side Concept) */}
                <Image
                    src={beforeSrc}
                    alt={`Before ${alt}`}
                    fill
                    priority
                    className="object-cover object-center pointer-events-none select-none"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* AFTER Image (Foreground - Left Side Concept - Clipped) */}
                <div
                    className="absolute inset-0 w-full h-full pointer-events-none select-none"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                    <Image
                        src={afterSrc}
                        alt={`After ${alt}`}
                        fill
                        priority
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>

                {/* Slider Handle Line */}
                <div
                    className="absolute inset-y-0 w-0.5 bg-white/80 shadow-[0_0_10px_rgba(0,0,0,0.3)] pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                >
                    {/* Handle Knob - Minimal & Premium */}
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 bg-white/20 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center border border-white/60 transform transition-transform group-hover:scale-110 group-active:scale-95">
                        <div className="h-4 w-0.5 bg-white/80 rounded-full mx-[1px]" />
                        <div className="h-4 w-0.5 bg-white/80 rounded-full mx-[1px]" />
                    </div>
                </div>
            </div>
        </div>
    )
}
