"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AreaSeriesCard } from "@/components/charts/area-series-card"
import { BarByRegion } from "@/components/charts/bar-by-region"
import { DonutCard } from "@/components/charts/donut-card"
import { ConversionFunnel } from "@/components/charts/conversion-funnel"
import { AdminAgentsLeagueTable } from "@/components/admin-agents-league-table"
import { usePropertyDistribution } from "@/lib/hooks/use-property-distribution"
import { usePipelineSeries } from "@/lib/hooks/use-pipeline-series"
import { useConversionFunnel } from "@/lib/hooks/use-conversion-funnel"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportChartAsPNG, exportDataAsCSV } from "@/lib/utils/chart-export"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { toast } from "sonner"

export function AdminAnalyticsPageClient() {
  const { data: propertyDistByType, isLoading: distTypeLoading, error: distTypeError } = usePropertyDistribution("type")
  const { data: propertyDistByRegion, isLoading: distRegionLoading, error: distRegionError } = usePropertyDistribution("region")
  const { data: pipelineData, isLoading: pipelineLoading, error: pipelineError } = usePipelineSeries(30)
  const { data: funnelData, isLoading: funnelLoading, error: funnelError } = useConversionFunnel()

  const handleExportPNG = (chartId: string, filename: string) => {
    exportChartAsPNG(chartId, filename)
      .then(() => toast.success("Chart exported as PNG"))
      .catch((err) => toast.error(`Failed to export: ${err.message}`))
  }

  const handleExportCSV = (data: any[], filename: string, headers?: string[]) => {
    try {
      exportDataAsCSV(data, filename, headers)
      toast.success("Data exported as CSV")
    } catch (err: any) {
      toast.error(`Failed to export: ${err.message}`)
    }
  }

  return (
    <AdminPageWrapper
      title="Analytics"
      description="Insights and analytics for your real estate operations"
    >
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Analytics</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div id="pipeline-chart">
              <AreaSeriesCard
                data={pipelineData}
                title="Pipeline Trends"
                isLoading={pipelineLoading}
                error={pipelineError}
              />
            </div>
            <div id="property-type-chart">
              <DonutCard
                data={propertyDistByType}
                title="Property Distribution by Type"
                isLoading={distTypeLoading}
                error={distTypeError}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div id="conversion-funnel-chart">
              <ConversionFunnel
                data={funnelData}
                isLoading={funnelLoading}
                error={funnelError}
                title="Conversion Funnel"
              />
            </div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleExportPNG("pipeline-chart", "pipeline-trends.png")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Pipeline Chart (PNG)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleExportPNG("property-type-chart", "property-distribution.png")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Distribution Chart (PNG)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleExportPNG("conversion-funnel-chart", "conversion-funnel.png")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Funnel Chart (PNG)
                </Button>
                {pipelineData && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      handleExportCSV(
                        pipelineData,
                        "pipeline-data.csv",
                        ["date", "leads", "viewings", "offers", "won"]
                      )
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Pipeline Data (CSV)
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4">
            <div id="region-chart">
              <BarByRegion
                data={propertyDistByRegion}
                title="Properties by Region"
                isLoading={distRegionLoading}
                error={distRegionError}
              />
            </div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Inventory Metrics</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportPNG("region-chart", "properties-by-region.png")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export PNG
                  </Button>
                  {propertyDistByRegion && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleExportCSV(propertyDistByRegion, "properties-by-region.csv", ["region", "count"])
                      }
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Average days on market, published coverage, and other inventory metrics will be displayed here.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Lead conversion funnel, source analysis, and lead scoring metrics will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <AdminAgentsLeagueTable />
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  )
}


