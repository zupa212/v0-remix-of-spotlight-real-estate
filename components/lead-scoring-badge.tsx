"use client"

import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

type LeadScoringBadgeProps = {
  score: number
}

export function LeadScoringBadge({ score }: LeadScoringBadgeProps) {
  const getScoreLevel = (score: number) => {
    if (score >= 70) return { label: "Hot", color: "bg-red-100 text-red-800", icon: TrendingUp }
    if (score >= 40) return { label: "Warm", color: "bg-amber-100 text-amber-800", icon: Minus }
    return { label: "Cold", color: "bg-blue-100 text-blue-800", icon: TrendingDown }
  }

  const level = getScoreLevel(score)
  const Icon = level.icon

  return (
    <Badge className={`${level.color} gap-1`}>
      <Icon className="h-3 w-3" />
      {level.label} ({score})
    </Badge>
  )
}
