"use client"

import * as React from "react"
import { AdminViewingsList } from "@/components/admin-viewings-list"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function AdminViewingsPageClient() {
  return (
    <AdminPageWrapper
      title="Viewings"
      description="Manage scheduled property viewings"
    >
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Viewings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Viewings List */}
      <AdminViewingsList />
    </AdminPageWrapper>
  )
}


