"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AreaSeriesCard } from "@/components/charts/area-series-card"
import { BarByRegion } from "@/components/charts/bar-by-region"
import { DonutCard } from "@/components/charts/donut-card"
import { ConversionFunnel } from "@/components/charts/conversion-funnel"
import { LeadSourceBar } from "@/components/charts/lead-source-bar"
import { PropertyPerformanceTable } from "@/components/charts/property-performance-table"
import { AdminAgentsLeagueTable } from "@/components/admin-agents-league-table"
import { usePropertyDistribution } from "@/lib/hooks/use-property-distribution"
import { usePipelineSeries } from "@/lib/hooks/use-pipeline-series"
import { useConversionFunnel } from "@/lib/hooks/use-conversion-funnel"
import { useLeadSourceAnalytics } from "@/lib/hooks/use-lead-source-analytics"
import { usePropertyPerformance } from "@/lib/hooks/use-property-performance"
import { usePageViewsAnalytics, usePageViewsByRoute } from "@/lib/hooks/use-page-views-analytics"
import { useInventoryMetrics } from "@/lib/hooks/use-inventory-metrics"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const [rangeDays, setRangeDays] = React.useState(30)
  const { data: propertyDistByType, isLoading: distTypeLoading, error: distTypeError } = usePropertyDistribution("type")
  const { data: propertyDistByRegion, isLoading: distRegionLoading, error: distRegionError } = usePropertyDistribution("region")
  const { data: pipelineData, isLoading: pipelineLoading, error: pipelineError } = usePipelineSeries(rangeDays)
  const { data: funnelData, isLoading: funnelLoading, error: funnelError } = useConversionFunnel()
  const { data: leadSourceData, isLoading: leadSourceLoading, error: leadSourceError } = useLeadSourceAnalytics(rangeDays)
  const { data: propertyPerformance, isLoading: propertyPerfLoading, error: propertyPerfError } = usePropertyPerformance(10, rangeDays)
  const { data: pageViewsData, isLoading: pageViewsLoading, error: pageViewsError } = usePageViewsAnalytics(rangeDays)
  const { data: pageViewsByRoute, isLoading: pageViewsByRouteLoading, error: pageViewsByRouteError } = usePageViewsByRoute(rangeDays)
  const { data: inventoryMetrics, isLoading: inventoryLoading, error: inventoryError } = useInventoryMetrics()

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

      {/* Time Range Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Time Range:</span>
          <Select value={rangeDays.toString()} onValueChange={(value) => setRangeDays(Number(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
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
                <div>
                  <CardTitle>Inventory Metrics</CardTitle>
                  <CardDescription>Key metrics about your property inventory</CardDescription>
                </div>
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
                {inventoryLoading ? (
                  <div className="text-sm text-muted-foreground">Loading metrics...</div>
                ) : inventoryError ? (
                  <div className="text-sm text-destructive">Error loading metrics: {inventoryError.message}</div>
                ) : inventoryMetrics ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Properties</div>
                      <div className="text-2xl font-bold">{inventoryMetrics.totalProperties}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Published Properties</div>
                      <div className="text-2xl font-bold">{inventoryMetrics.publishedProperties}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Published Coverage</div>
                      <div className="text-2xl font-bold">{inventoryMetrics.publishedCoverage.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Avg Days on Market</div>
                      <div className="text-2xl font-bold">{inventoryMetrics.averageDaysOnMarket}</div>
                    </div>
                    <div className="col-span-full">
                      <div className="text-sm font-medium mb-2">Properties by Status</div>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Draft</div>
                          <div className="text-lg font-semibold">{inventoryMetrics.propertiesByStatus.draft}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Published</div>
                          <div className="text-lg font-semibold">{inventoryMetrics.propertiesByStatus.published}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Sold</div>
                          <div className="text-lg font-semibold">{inventoryMetrics.propertiesByStatus.sold}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Rented</div>
                          <div className="text-lg font-semibold">{inventoryMetrics.propertiesByStatus.rented}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div id="lead-source-chart">
              <LeadSourceBar
                data={leadSourceData}
                title="Leads by Source"
                isLoading={leadSourceLoading}
                error={leadSourceError}
              />
            </div>
            <div id="conversion-funnel-leads">
              <ConversionFunnel
                data={funnelData}
                isLoading={funnelLoading}
                error={funnelError}
                title="Lead Conversion Funnel"
              />
            </div>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Export Lead Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleExportPNG("lead-source-chart", "lead-sources.png")}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Lead Sources Chart (PNG)
              </Button>
              {leadSourceData && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    handleExportCSV(
                      leadSourceData,
                      "lead-sources.csv",
                      ["source", "count", "converted", "conversionRate"]
                    )
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Lead Sources Data (CSV)
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <PropertyPerformanceTable
            data={propertyPerformance}
            title="Top Performing Properties"
            isLoading={propertyPerfLoading}
            error={propertyPerfError}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Page Views Over Time</CardTitle>
                <CardDescription>Total page views in the last {rangeDays} days</CardDescription>
              </CardHeader>
              <CardContent>
                {pageViewsLoading ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : pageViewsError ? (
                  <div className="text-sm text-destructive">Error: {pageViewsError.message}</div>
                ) : pageViewsData && pageViewsData.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {pageViewsData.reduce((sum, d) => sum + d.views, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {pageViewsData.reduce((sum, d) => sum + d.uniqueViews, 0).toLocaleString()} unique views
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No page view data available</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most viewed pages</CardDescription>
              </CardHeader>
              <CardContent>
                {pageViewsByRouteLoading ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : pageViewsByRouteError ? (
                  <div className="text-sm text-destructive">Error: {pageViewsByRouteError.message}</div>
                ) : pageViewsByRoute && pageViewsByRoute.length > 0 ? (
                  <div className="space-y-2">
                    {pageViewsByRoute.slice(0, 5).map((route) => (
                      <div key={route.route} className="flex items-center justify-between">
                        <div className="text-sm truncate flex-1">{route.route}</div>
                        <div className="text-sm font-semibold ml-4">{route.views} views</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No page view data available</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <AdminAgentsLeagueTable />
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  )
}


