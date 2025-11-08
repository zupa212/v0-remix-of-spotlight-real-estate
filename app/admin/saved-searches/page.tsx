'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Bell, Mail, MessageSquare, Send, TrendingUp, Users } from 'lucide-react'
import { format } from 'date-fns'

interface SavedSearch {
  id: string
  name: string
  filters_json: any
  channels: string[]
  frequency: string
  is_active: boolean
  created_at: string
  notification_count?: number
  last_notified_at?: string
  user?: { email: string; full_name: string }
}

interface AlertStats {
  search_id: string
  search_name: string
  total_alerts: number
  sent_alerts: number
  failed_alerts: number
  last_alert_sent: string
}

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [stats, setStats] = useState<AlertStats[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchSearches()
    fetchStats()

    // Realtime subscription
    const channel = supabase
      .channel('saved-searches-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saved_searches' }, () => {
        fetchSearches()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts_log' }, () => {
        fetchStats()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchSearches() {
    const { data, error } = await supabase
      .from('saved_searches')
      .select(`
        *,
        user:user_id(email, full_name)
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setSearches(data)
    }
    setLoading(false)
  }

  async function fetchStats() {
    // Fetch alert statistics
    const { data, error } = await supabase
      .from('alerts_log')
      .select(`
        saved_search_id,
        status,
        sent_at
      `)

    if (!error && data) {
      // Group by search_id
      const statsMap = data.reduce((acc, alert) => {
        if (!acc[alert.saved_search_id]) {
          acc[alert.saved_search_id] = {
            total: 0,
            sent: 0,
            failed: 0,
            last_sent: null
          }
        }
        acc[alert.saved_search_id].total++
        if (alert.status === 'sent') acc[alert.saved_search_id].sent++
        if (alert.status === 'failed') acc[alert.saved_search_id].failed++
        if (alert.sent_at && (!acc[alert.saved_search_id].last_sent || alert.sent_at > acc[alert.saved_search_id].last_sent)) {
          acc[alert.saved_search_id].last_sent = alert.sent_at
        }
        return acc
      }, {} as Record<string, any>)

      setStats(Object.entries(statsMap).map(([id, s]) => ({
        search_id: id,
        search_name: '',
        total_alerts: s.total,
        sent_alerts: s.sent,
        failed_alerts: s.failed,
        last_alert_sent: s.last_sent
      })))
    }
  }

  async function toggleSearchActive(searchId: string, currentActive: boolean) {
    const { error } = await supabase
      .from('saved_searches')
      .update({ is_active: !currentActive })
      .eq('id', searchId)

    if (!error) {
      fetchSearches()
    }
  }

  const totalAlerts = stats.reduce((sum, s) => sum + s.total_alerts, 0)
  const totalSent = stats.reduce((sum, s) => sum + s.sent_alerts, 0)
  const totalFailed = stats.reduce((sum, s) => sum + s.failed_alerts, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Saved Searches & Alerts</h1>
          <p className="text-muted-foreground">Monitor user search preferences and notifications</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Searches</p>
              <p className="text-2xl font-bold">
                {searches.filter(s => s.is_active).length}
              </p>
            </div>
            <Bell className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Alerts</p>
              <p className="text-2xl font-bold">{totalAlerts}</p>
            </div>
            <Send className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sent</p>
              <p className="text-2xl font-bold text-green-600">{totalSent}</p>
            </div>
            <Mail className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">
                {totalAlerts > 0 ? Math.round((totalSent / totalAlerts) * 100) : 0}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Searches List */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">All Saved Searches</h3>
        <div className="space-y-4">
          {searches.map(search => {
            const searchStats = stats.find(s => s.search_id === search.id)

            return (
              <div key={search.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{search.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {search.user?.full_name} ({search.user?.email})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={search.is_active}
                        onCheckedChange={() => toggleSearchActive(search.id, search.is_active)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {search.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-2">
                    {search.filters_json.property_type && (
                      <Badge variant="outline">
                        Type: {search.filters_json.property_type.join(', ')}
                      </Badge>
                    )}
                    {search.filters_json.listing_type && (
                      <Badge variant="outline">
                        {search.filters_json.listing_type.join(', ')}
                      </Badge>
                    )}
                    {search.filters_json.price_min && (
                      <Badge variant="outline">
                        Min: €{search.filters_json.price_min.toLocaleString()}
                      </Badge>
                    )}
                    {search.filters_json.price_max && (
                      <Badge variant="outline">
                        Max: €{search.filters_json.price_max.toLocaleString()}
                      </Badge>
                    )}
                    {search.filters_json.bedrooms_min && (
                      <Badge variant="outline">
                        {search.filters_json.bedrooms_min}+ beds
                      </Badge>
                    )}
                  </div>

                  {/* Channels & Frequency */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      {search.channels.includes('email') && <Mail className="h-4 w-4" />}
                      {search.channels.includes('whatsapp') && <MessageSquare className="h-4 w-4" />}
                      {search.channels.includes('telegram') && <Send className="h-4 w-4" />}
                      <span className="text-muted-foreground">
                        {search.channels.join(', ')}
                      </span>
                    </div>
                    <Badge variant="secondary">{search.frequency}</Badge>
                  </div>

                  {/* Stats */}
                  {searchStats && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                      <span>Alerts sent: {searchStats.sent_alerts}</span>
                      <span>Failed: {searchStats.failed_alerts}</span>
                      {searchStats.last_alert_sent && (
                        <span>Last: {format(new Date(searchStats.last_alert_sent), 'MMM dd, HH:mm')}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline">View Matches</Button>
                  <Button size="sm" variant="ghost">Edit</Button>
                </div>
              </div>
            )
          })}

          {searches.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No saved searches yet</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

