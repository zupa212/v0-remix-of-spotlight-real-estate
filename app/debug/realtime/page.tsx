'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type RealtimeEvent = {
  id: string
  timestamp: string
  event: string
  table: string
  payload: any
}

export default function RealtimeDebugPage() {
  const [events, setEvents] = useState<RealtimeEvent[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [status, setStatus] = useState<string>('Not connected')
  const supabase = createClient()

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    setStatus('Connecting...')

    // Subscribe to properties table changes
    const channel = supabase
      .channel('debug-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties'
        },
        (payload) => {
          const newEvent: RealtimeEvent = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            event: payload.eventType,
            table: 'properties',
            payload: payload
          }
          setEvents((prev) => [newEvent, ...prev].slice(0, 50)) // Keep last 50 events
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true)
          setStatus('✅ Connected - Listening for changes')
        } else if (status === 'CHANNEL_ERROR') {
          setStatus('❌ Connection error')
        } else {
          setStatus(`Status: ${status}`)
        }
      })

    return () => {
      supabase.removeChannel(channel)
      setIsSubscribed(false)
      setStatus('Disconnected')
    }
  }, [])

  const insertDummyProperty = async () => {
    try {
      // Get a region and agent ID first
      const { data: regions } = await supabase
        .from('regions')
        .select('id')
        .limit(1)
        .single()

      const { data: agents } = await supabase
        .from('agents')
        .select('id')
        .limit(1)
        .single()

      if (!regions || !agents) {
        alert('Please run seed data first: npm run db:seed')
        return
      }

      const dummyProperty = {
        property_code: `TEST-${Date.now()}`,
        title_en: `Test Property ${Date.now()}`,
        title_gr: `Δοκιμαστικό Ακίνητο ${Date.now()}`,
        description_en: 'This is a test property created for realtime debugging',
        description_gr: 'Αυτό είναι ένα δοκιμαστικό ακίνητο που δημιουργήθηκε για debugging realtime',
        property_type: 'apartment',
        listing_type: 'sale',
        status: 'available',
        price_sale: 100000,
        currency: 'EUR',
        bedrooms: 2,
        bathrooms: 1,
        area_sqm: 75,
        city_en: 'Test City',
        city_gr: 'Δοκιμαστική Πόλη',
        region_id: regions.id,
        agent_id: agents.id,
        published: false, // Not published so it doesn't show on site
        featured: false
      }

      const { data, error } = await supabase
        .from('properties')
        .insert(dummyProperty)
        .select()
        .single()

      if (error) {
        console.error('Insert error:', error)
        alert(`Error: ${error.message}`)
        return
      }

      // Delete it after 2 seconds
      setTimeout(async () => {
        if (data) {
          await supabase.from('properties').delete().eq('id', data.id)
        }
      }, 2000)

      alert('✅ Dummy property inserted! Watch for realtime events below.')
    } catch (err) {
      console.error('Error:', err)
      alert('Error inserting property. Check console.')
    }
  }

  const clearEvents = () => {
    setEvents([])
  }

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="container mx-auto p-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-red-600">
            ⚠️ This page is only available in development mode
          </h1>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🔴 Realtime Debug Console</h1>
        <p className="text-muted-foreground">
          Test Supabase realtime subscriptions on the properties table
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Connection Status</h2>
            <p className={`text-sm ${isSubscribed ? 'text-green-600' : 'text-gray-600'}`}>
              {status}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={insertDummyProperty} disabled={!isSubscribed}>
              Insert Dummy Property
            </Button>
            <Button onClick={clearEvents} variant="outline">
              Clear Events
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            <strong>How it works:</strong> This page subscribes to INSERT/UPDATE/DELETE events on the `properties` table.
            Click "Insert Dummy Property" to create a test property (it will be auto-deleted after 2 seconds).
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          Realtime Events ({events.length})
        </h2>
        
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No events yet. Click "Insert Dummy Property" to test.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {events.map((event) => (
              <Card key={event.id} className="p-4 bg-muted/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      event.event === 'INSERT' ? 'bg-green-100 text-green-800' :
                      event.event === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.event}
                    </span>
                    <span className="text-sm font-medium">{event.table}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <pre className="text-xs bg-black/5 p-2 rounded overflow-x-auto">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Development Only</h3>
        <p className="text-sm text-yellow-800">
          This debug page is only accessible in development mode. It will not be available in production.
        </p>
      </Card>
    </div>
  )
}

