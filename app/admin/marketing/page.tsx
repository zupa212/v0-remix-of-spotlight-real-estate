"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Rss, TestTube, Users, Download } from "lucide-react"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import { AdminGlassCard } from "@/components/admin-glass-card"
import { motion } from "framer-motion"
import { showToast } from "@/lib/toast"

type SyndicationMapping = {
  id: string
  portal: string
  is_active: boolean
  last_generated_at: string | null
}

export default function AdminMarketingPage() {
  const [mappings, setMappings] = useState<SyndicationMapping[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchMappings()
  }, [])

  async function fetchMappings() {
    const { data, error } = await supabase
      .from("syndication_mappings")
      .select("*")
      .order("created_at", { ascending: true })

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
      showToast.error("Failed to update portal", error.message)
    } else {
      fetchMappings()
      showToast.success("Portal updated", `Portal ${isActive ? "activated" : "deactivated"} successfully`)
    }
  }

  return (
    <AdminPageWrapper
      title="Marketing & Growth"
      description="Manage feeds, experiments, and referral programs"
    >
      <Tabs defaultValue="feeds" className="space-y-6">
        <TabsList className="bg-white/40 backdrop-blur-xl border-white/20">
          <TabsTrigger value="feeds" className="data-[state=active]:bg-white/60">Syndication Feeds</TabsTrigger>
          <TabsTrigger value="experiments" className="data-[state=active]:bg-white/60">A/B Experiments</TabsTrigger>
          <TabsTrigger value="referrals" className="data-[state=active]:bg-white/60">Referral Program</TabsTrigger>
        </TabsList>

        <TabsContent value="feeds" className="space-y-6">
          <AdminGlassCard index={0} title="Property Syndication Feeds" headerActions={<Rss className="h-5 w-5 text-blue-600" />}>
            <p className="text-sm text-slate-600 mb-4">Export your properties to major real estate portals</p>
            {loading ? (
              <p className="text-sm text-slate-600">Loading feeds...</p>
            ) : (
              <div className="space-y-4">
                {mappings.map((mapping, index) => (
                  <motion.div
                    key={mapping.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium capitalize text-slate-900">{mapping.portal}</h3>
                        <Badge variant={mapping.is_active ? "default" : "secondary"} className={`border border-white/30 backdrop-blur-sm ${mapping.is_active ? "bg-green-100/80 text-green-700" : "bg-slate-100/80 text-slate-700"}`}>
                          {mapping.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {mapping.last_generated_at && (
                        <p className="text-sm text-slate-500">
                          Last generated: {new Date(mapping.last_generated_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {mapping.is_active && (
                        <Button variant="outline" size="sm" asChild className="bg-white/40 backdrop-blur-sm border-white/30">
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
                  </motion.div>
                ))}
              </div>
            )}
          </AdminGlassCard>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-6">
          <AdminGlassCard index={1} title="A/B Testing Experiments" headerActions={<TestTube className="h-5 w-5 text-blue-600" />}>
            <p className="text-sm text-slate-600 mb-4">Test different variations to optimize conversions</p>
            <p className="text-sm text-slate-600">
              No active experiments. Create your first experiment to start testing.
            </p>
          </AdminGlassCard>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <AdminGlassCard index={2} title="Referral & Affiliate Program" headerActions={<Users className="h-5 w-5 text-blue-600" />}>
            <p className="text-sm text-slate-600 mb-4">Track partner referrals and manage commissions</p>
            <p className="text-sm text-slate-600">
              Set up referral codes for agents and partners to track lead attribution.
            </p>
          </AdminGlassCard>
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  )
}
