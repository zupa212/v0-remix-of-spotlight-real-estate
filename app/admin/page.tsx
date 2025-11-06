import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MessageSquare, Calendar, TrendingUp, Eye, Clock } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/admin/login")
  }

  // Mock data - in production, fetch from Supabase
  const stats = {
    totalProperties: 156,
    activeLeads: 42,
    scheduledViewings: 18,
    monthlyRevenue: 125000,
  }

  const recentLeads = [
    {
      id: "1",
      name: "John Anderson",
      email: "john@example.com",
      property: "Luxury Villa with Sea View",
      status: "new",
      createdAt: "2 hours ago",
    },
    {
      id: "2",
      name: "Maria Schmidt",
      email: "maria@example.com",
      property: "Modern Apartment in City Center",
      status: "contacted",
      createdAt: "5 hours ago",
    },
    {
      id: "3",
      name: "David Chen",
      email: "david@example.com",
      property: "Beachfront House",
      status: "qualified",
      createdAt: "1 day ago",
    },
  ]

  const upcomingViewings = [
    {
      id: "1",
      property: "Luxury Villa with Sea View",
      client: "Sarah Johnson",
      date: "Today, 2:00 PM",
      agent: "Maria Papadopoulos",
      status: "confirmed",
    },
    {
      id: "2",
      property: "Penthouse with Acropolis View",
      client: "Michael Brown",
      date: "Tomorrow, 10:00 AM",
      agent: "Dimitris Konstantinou",
      status: "scheduled",
    },
    {
      id: "3",
      property: "Waterfront Apartment",
      client: "Emma Wilson",
      date: "Tomorrow, 3:00 PM",
      agent: "Elena Georgiou",
      status: "scheduled",
    },
  ]

  const propertyStats = [
    { type: "Villa", count: 45, percentage: 29 },
    { type: "Apartment", count: 68, percentage: 44 },
    { type: "House", count: 32, percentage: 20 },
    { type: "Commercial", count: 11, percentage: 7 },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-600">Welcome back! Here's what's happening today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Properties"
              value={stats.totalProperties}
              change="+12 this month"
              changeType="positive"
              icon={Building2}
            />
            <StatCard
              title="Active Leads"
              value={stats.activeLeads}
              change="+8 this week"
              changeType="positive"
              icon={MessageSquare}
            />
            <StatCard
              title="Scheduled Viewings"
              value={stats.scheduledViewings}
              change="5 today"
              changeType="neutral"
              icon={Calendar}
            />
            <StatCard
              title="Monthly Revenue"
              value={`€${stats.monthlyRevenue.toLocaleString()}`}
              change="+15% vs last month"
              changeType="positive"
              icon={TrendingUp}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Leads */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Leads</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/leads">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-slate-600">
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
                                ? "bg-blue-100 text-blue-700"
                                : lead.status === "contacted"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-green-100 text-green-700"
                            }
                          >
                            {lead.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 truncate mb-1">{lead.property}</p>
                        <p className="text-xs text-slate-500">{lead.createdAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Viewings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Viewings</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/viewings">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingViewings.map((viewing) => (
                    <div
                      key={viewing.id}
                      className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="font-semibold text-slate-900 line-clamp-1">{viewing.property}</div>
                        <Badge
                          variant="secondary"
                          className={
                            viewing.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                          }
                        >
                          {viewing.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{viewing.date}</span>
                        </div>
                        <div>Client: {viewing.client}</div>
                        <div>Agent: {viewing.agent}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Property Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {propertyStats.map((stat) => (
                  <div key={stat.type}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900">{stat.type}</span>
                      <span className="text-sm text-slate-600">
                        {stat.count} ({stat.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-600 rounded-full transition-all"
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild className="h-auto py-6 flex-col gap-2">
              <Link href="/admin/properties/new">
                <Building2 className="h-6 w-6" />
                <span>Add Property</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent">
              <Link href="/admin/leads">
                <MessageSquare className="h-6 w-6" />
                <span>View Leads</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent">
              <Link href="/admin/viewings">
                <Calendar className="h-6 w-6" />
                <span>Schedule Viewing</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent">
              <Link href="/admin/agents">
                <Eye className="h-6 w-6" />
                <span>Manage Agents</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
