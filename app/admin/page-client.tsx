"use client"

import * as React from "react"
import { Building2, Users, Calendar, DollarSign } from "lucide-react"
import { AdminKpiCard } from "@/components/admin-kpi-card"
import { AdminErrorAlert } from "@/components/admin-error-alert"
import { AdminRecentLeadsTable } from "@/components/admin-recent-leads-table"
import { AdminUpcomingViewingsList } from "@/components/admin-upcoming-viewings-list"
import { DonutCard } from "@/components/charts/donut-card"
import { AreaSeriesCard } from "@/components/charts/area-series-card"
import { useKpis } from "@/lib/hooks/use-kpis"
import { usePropertyDistribution } from "@/lib/hooks/use-property-distribution"
import { usePipelineSeries } from "@/lib/hooks/use-pipeline-series"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import { AdminOnboardingChecklist } from "@/components/admin-onboarding-checklist"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function AdminDashboardClient() {
  const { data: kpis, isLoading: kpisLoading, isError: kpisError, error: kpisErrorObj, refetch: refetchKpis } = useKpis()
  const { data: propertyDist, isLoading: distLoading, isError: distError, error: distErrorObj } = usePropertyDistribution("type")
  const { data: pipelineData, isLoading: pipelineLoading, isError: pipelineError, error: pipelineErrorObj } = usePipelineSeries(30)

  const errors: string[] = []
  if (kpisError) {
    errors.push("Failed to load dashboard KPIs")
  }
  if (distError) {
    errors.push("Failed to load property distribution")
  }
  if (pipelineError) {
    errors.push("Failed to load pipeline trends")
  }

  return (
    <AdminPageWrapper
      title="Dashboard"
      description="Overview of your real estate operations"
    >
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Overview</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Onboarding Checklist */}
      <AdminOnboardingChecklist />

      {/* Error Alert Strip */}
      {errors.length > 0 && (
        <div className="mb-6">
          {errors.map((errorMsg, idx) => (
            <AdminErrorAlert
              key={idx}
              description={errorMsg}
              onRetry={() => {
                refetchKpis()
                // Add other refetch calls if needed
              }}
            />
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <AdminKpiCard
          title="Total Properties"
          value={kpis?.totalProperties ?? 0}
          delta={kpis?.totalPropertiesDelta}
          deltaLabel="vs last month"
          icon={Building2}
          isLoading={kpisLoading}
        />
        <AdminKpiCard
          title="Active Leads"
          value={kpis?.activeLeads ?? 0}
          delta={kpis?.activeLeadsDelta}
          deltaLabel="vs last week"
          icon={Users}
          isLoading={kpisLoading}
        />
        <AdminKpiCard
          title="Scheduled Viewings"
          value={kpis?.scheduledViewings ?? 0}
          delta={kpis?.scheduledViewingsDelta}
          deltaLabel="vs last week"
          icon={Calendar}
          isLoading={kpisLoading}
        />
        <AdminKpiCard
          title="Monthly Revenue"
          value={kpis?.monthlyRevenue ? `€${kpis.monthlyRevenue.toLocaleString()}` : "€0"}
          delta={kpis?.monthlyRevenueDelta}
          deltaLabel="vs last month"
          icon={DollarSign}
          isLoading={kpisLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <DonutCard
          data={propertyDist}
          title="Property Distribution"
          isLoading={distLoading}
          error={distErrorObj}
        />
        <AreaSeriesCard
          data={pipelineData}
          title="Pipeline Trends"
          isLoading={pipelineLoading}
          error={pipelineErrorObj}
        />
      </div>

      {/* Recent Leads and Upcoming Viewings */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminRecentLeadsTable />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Viewings</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminUpcomingViewingsList />
          </CardContent>
        </Card>
      </div>
    </AdminPageWrapper>
  )
}

