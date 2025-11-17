"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { useSavedSearches } from "@/lib/hooks/use-saved-searches"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function AdminMarketingPageClient() {
  const { data: savedSearches, isLoading, isError, error } = useSavedSearches()

  return (
    <AdminPageWrapper
      title="Marketing"
      description="Manage saved searches, alerts, and syndication feeds"
    >
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Marketing</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Tabs */}
      <Tabs defaultValue="searches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="searches">Saved Searches & Alerts</TabsTrigger>
          <TabsTrigger value="syndication">Syndication Feeds</TabsTrigger>
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
        </TabsList>

        <TabsContent value="searches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Searches & Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : isError ? (
                <div className="text-sm text-muted-foreground">
                  Failed to load saved searches. {error?.message}
                </div>
              ) : !savedSearches || savedSearches.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No saved searches yet. Create one to start sending alerts to leads.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Channels</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Sent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedSearches.map((search) => (
                      <TableRow key={search.id}>
                        <TableCell className="font-medium">{search.name}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {search.channels.map((channel) => (
                              <Badge key={channel} variant="outline" className="text-xs">
                                {channel}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{search.frequency}</TableCell>
                        <TableCell>
                          <Badge
                            variant={search.status === "active" ? "default" : "secondary"}
                          >
                            {search.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {search.last_sent
                            ? format(new Date(search.last_sent), "MMM d, yyyy")
                            : "Never"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="syndication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Syndication Feeds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Spitogatos</h4>
                  <p className="text-sm text-muted-foreground">Greek property portal</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">XE.gr</h4>
                  <p className="text-sm text-muted-foreground">Greek property portal</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Idealista</h4>
                  <p className="text-sm text-muted-foreground">International property portal</p>
                </div>
                <Switch />
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline">Rebuild All Feeds</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>A/B Experiments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                A/B testing experiments for routes, variants, and metrics will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  )
}


