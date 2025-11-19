"use client"

import * as React from "react"
import Link from "next/link"
import { format } from "date-fns"
import { MoreHorizontal, Eye, Edit, Copy, Trash2, Download, UserPlus, CheckSquare } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useProperties, type Property } from "@/lib/hooks/use-properties"
import { useAgents } from "@/lib/hooks/use-agents"
import { AdminEmptyState } from "@/components/admin-empty-state"
import { Building2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import { createClient } from "@/lib/supabase/client"
import { deleteProperty } from "@/lib/actions/properties"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AdminPropertiesTableProps {
  filters?: {
    status?: string
    type?: string
    region?: string
    agent?: string
    published?: boolean
  }
  onEditProperty?: (property: Property) => void
}

export function AdminPropertiesTable({ filters = {}, onEditProperty }: AdminPropertiesTableProps) {
  const { data: properties, isLoading, isError, error, refetch } = useProperties(filters)
  const { data: agents } = useAgents()
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [bulkActionDialog, setBulkActionDialog] = React.useState<{
    open: boolean
    action: "publish" | "unpublish" | "delete" | null
  }>({ open: false, action: null })
  const [assignAgentId, setAssignAgentId] = React.useState<string>("")
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean
    propertyId: string | null
    propertyTitle: string
  }>({ open: false, propertyId: null, propertyTitle: "" })

  const supabase = createClient()

  const allSelected = properties && properties.length > 0 && selectedIds.size === properties.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < (properties?.length || 0)

  const handleSelectAll = (checked: boolean) => {
    if (checked && properties) {
      setSelectedIds(new Set(properties.map((p) => p.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkPublish = async (publish: boolean) => {
    if (selectedIds.size === 0) return

    try {
      const { error } = await supabase
        .from("properties")
        .update({ published: publish })
        .in("id", Array.from(selectedIds))

      if (error) throw error

      toast.success(
        `${selectedIds.size} propert${selectedIds.size === 1 ? "y" : "ies"} ${publish ? "published" : "unpublished"} successfully`
      )
      setSelectedIds(new Set())
      refetch()
    } catch (err: any) {
      toast.error(`Failed to ${publish ? "publish" : "unpublish"} properties: ${err.message}`)
    }
  }

  const handleBulkAssignAgent = async () => {
    if (selectedIds.size === 0 || !assignAgentId) return

    try {
      const { error } = await supabase
        .from("properties")
        .update({ agent_id: assignAgentId === "none" ? null : assignAgentId })
        .in("id", Array.from(selectedIds))

      if (error) throw error

      const agentName = assignAgentId === "none" 
        ? "unassigned" 
        : agents?.find((a) => a.id === assignAgentId)?.name_en || "agent"

      toast.success(
        `${selectedIds.size} propert${selectedIds.size === 1 ? "y" : "ies"} assigned to ${agentName}`
      )
      setSelectedIds(new Set())
      setAssignAgentId("")
      refetch()
    } catch (err: any) {
      toast.error(`Failed to assign agent: ${err.message}`)
    }
  }

  const handleBulkExport = () => {
    if (!properties || selectedIds.size === 0) return

    const selectedProperties = properties.filter((p) => selectedIds.has(p.id))
    const headers = [
      "Code",
      "Title (EN)",
      "Title (GR)",
      "City",
      "Type",
      "Status",
      "Price",
      "Beds",
      "Baths",
      "Area",
      "Published",
      "Updated",
    ]
    const rows = selectedProperties.map((p) => [
      p.property_code || "",
      p.title_en || "",
      p.title_gr || "",
      p.city_en || p.city_gr || "",
      p.property_type || "",
      p.status || "",
      p.price_sale?.toString() || "",
      p.bedrooms?.toString() || "",
      p.bathrooms?.toString() || "",
      p.area_sqm?.toString() || "",
      p.published ? "Yes" : "No",
      p.updated_at ? format(new Date(p.updated_at), "yyyy-MM-dd") : "",
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `properties-${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`Exported ${selectedIds.size} propert${selectedIds.size === 1 ? "y" : "ies"} to CSV`)
  }

  const handleDeleteClick = (property: Property) => {
    setDeleteDialog({
      open: true,
      propertyId: property.id,
      propertyTitle: property.title_en || property.title_gr || property.property_code || "this property",
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.propertyId) return

    const result = await deleteProperty(deleteDialog.propertyId)
    if (result.success) {
      toast.success("Property deleted successfully")
      refetch()
      setDeleteDialog({ open: false, propertyId: null, propertyTitle: "" })
    } else {
      toast.error(result.error || "Failed to delete property")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-sm text-muted-foreground">
        Failed to load properties. {error?.message}
      </div>
    )
  }

  if (!properties || properties.length === 0) {
    return (
      <AdminEmptyState
        icon={Building2}
        title="No properties yet"
        description="Get started by creating your first property or importing from CSV."
        actionLabel="Create Property"
        onAction={() => {
          window.location.href = "/admin/properties/new"
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedIds.size} propert{selectedIds.size === 1 ? "y" : "ies"} selected
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkPublish(true)}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              Publish
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkPublish(false)}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              Unpublish
            </Button>
            <div className="flex items-center gap-2">
              <Select value={assignAgentId} onValueChange={setAssignAgentId}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Assign to agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassign</SelectItem>
                  {agents?.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkAssignAgent}
                disabled={!assignAgentId}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Assign
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkExport}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all properties"
              />
            </TableHead>
            <TableHead className="w-[60px]">Cover</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>City/Region</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Beds/Baths/Area</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <ContextMenu key={property.id}>
              <ContextMenuTrigger asChild>
                <TableRow>
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(property.id)}
                  onCheckedChange={(checked) => handleSelectOne(property.id, checked as boolean)}
                  aria-label={`Select property ${property.property_code || property.id}`}
                />
              </TableCell>
              <TableCell>
              <Avatar className="h-10 w-10">
                <AvatarImage src={property.main_image_url || undefined} alt={property.property_code || ""} />
                <AvatarFallback>
                  {property.property_code?.charAt(0) || "P"}
                </AvatarFallback>
              </Avatar>
            </TableCell>
            <TableCell className="font-medium">
              {property.property_code || "—"}
            </TableCell>
            <TableCell>
              {property.title_en || property.title_gr || "Untitled"}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {property.city_en || property.city_gr || "—"}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{property.property_type || "—"}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{property.status || "draft"}</Badge>
            </TableCell>
            <TableCell className="font-medium">
              {property.price_sale ? formatCurrency(property.price_sale) : "—"}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {property.bedrooms || 0}/{property.bathrooms || 0}/{property.area_sqm ? `${property.area_sqm}m²` : "—"}
            </TableCell>
            <TableCell>
              {property.published ? (
                <Badge variant="default">Published</Badge>
              ) : (
                <Badge variant="outline">Draft</Badge>
              )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {property.updated_at
                ? format(new Date(property.updated_at), "MMM d, yyyy")
                : "—"}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Open property menu">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/properties/${property.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      if (onEditProperty) {
                        onEditProperty(property)
                      } else {
                        window.location.href = `/admin/properties/${property.id}/edit`
                      }
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDeleteClick(property)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem asChild>
                  <Link href={`/admin/properties/${property.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    if (onEditProperty) {
                      onEditProperty(property)
                    } else {
                      window.location.href = `/admin/properties/${property.id}/edit`
                    }
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </ContextMenuItem>
                <ContextMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  className="text-destructive"
                  onClick={() => handleDeleteClick(property)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
        ))}
      </TableBody>
    </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the property "{deleteDialog.propertyTitle}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

