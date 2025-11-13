"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface AdminPageWrapperProps {
  children: ReactNode
  title?: string
  description?: string
  headerActions?: ReactNode
}

export function AdminPageWrapper({ children, title, description, headerActions }: AdminPageWrapperProps) {
  return (
    <div className="p-6 md:p-8 lg:p-10">
      {/* Header */}
      {(title || description || headerActions) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            {title && (
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                {title}
              </h1>
            )}
            {description && <p className="text-muted-foreground text-lg">{description}</p>}
          </div>
          {headerActions && <div className="flex items-center gap-3">{headerActions}</div>}
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  )
}

