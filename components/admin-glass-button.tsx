"use client"

import { motion } from "framer-motion"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface AdminGlassButtonProps extends ButtonProps {
  children: ReactNode
  variant?: "default" | "outline" | "ghost" | "secondary"
}

export function AdminGlassButton({ children, className, variant = "default", ...props }: AdminGlassButtonProps) {
  const baseClasses = "bg-white/40 backdrop-blur-xl border border-white/20 hover:bg-white/60 shadow-lg hover:shadow-xl transition-all"
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        variant={variant === "default" ? "outline" : variant}
        className={cn(
          variant === "default" && baseClasses,
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  )
}

