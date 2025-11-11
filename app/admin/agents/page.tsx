'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminSidebar } from '@/components/admin-sidebar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Plus, Edit, Trash2, Star, Mail, Phone, User } from 'lucide-react'
import Link from 'next/link'
import { PropertyDeleteDialog } from '@/components/property-delete-dialog'

interface Agent {
  id: string
  name_en: string
  name_gr: string
  email: string
  phone: string
  bio_en: string
  bio_gr: string
  avatar_url: string
  languages: string[]
  specialties: string[]
  featured: boolean
  display_order: number
  created_at: string
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchAgents()

    // Realtime subscription
    const channel = supabase
      .channel('agents-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => {
        fetchAgents()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchAgents() {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('display_order', { ascending: true })

    if (!error && data) {
      setAgents(data)
    }
    setLoading(false)
  }

  async function toggleFeatured(agentId: string, currentFeatured: boolean) {
    const { error } = await supabase
      .from('agents')
      .update({ featured: !currentFeatured })
      .eq('id', agentId)

    if (!error) {
      fetchAgents()
    }
  }

  const [deleteDialog, setDeleteDialog] = useState<{ id: string; name: string } | null>(null)

  async function deleteAgent(agentId: string, agentName: string) {
    setDeleteDialog({ id: agentId, name: agentName })
  }

  async function confirmDelete(agentId: string) {
    const { error } = await supabase.from('agents').delete().eq('id', agentId)

    if (!error) {
      fetchAgents()
      setDeleteDialog(null)
    } else {
      alert('Failed to delete agent. Please try again.')
    }
  }

  const filteredAgents = agents.filter(agent =>
    agent.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminSidebar />
        <div className="lg:pl-64">
          <div className="p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      
      <div className="lg:pl-64">
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
          <h1 className="text-3xl font-bold">Agents Management</h1>
          <p className="text-muted-foreground">Manage your real estate agents</p>
        </div>
        <Button asChild>
          <Link href="/admin/agents/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Agents</p>
              <p className="text-2xl font-bold">{agents.length}</p>
            </div>
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Featured</p>
              <p className="text-2xl font-bold">
                {agents.filter(a => a.featured).length}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{agents.length}</p>
            </div>
            <User className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <Input
          placeholder="Search agents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </Card>

      {/* Agents Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead>Specialties</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {agent.avatar_url ? (
                      <img
                        src={agent.avatar_url}
                        alt={agent.name_en}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{agent.name_en}</p>
                      <p className="text-sm text-muted-foreground">{agent.name_gr}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3" />
                      <span>{agent.email}</span>
                    </div>
                    {agent.phone && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{agent.phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {agent.languages?.map((lang) => (
                      <Badge key={lang} variant="outline" className="text-xs">
                        {lang.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {agent.specialties?.slice(0, 2).map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {agent.specialties?.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{agent.specialties.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant={agent.featured ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFeatured(agent.id, agent.featured)}
                  >
                    <Star className={`h-3 w-3 mr-1 ${agent.featured ? 'fill-current' : ''}`} />
                    {agent.featured ? 'Featured' : 'Feature'}
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/agents/${agent.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAgent(agent.id, agent.name_en)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No agents found</p>
            <Button className="mt-4" asChild>
              <Link href="/admin/agents/new">
                <Plus className="h-4 w-4 mr-2" />
                Add First Agent
              </Link>
            </Button>
          </div>
        )}
      </Card>

      {/* Delete Dialog */}
      {deleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Agent</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete "{deleteDialog.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => confirmDelete(deleteDialog.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}

