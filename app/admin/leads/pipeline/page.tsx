'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Phone, Mail, MessageSquare, User, Calendar, DollarSign, MapPin } from 'lucide-react'

interface Lead {
  id: string
  full_name: string
  email: string
  phone: string
  status: string
  priority: string
  budget_min: number
  budget_max: number
  created_at: string
  score?: number
  property?: { title_en: string; property_code: string }
  agent?: { name_en: string }
}

const STATUS_COLUMNS = [
  { key: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { key: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'qualified', label: 'Qualified', color: 'bg-purple-100 text-purple-800' },
  { key: 'viewing_scheduled', label: 'Viewing', color: 'bg-indigo-100 text-indigo-800' },
  { key: 'negotiating', label: 'Negotiating', color: 'bg-orange-100 text-orange-800' },
  { key: 'closed_won', label: 'Won', color: 'bg-green-100 text-green-800' },
  { key: 'closed_lost', label: 'Lost', color: 'bg-red-100 text-red-800' },
]

export default function LeadsPipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    fetchLeads()
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('leads-pipeline')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        property:property_id(title_en, property_code),
        agent:agent_id(name_en)
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setLeads(data)
    }
    setLoading(false)
  }

  async function updateLeadStatus(leadId: string, newStatus: string) {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', leadId)

    if (!error) {
      fetchLeads()
    }
  }

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  // Group by status
  const pipeline = STATUS_COLUMNS.reduce((acc, col) => {
    acc[col.key] = filteredLeads.filter(l => l.status === col.key)
    return acc
  }, {} as Record<string, Lead[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading pipeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads Pipeline</h1>
          <p className="text-muted-foreground">Manage your sales pipeline</p>
        </div>
        <Button>+ New Lead</Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex-1" />
          <Badge variant="outline">Total: {filteredLeads.length}</Badge>
        </div>
      </Card>

      {/* Pipeline Board */}
      <div className="grid grid-cols-7 gap-4 overflow-x-auto">
        {STATUS_COLUMNS.map(column => (
          <Card key={column.key} className="p-4 min-w-[280px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{column.label}</h3>
              <Badge className={column.color}>
                {pipeline[column.key]?.length || 0}
              </Badge>
            </div>

            <div className="space-y-3">
              {pipeline[column.key]?.map(lead => (
                <Card
                  key={lead.id}
                  className="p-3 cursor-pointer hover:shadow-lg transition-shadow border-l-4"
                  style={{ borderLeftColor: lead.priority === 'high' ? '#ef4444' : lead.priority === 'medium' ? '#f59e0b' : '#6b7280' }}
                >
                  <div className="space-y-2">
                    {/* Name & Score */}
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-sm">{lead.full_name}</p>
                      {lead.score && (
                        <Badge variant="secondary" className="text-xs">
                          {lead.score}
                        </Badge>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Property */}
                    {lead.property && (
                      <div className="text-xs text-muted-foreground truncate">
                        🏠 {lead.property.title_en}
                      </div>
                    )}

                    {/* Budget */}
                    {(lead.budget_min || lead.budget_max) && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span>
                          €{lead.budget_min?.toLocaleString()} - €{lead.budget_max?.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-1 pt-2 border-t">
                      <Button size="sm" variant="ghost" className="h-7 px-2">
                        <Phone className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2">
                        <Mail className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2">
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2">
                        <Calendar className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Move to next stage */}
                    {column.key !== 'closed_won' && column.key !== 'closed_lost' && (
                      <Button
                        size="sm"
                        className="w-full h-7 text-xs"
                        onClick={() => {
                          const currentIndex = STATUS_COLUMNS.findIndex(c => c.key === column.key)
                          const nextStatus = STATUS_COLUMNS[currentIndex + 1]?.key
                          if (nextStatus) {
                            updateLeadStatus(lead.id, nextStatus)
                          }
                        }}
                      >
                        Move →
                      </Button>
                    )}
                  </div>
                </Card>
              ))}

              {pipeline[column.key]?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No leads
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Statistics */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Pipeline Statistics</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Leads</p>
            <p className="text-2xl font-bold">{filteredLeads.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Pipeline</p>
            <p className="text-2xl font-bold">
              {filteredLeads.filter(l => !['closed_won', 'closed_lost'].includes(l.status)).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Won</p>
            <p className="text-2xl font-bold text-green-600">
              {pipeline.closed_won?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
            <p className="text-2xl font-bold">
              {filteredLeads.length > 0
                ? Math.round((pipeline.closed_won?.length || 0) / filteredLeads.length * 100)
                : 0}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

