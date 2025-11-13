"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  index?: number
}

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
              <motion.p
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent"
              >
                {value}
              </motion.p>
              {change && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className={`text-sm mt-2 font-medium ${
                    changeType === "positive"
                      ? "text-emerald-600"
                      : changeType === "negative"
                        ? "text-red-600"
                        : "text-slate-500"
                  }`}
                >
                  {change}
                </motion.p>
              )}
            </div>
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg"
            >
              <Icon className="h-7 w-7 text-blue-600" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
