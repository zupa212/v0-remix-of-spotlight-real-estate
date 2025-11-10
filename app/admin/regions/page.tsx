'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Plus, Edit, Trash2, Star, MapPin, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react'
import Link from 'next/link'

interface Region {
  id: string
  name_en: string
  name_gr: string
  slug: string
  description_en: string
  description_gr: string
  image_url: string
  featured: boolean
  display_order: number
  created_at: string
}

export default function AdminRegionsPage() {
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchRegions()

    // Realtime subscription
    const channel = supabase
      .channel('regions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'regions' }, () => {
        fetchRegions()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchRegions() {
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .order('display_order', { ascending: true })

    if (!error && data) {
      setRegions(data)
    }
    setLoading(false)
  }

  async function toggleFeatured(regionId: string, currentFeatured: boolean) {
    const { error } = await supabase
      .from('regions')
      .update({ featured: !currentFeatured })
      .eq('id', regionId)

    if (!error) {
      fetchRegions()
    }
  }

  const [deleteDialog, setDeleteDialog] = useState<{ id: string; name: string } | null>(null)

  async function deleteRegion(regionId: string, regionName: string) {
    setDeleteDialog({ id: regionId, name: regionName })
  }

  async function confirmDelete(regionId: string) {
    const { error } = await supabase.from('regions').delete().eq('id', regionId)

    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      fetchRegions()
      setDeleteDialog(null)
    }
  }

  async function reorderRegion(regionId: string, direction: 'up' | 'down') {
    const region = regions.find((r) => r.id === regionId)
    if (!region) return

    const currentOrder = region.display_order
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1

    // Find the region that should swap positions
    const swapRegion = regions.find((r) => r.display_order === newOrder)
    if (!swapRegion) return

    // Swap display orders
    await Promise.all([
      supabase.from('regions').update({ display_order: newOrder }).eq('id', regionId),
      supabase.from('regions').update({ display_order: currentOrder }).eq('id', swapRegion.id),
    ])

    fetchRegions()
  }

  const filteredRegions = regions.filter(region =>
    region.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.name_gr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Regions Management</h1>
          <p className="text-muted-foreground">Manage property regions and locations</p>
        </div>
        <Button asChild>
          <Link href="/admin/regions/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Region
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Regions</p>
              <p className="text-2xl font-bold">{regions.length}</p>
            </div>
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Featured</p>
              <p className="text-2xl font-bold">
                {regions.filter(r => r.featured).length}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">With Images</p>
              <p className="text-2xl font-bold">
                {regions.filter(r => r.image_url).length}
              </p>
            </div>
            <ImageIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <Input
          placeholder="Search regions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </Card>

      {/* Regions Table */}
      <Card>
        <Table>
          <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegions.map((region, index) => (
              <TableRow key={region.id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => reorderRegion(region.id, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <span className="text-xs text-center">{region.display_order}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => reorderRegion(region.id, 'down')}
                      disabled={index === filteredRegions.length - 1}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {region.image_url ? (
                      <img
                        src={region.image_url}
                        alt={region.name_en}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <MapPin className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{region.name_en}</p>
                      <p className="text-sm text-muted-foreground">{region.name_gr}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{region.slug}</Badge>
                </TableCell>
                <TableCell>
                  <p className="text-sm line-clamp-2 max-w-md">
                    {region.description_en || 'No description'}
                  </p>
                </TableCell>
                <TableCell>
                  <Button
                    variant={region.featured ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFeatured(region.id, region.featured)}
                  >
                    <Star className={`h-3 w-3 mr-1 ${region.featured ? 'fill-current' : ''}`} />
                    {region.featured ? 'Featured' : 'Feature'}
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/regions/${region.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRegion(region.id, region.name_en)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredRegions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No regions found</p>
            <Button className="mt-4" asChild>
              <Link href="/admin/regions/new">
                <Plus className="h-4 w-4 mr-2" />
                Add First Region
              </Link>
            </Button>
          </div>
        )}
      </Card>

      {/* Delete Dialog */}
      {deleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Region</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete "{deleteDialog.name}"? This may affect properties associated with this region.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => confirmDelete(deleteDialog.id)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

