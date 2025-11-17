"use client"

import * as React from "react"
import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AdminPropertiesTable } from "@/components/admin-properties-table"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent } from "@/components/ui/card"
import { AdminPropertyFormSheet } from "@/components/admin-property-form-sheet"
import type { Property } from "@/lib/hooks/use-properties"
import { useRegions } from "@/lib/hooks/use-regions"
import { useAgents } from "@/lib/hooks/use-agents"

export function AdminPropertiesPageClient() {
  const [filters, setFilters] = React.useState({
    status: "all",
    type: "all",
    region: "all",
    agent: "all",
    published: undefined as boolean | undefined,
  })
  
  const { data: regions } = useRegions()
  const { data: agents } = useAgents()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)

  const handleCreate = () => {
    setEditingProperty(null)
    setIsSheetOpen(true)
  }

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property)
    setIsSheetOpen(true)
  }

  return (
    <AdminPageWrapper
      title="Properties"
      description="Manage your property listings"
      headerActions={
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Property
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
            <BreadcrumbPage>Properties</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-5">
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
                <SelectItem value="off-market">Off Market</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="land">Land</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="office">Office</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.region}
              onValueChange={(value) => setFilters({ ...filters, region: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {(regions || []).map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.agent}
              onValueChange={(value) => setFilters({ ...filters, agent: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {(agents || []).map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={
                filters.published === undefined
                  ? "all"
                  : filters.published
                    ? "published"
                    : "draft"
              }
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  published: value === "all" ? undefined : value === "published",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Published" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <AdminPropertiesTable filters={filters} onEditProperty={handleEditProperty} />

      <AdminPropertyFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        property={editingProperty}
      />
    </AdminPageWrapper>
  )
}
