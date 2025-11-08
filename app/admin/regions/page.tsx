'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Plus, Edit, Trash2, Star, MapPin, Image as ImageIcon } from 'lucide-react'

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

  async function deleteRegion(regionId: string) {
    if (!confirm('Are you sure you want to delete this region? This may affect properties.')) return

    const { error } = await supabase
      .from('regions')
      .delete()
      .eq('id', regionId)

    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      fetchRegions()
    }
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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Region
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
              <TableHead>Region</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegions.map((region) => (
              <TableRow key={region.id}>
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
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRegion(region.id)}
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
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add First Region
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

