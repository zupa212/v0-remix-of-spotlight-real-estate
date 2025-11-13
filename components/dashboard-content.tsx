"use client"

import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MessageSquare, Calendar, TrendingUp, Eye, Clock } from "lucide-react"
import { motion } from "framer-motion"

function formatCurrency(value: number, currency = "EUR") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatRelativeTime(date: string | null | undefined) {
  if (!date) return "Just now"
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return "Just now"
  }
}

interface DashboardContentProps {
  errors: string[]
  totalProperties: number
  newPropertiesThisMonth: number
  activeLeads: number
  newLeadsThisWeek: number
  scheduledViewings: number
  viewingsCreatedThisWeek: number
  monthlyRevenue: number
  dealsClosed: number
  propertyChangeText: string
  propertyChangeType: "positive" | "negative" | "neutral"
  leadChangeText: string
  leadChangeType: "positive" | "negative" | "neutral"
  viewingChangeText: string
  viewingChangeType: "positive" | "negative" | "neutral"
  revenueChangeText: string
  revenueChangeType: "positive" | "negative" | "neutral"
  propertyStats: Array<{ type: string; count: number; percentage: number }>
  recentLeads: Array<{
    id: string
    name: string
    email: string
    property: string
    status: string
    createdAt: string
  }>
  upcomingViewings: Array<{
    id: string
    property: string
    client: string
    date: string
    agent: string
    status: string
  }>
}

export function DashboardContent({
  errors,
  totalProperties,
  activeLeads,
  scheduledViewings,
  monthlyRevenue,
  propertyChangeText,
  propertyChangeType,
  leadChangeText,
  leadChangeType,
  viewingChangeText,
  viewingChangeType,
  revenueChangeText,
  revenueChangeType,
  propertyStats,
  recentLeads,
  upcomingViewings,
}: DashboardContentProps) {
  return (
    <div className="p-6 md:p-8 lg:p-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-slate-600 text-lg">Welcome back! Here's what's happening today.</p>
      </motion.div>

      {/* Error Display */}
      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 rounded-2xl border border-red-200/50 bg-red-50/80 backdrop-blur-sm p-4 shadow-lg"
        >
          <h3 className="text-sm font-semibold text-red-800 mb-2">Some data failed to load:</h3>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Properties"
          value={totalProperties}
          change={propertyChangeText}
          changeType={propertyChangeType}
          icon={Building2}
          index={0}
        />
        <StatCard
          title="Active Leads"
          value={activeLeads}
          change={leadChangeText}
          changeType={leadChangeType}
          icon={MessageSquare}
          index={1}
        />
        <StatCard
          title="Scheduled Viewings"
          value={scheduledViewings}
          change={viewingChangeText}
          changeType={viewingChangeType}
          icon={Calendar}
          index={2}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(monthlyRevenue)}
          change={revenueChangeText}
          changeType={revenueChangeType}
          icon={TrendingUp}
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Leads */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="bg-white/40 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/10">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Recent Leads
              </CardTitle>
              <Button variant="outline" size="sm" asChild className="bg-white/50 backdrop-blur-sm border-white/30">
                <Link href="/admin/leads">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {recentLeads.length > 0 ? (
                <div className="space-y-4">
                  {recentLeads.map((lead, index) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80 transition-all cursor-pointer"
                    >
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-sm font-bold text-slate-700">
                          {lead.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="font-semibold text-slate-900">{lead.name}</div>
                          <Badge
                            variant="secondary"
                            className={
                              lead.status === "new"
                                ? "bg-blue-100/80 text-blue-700 border border-blue-200/50"
                                : lead.status === "contacted"
                                  ? "bg-amber-100/80 text-amber-700 border border-amber-200/50"
                                  : "bg-green-100/80 text-green-700 border border-green-200/50"
                            }
                          >
                            {lead.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 truncate mb-1">{lead.property}</p>
                        <p className="text-xs text-slate-500">{formatRelativeTime(lead.createdAt)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No leads have been captured yet.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Viewings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="bg-white/40 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/10">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Upcoming Viewings
              </CardTitle>
              <Button variant="outline" size="sm" asChild className="bg-white/50 backdrop-blur-sm border-white/30">
                <Link href="/admin/viewings">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {upcomingViewings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingViewings.map((viewing, index) => (
                    <motion.div
                      key={viewing.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="font-semibold text-slate-900 line-clamp-1">{viewing.property}</div>
                        <Badge
                          variant="secondary"
                          className={
                            viewing.status === "confirmed"
                              ? "bg-green-100/80 text-green-700 border border-green-200/50"
                              : viewing.status === "completed"
                                ? "bg-slate-100/80 text-slate-700 border border-slate-200/50"
                                : "bg-blue-100/80 text-blue-700 border border-blue-200/50"
                          }
                        >
                          {viewing.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span>{viewing.date}</span>
                        </div>
                        <div>Client: {viewing.client}</div>
                        <div>Agent: {viewing.agent}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No upcoming viewings have been scheduled.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Property Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card className="bg-white/40 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Property Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {propertyStats.length > 0 ? (
              <div className="space-y-4">
                {propertyStats.map((stat, index) => (
                  <motion.div
                    key={stat.type}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900">{stat.type}</span>
                      <span className="text-sm text-slate-600 font-semibold">
                        {stat.count} ({stat.percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/30">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.percentage}%` }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.8, type: "spring" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">No published properties yet.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { href: "/admin/properties/new", icon: Building2, label: "Add Property" },
          { href: "/admin/leads", icon: MessageSquare, label: "View Leads" },
          { href: "/admin/viewings", icon: Calendar, label: "Schedule Viewing" },
          { href: "/admin/agents", icon: Eye, label: "Manage Agents" },
        ].map((action, index) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              asChild
              className="w-full h-auto py-6 flex-col gap-2 bg-white/40 backdrop-blur-xl border border-white/20 hover:bg-white/60 shadow-lg hover:shadow-xl transition-all"
            >
              <Link href={action.href}>
                <action.icon className="h-6 w-6" />
                <span>{action.label}</span>
              </Link>
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

