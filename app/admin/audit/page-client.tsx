"use client"

import * as React from "react"
import { AdminAuditLogsTable } from "@/components/admin-audit-logs-table"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function AdminAuditPageClient() {
  return (
    <AdminPageWrapper
      title="Audit Logs"
      description="Track all system changes and user actions"
    >
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Audit Logs</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Audit Logs Table */}
      <AdminAuditLogsTable />
    </AdminPageWrapper>
  )
}


