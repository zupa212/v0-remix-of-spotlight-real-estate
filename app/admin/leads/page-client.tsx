"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminLeadsPipeline } from "@/components/admin-leads-pipeline"
import { AdminRecentLeadsTable } from "@/components/admin-recent-leads-table"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function AdminLeadsPageClient() {
  return (
    <AdminPageWrapper
      title="Leads"
      description="Manage and track your leads through the pipeline"
    >
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Leads</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Tabs */}
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>
        <TabsContent value="pipeline" className="space-y-4">
          <AdminLeadsPipeline />
        </TabsContent>
        <TabsContent value="table" className="space-y-4">
          <AdminRecentLeadsTable />
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  )
}


