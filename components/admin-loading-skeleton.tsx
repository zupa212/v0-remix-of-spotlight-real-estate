"use client"

import { motion } from "framer-motion"

export function AdminLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-white/20 backdrop-blur-sm rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-white/10 backdrop-blur-sm rounded-lg animate-pulse" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
                <div className="h-8 w-32 bg-white/30 rounded animate-pulse" />
              </div>
              <div className="h-12 w-12 rounded-xl bg-white/20 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg p-6">
        <div className="space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-4 bg-white/20 rounded animate-pulse" />
            ))}
          </div>
          {/* Table Rows */}
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="grid grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((col) => (
                <div key={col} className="h-6 bg-white/10 rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AdminTableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-white/20 rounded animate-pulse" />
        ))}
      </div>
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, col) => (
            <div key={col} className="h-6 bg-white/10 rounded animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function AdminCardSkeleton() {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg p-6 space-y-4">
      <div className="h-6 w-48 bg-white/20 rounded animate-pulse" />
      <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
      <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
    </div>
  )
}

