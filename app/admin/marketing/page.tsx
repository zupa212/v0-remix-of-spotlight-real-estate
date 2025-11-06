"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Rss, TestTube, Users, Download } from "lucide-react"

type SyndicationMapping = {
  id: string
  portal: string
  is_active: boolean
  last_generated_at: string | null
}

export default function AdminMarketingPage() {
  const [mappings, setMappings] = useState<SyndicationMapping[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient()

  useEffect(() => {
    fetchMappings()
  }, [])

  async function fetchMappings() {
    const { data, error } = await supabase.from("syndication_mappings").select("*").order("portal")

    if (error) {
      console.error("Error fetching mappings:", error)
    } else {
      setMappings(data || [])
    }
    setLoading(false)
  }

  async function togglePortal(id: string, isActive: boolean) {
    const { error } = await supabase.from("syndication_mappings").update({ is_active: isActive }).eq("id", id)

    if (error) {
      console.error("Error updating portal:", error)
      alert("Failed to update portal")
    } else {
      fetchMappings()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Marketing & Growth</h1>
        <p className="text-muted-foreground">Manage feeds, experiments, and referral programs</p>
      </div>

      <Tabs defaultValue="feeds" className="space-y-6">
        <TabsList>
          <TabsTrigger value="feeds">Syndication Feeds</TabsTrigger>
          <TabsTrigger value="experiments">A/B Experiments</TabsTrigger>
          <TabsTrigger value="referrals">Referral Program</TabsTrigger>
        </TabsList>

        <TabsContent value="feeds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rss className="h-5 w-5" />
                Property Syndication Feeds
              </CardTitle>
              <CardDescription>Export your properties to major real estate portals</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading feeds...</p>
              ) : (
                <div className="space-y-4">
                  {mappings.map((mapping) => (
                    <div key={mapping.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium capitalize">{mapping.portal}</h3>
                          <Badge variant={mapping.is_active ? "default" : "secondary"}>
                            {mapping.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {mapping.last_generated_at && (
                          <p className="text-sm text-muted-foreground">
                            Last generated: {new Date(mapping.last_generated_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {mapping.is_active && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/feeds/${mapping.portal}.xml`} target="_blank" rel="noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              Download XML
                            </a>
                          </Button>
                        )}
                        <Switch
                          checked={mapping.is_active}
                          onCheckedChange={(checked) => togglePortal(mapping.id, checked)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                A/B Testing Experiments
              </CardTitle>
              <CardDescription>Test different variations to optimize conversions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No active experiments. Create your first experiment to start testing.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Referral & Affiliate Program
              </CardTitle>
              <CardDescription>Track partner referrals and manage commissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Set up referral codes for agents and partners to track lead attribution.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
