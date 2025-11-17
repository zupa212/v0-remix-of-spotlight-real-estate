"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminRegionsGrid } from "@/components/admin-regions-grid"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import { AdminRegionFormSheet } from "@/components/admin-region-form-sheet"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { Region } from "@/lib/hooks/use-regions"

export function AdminRegionsPageClient() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [editingRegion, setEditingRegion] = React.useState<Region | undefined>(undefined)

  const handleNewRegionClick = () => {
    setEditingRegion(undefined)
    setIsSheetOpen(true)
  }

  const handleEditRegion = (region: Region) => {
    setEditingRegion(region)
    setIsSheetOpen(true)
  }

  return (
    <AdminPageWrapper
      title="Regions"
      description="Manage property regions and locations"
      headerActions={
        <Button onClick={handleNewRegionClick}>
          <Plus className="mr-2 h-4 w-4" />
          New Region
        </Button>
      }
    >
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Regions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Regions Grid */}
      <AdminRegionsGrid onEditRegion={handleEditRegion} />

      {/* Region Create/Edit Sheet */}
      <AdminRegionFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        initialData={editingRegion}
      />
    </AdminPageWrapper>
  )
}


