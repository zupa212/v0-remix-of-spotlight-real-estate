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
        "bg-card border-border shadow-sm hover:shadow-md transition-all duration-300",
        className
      )}>
        {(title || headerActions) && (
          <CardHeader className={cn(
            "flex flex-row items-center justify-between border-b border-border",
            title && "pb-4"
          )}>
            {title && (
              <CardTitle className="text-xl font-semibold text-card-foreground">
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

