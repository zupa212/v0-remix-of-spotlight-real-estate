import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
}

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {change && (
              <p
                className={`text-sm mt-2 ${
                  changeType === "positive"
                    ? "text-green-600"
                    : changeType === "negative"
                      ? "text-red-600"
                      : "text-slate-600"
                }`}
              >
                {change}
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-xl bg-sky-100 flex items-center justify-center">
            <Icon className="h-6 w-6 text-sky-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
