'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, Star, Mail, Phone, User } from 'lucide-react'
import Link from 'next/link'
import { AdminPageWrapper } from '@/components/admin-page-wrapper'
import { AdminGlassCard } from '@/components/admin-glass-card'
import { StatCard } from '@/components/stat-card'
import { motion } from 'framer-motion'
import { showToast } from '@/lib/toast'
import { AdminLoadingSkeleton } from '@/components/admin-loading-skeleton'

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

  useEffect(() => {
    // Only create client on client-side
    if (typeof window === 'undefined') return

    const supabase = createClient()
    
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

  async function toggleFeatured(agentId: string, currentFeatured: boolean) {
    if (typeof window === 'undefined') return
    
    const supabase = createClient()
    const { error } = await supabase
      .from('agents')
      .update({ featured: !currentFeatured })
      .eq('id', agentId)

    if (!error) {
      // Refetch agents
      const { data, error: fetchError } = await supabase
        .from('agents')
        .select('*')
        .order('display_order', { ascending: true })

      if (!fetchError && data) {
        setAgents(data)
        showToast.success("Agent updated", `Agent ${!currentFeatured ? "featured" : "unfeatured"} successfully`)
      } else if (fetchError) {
        showToast.error("Failed to update agent", fetchError.message)
      }
    } else {
      showToast.error("Failed to update agent", error.message)
    }
  }

  const [deleteDialog, setDeleteDialog] = useState<{ id: string; name: string } | null>(null)

  async function deleteAgent(agentId: string, agentName: string) {
    setDeleteDialog({ id: agentId, name: agentName })
  }

  async function confirmDelete(agentId: string) {
    if (typeof window === 'undefined') return
    
    const supabase = createClient()
    const { error } = await supabase.from('agents').delete().eq('id', agentId)

    if (!error) {
      // Refetch agents
      const { data, error: fetchError } = await supabase
        .from('agents')
        .select('*')
        .order('display_order', { ascending: true })

      if (!fetchError && data) {
        setAgents(data)
        showToast.success("Agent deleted", "Agent deleted successfully")
      } else if (fetchError) {
        showToast.error("Failed to delete agent", fetchError.message)
      }
      setDeleteDialog(null)
    } else {
      showToast.error("Failed to delete agent", error.message)
      setDeleteDialog(null)
    }
  }

  const filteredAgents = agents.filter(agent =>
    agent.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <AdminPageWrapper title="Agents" description="Loading agents...">
        <AdminLoadingSkeleton />
      </AdminPageWrapper>
    )
  }

  const featuredCount = agents.filter(a => a.featured).length

  return (
    <AdminPageWrapper
      title="Agents"
      description="Manage your real estate agents"
      headerActions={
        <Button asChild className="bg-white/40 backdrop-blur-xl border-white/20">
          <Link href="/admin/agents/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Agents"
            value={agents.length}
            icon={User}
            index={0}
          />
          <StatCard
            title="Featured"
            value={featuredCount}
            icon={Star}
            index={1}
          />
          <StatCard
            title="Active"
            value={agents.length}
            icon={User}
            index={2}
          />
        </div>

        {/* Search */}
        <AdminGlassCard index={3}>
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-white/60 backdrop-blur-sm border-white/30"
          />
        </AdminGlassCard>

        {/* Agents Table */}
        <AdminGlassCard index={4} className="overflow-hidden">
          <div className="overflow-x-auto">
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
                {filteredAgents.map((agent, index) => (
                  <TableRow key={agent.id} className="border-b border-white/10 hover:bg-white/30 transition-all duration-300">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {agent.avatar_url ? (
                          <img
                            src={agent.avatar_url}
                            alt={agent.name_en}
                            className="h-10 w-10 rounded-full object-cover border-2 border-white/30"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                            <User className="h-5 w-5 text-slate-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-900">{agent.name_en}</p>
                          <p className="text-sm text-slate-500">{agent.name_gr}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-blue-600" />
                          <span className="text-slate-700">{agent.email}</span>
                        </div>
                        {agent.phone && (
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Phone className="h-3 w-3 text-blue-600" />
                            <span>{agent.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {agent.languages?.map((lang) => (
                          <Badge key={lang} variant="outline" className="text-xs border-white/30 backdrop-blur-sm">
                            {lang.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {agent.specialties?.slice(0, 2).map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs border border-white/30 backdrop-blur-sm">
                            {spec}
                          </Badge>
                        ))}
                        {agent.specialties?.length > 2 && (
                          <Badge variant="secondary" className="text-xs border border-white/30 backdrop-blur-sm">
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
                        className={agent.featured ? "bg-yellow-500/80 backdrop-blur-sm border-yellow-300/30" : "bg-white/40 backdrop-blur-sm border-white/30"}
                      >
                        <Star className={`h-3 w-3 mr-1 ${agent.featured ? 'fill-current' : ''}`} />
                        {agent.featured ? 'Featured' : 'Feature'}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button variant="ghost" size="sm" asChild className="bg-white/40 backdrop-blur-sm border border-white/30">
                            <Link href={`/admin/agents/${agent.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAgent(agent.id, agent.name_en)}
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

          {filteredAgents.length === 0 && (
            <div className="text-center py-12 text-slate-600">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No agents found</p>
              <Button className="mt-4 bg-white/40 backdrop-blur-xl border-white/20" asChild>
                <Link href="/admin/agents/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Agent
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
            <h3 className="text-lg font-semibold mb-2 text-slate-900">Delete Agent</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete "{deleteDialog.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteDialog(null)} className="bg-white/40 backdrop-blur-sm border-white/30">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => confirmDelete(deleteDialog.id)}
                className="bg-red-500/80 backdrop-blur-sm border-red-300/30"
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AdminPageWrapper>
  )
}

