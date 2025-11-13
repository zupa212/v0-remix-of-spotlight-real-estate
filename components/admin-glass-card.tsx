"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AdminGlassCardProps {
  children: ReactNode
  title?: string
  headerActions?: ReactNode
  className?: string
  index?: number
}

export function AdminGlassCard({ children, title, headerActions, className, index = 0 }: AdminGlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className={cn(
        "bg-white/40 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300",
        className
      )}>
        {(title || headerActions) && (
          <CardHeader className={cn(
            "flex flex-row items-center justify-between border-b border-white/10",
            title && "pb-4"
          )}>
            {title && (
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {title}
              </CardTitle>
            )}
            {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
          </CardHeader>
        )}
        <CardContent className={title ? "p-6" : "p-0"}>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
}

