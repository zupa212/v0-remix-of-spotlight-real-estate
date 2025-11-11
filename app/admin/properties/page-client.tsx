"use client"

import { useState, useEffect } from "react"
import React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { PropertyDeleteDialog } from "@/components/property-delete-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Eye, Edit, MoreVertical, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type AdminPropertyRow = {
  id: string
  propertyCode: string
  titleEn: string
  location: string
  propertyType: string
  listingType: string
  priceSale: number | null
  priceRent: number | null
  currency: string
  status: string
  published: boolean
  createdAt: string
  displayPrice: string
}

interface PropertiesTableClientProps {
  properties: AdminPropertyRow[]
}

export function PropertiesTableClient({ properties: initialProperties }: PropertiesTableClientProps) {
  const [properties, setProperties] = useState(initialProperties)
  const [filteredProperties, setFilteredProperties] = useState(initialProperties)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteDialog, setDeleteDialog] = useState<{ id: string; title: string } | null>(null)
  const [updating, setUpdating] = useState<Set<string>>(new Set())

  // Filter properties based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProperties(properties)
      return
    }

    const filtered = properties.filter(
      (property) =>
        property.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.propertyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProperties(filtered)
  }, [searchTerm, properties])

  const handleTogglePublished = async (propertyId: string, currentPublished: boolean) => {
    setUpdating((prev) => new Set(prev).add(propertyId))
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("properties")
        .update({ published: !currentPublished })
        .eq("id", propertyId)

      if (error) throw error

      setProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? { ...p, published: !currentPublished } : p))
      )
    } catch (error) {
      console.error("Error updating property:", error)
      alert("Failed to update property. Please try again.")
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev)
        next.delete(propertyId)
        return next
      })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} property/properties?`)) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("properties").delete().in("id", Array.from(selectedIds))

      if (error) throw error

      setProperties((prev) => prev.filter((p) => !selectedIds.has(p.id)))
      setSelectedIds(new Set())
      window.location.reload()
    } catch (error) {
      console.error("Error deleting properties:", error)
      alert("Failed to delete properties. Please try again.")
    }
  }

  const handleBulkPublish = async (publish: boolean) => {
    if (selectedIds.size === 0) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("properties")
        .update({ published: publish })
        .in("id", Array.from(selectedIds))

      if (error) throw error

      setProperties((prev) =>
        prev.map((p) => (selectedIds.has(p.id) ? { ...p, published: publish } : p))
      )
      setSelectedIds(new Set())
      window.location.reload()
    } catch (error) {
      console.error("Error updating properties:", error)
      alert("Failed to update properties. Please try again.")
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === properties.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(properties.map((p) => p.id)))
    }
  }

  return (
    <>
      {/* Search */}
      <div className="mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search properties..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-4 p-4 bg-slate-100 rounded-lg">
          <span className="text-sm font-medium text-slate-700">
            {selectedIds.size} property/properties selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleBulkPublish(true)}>
              Publish Selected
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkPublish(false)}>
              Unpublish Selected
            </Button>
            <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Properties Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {properties.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.size === properties.length && properties.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Property Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
        <TableBody>
          {filteredProperties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <Checkbox checked={selectedIds.has(property.id)} onCheckedChange={() => toggleSelect(property.id)} />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{property.propertyCode}</TableCell>
                  <TableCell className="font-medium">{property.titleEn}</TableCell>
                  <TableCell className="text-slate-600">{property.location}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {property.propertyType}
                    </Badge>
                  </TableCell>
                  <TableCell>{property.displayPrice}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        property.status === "available"
                          ? "bg-green-100 text-green-700"
                          : property.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                      }
                    >
                      {property.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={property.published}
                      onCheckedChange={() => handleTogglePublished(property.id, property.published)}
                      disabled={updating.has(property.id)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/properties/${property.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/properties/${property.id}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            View Public
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/properties/${property.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteDialog({ id: property.id, title: property.titleEn })}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-slate-600">
            No properties found. Create your first listing to get started.
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      {deleteDialog && (
        <PropertyDeleteDialog
          propertyId={deleteDialog.id}
          propertyTitle={deleteDialog.title}
          open={!!deleteDialog}
          onOpenChange={(open) => !open && setDeleteDialog(null)}
        />
      )}
    </>
  )
}

