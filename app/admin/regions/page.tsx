'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, Star, MapPin, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react'
import Link from 'next/link'
import { AdminPageWrapper } from '@/components/admin-page-wrapper'
import { AdminGlassCard } from '@/components/admin-glass-card'
import { StatCard } from '@/components/stat-card'
import { motion } from 'framer-motion'
import { showToast } from '@/lib/toast'
import { AdminLoadingSkeleton } from '@/components/admin-loading-skeleton'

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
      <AdminPageWrapper title="Regions" description="Loading regions...">
        <AdminLoadingSkeleton />
      </AdminPageWrapper>
    )
  }

  const featuredCount = regions.filter(r => r.featured).length
  const withImagesCount = regions.filter(r => r.image_url).length

  return (
    <AdminPageWrapper
      title="Regions"
      description="Manage property regions and locations"
      headerActions={
        <Button asChild className="bg-white/40 backdrop-blur-xl border-white/20">
          <Link href="/admin/regions/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Region
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Regions"
            value={regions.length}
            icon={MapPin}
            index={0}
          />
          <StatCard
            title="Featured"
            value={featuredCount}
            icon={Star}
            index={1}
          />
          <StatCard
            title="With Images"
            value={withImagesCount}
            icon={ImageIcon}
            index={2}
          />
        </div>

        {/* Search */}
        <AdminGlassCard index={3}>
          <Input
            placeholder="Search regions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-white/60 backdrop-blur-sm border-white/30"
          />
        </AdminGlassCard>

        {/* Regions Table */}
        <AdminGlassCard index={4} className="overflow-hidden">
          <div className="overflow-x-auto">
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
                  <TableRow key={region.id} className="border-b border-white/10 hover:bg-white/30 transition-all duration-300">
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 bg-white/40 backdrop-blur-sm border border-white/30"
                          onClick={() => reorderRegion(region.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <span className="text-xs text-center text-slate-600">{region.display_order}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 bg-white/40 backdrop-blur-sm border border-white/30"
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
                            className="h-10 w-10 rounded object-cover border-2 border-white/30"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-slate-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-900">{region.name_en}</p>
                          <p className="text-sm text-slate-500">{region.name_gr}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-white/30 backdrop-blur-sm">{region.slug}</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm line-clamp-2 max-w-md text-slate-600">
                        {region.description_en || 'No description'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={region.featured ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFeatured(region.id, region.featured)}
                        className={region.featured ? "bg-yellow-500/80 backdrop-blur-sm border-yellow-300/30" : "bg-white/40 backdrop-blur-sm border-white/30"}
                      >
                        <Star className={`h-3 w-3 mr-1 ${region.featured ? 'fill-current' : ''}`} />
                        {region.featured ? 'Featured' : 'Feature'}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button variant="ghost" size="sm" asChild className="bg-white/40 backdrop-blur-sm border border-white/30">
                            <Link href={`/admin/regions/${region.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRegion(region.id, region.name_en)}
                            className="bg-red-500/20 backdrop-blur-sm border border-red-300/30 hover:bg-red-500/30"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </motion.div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRegions.length === 0 && (
            <div className="text-center py-12 text-slate-600">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No regions found</p>
              <Button className="mt-4 bg-white/40 backdrop-blur-xl border-white/20" asChild>
                <Link href="/admin/regions/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Region
                </Link>
              </Button>
            </div>
          )}
        </AdminGlassCard>
      </div>

      {/* Delete Dialog */}
      {deleteDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full mx-4 border border-white/20 shadow-2xl"
          >
            <h3 className="text-lg font-semibold mb-2 text-slate-900">Delete Region</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete "{deleteDialog.name}"? This may affect properties associated with this region.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteDialog(null)} className="bg-white/40 backdrop-blur-sm border-white/30">
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => confirmDelete(deleteDialog.id)} className="bg-red-500/80 backdrop-blur-sm border-red-300/30">
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AdminPageWrapper>
  )
}

