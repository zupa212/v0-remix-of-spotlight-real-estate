"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { TrendingUp, Shield, Plug } from "lucide-react"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import { AdminGlassCard } from "@/components/admin-glass-card"

export default function AdminSettingsPage() {
  const [budgetWeight, setBudgetWeight] = useState([40])
  const [readinessWeight, setReadinessWeight] = useState([40])
  const [regionWeight, setRegionWeight] = useState([20])

  return (
    <AdminPageWrapper
      title="Settings"
      description="Configure system settings and integrations"
    >
      <Tabs defaultValue="scoring" className="space-y-6">
        <TabsList className="bg-white/40 backdrop-blur-xl border-white/20">
          <TabsTrigger value="scoring" className="data-[state=active]:bg-white/60">Lead Scoring</TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-white/60">Integrations</TabsTrigger>
          <TabsTrigger value="privacy" className="data-[state=active]:bg-white/60">Privacy & GDPR</TabsTrigger>
        </TabsList>

        <TabsContent value="scoring" className="space-y-6">
          <AdminGlassCard index={0} title="Lead Scoring Configuration" headerActions={<TrendingUp className="h-5 w-5 text-blue-600" />}>
            <p className="text-sm text-slate-600 mb-6">Adjust scoring weights to prioritize leads based on your criteria</p>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700">Budget Fit (0-40 points)</Label>
                    <span className="text-sm font-medium text-slate-900">{budgetWeight[0]}</span>
                  </div>
                  <Slider value={budgetWeight} onValueChange={setBudgetWeight} max={40} step={5} />
                  <p className="text-sm text-slate-500">How well the lead's budget matches property prices</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700">Readiness (0-40 points)</Label>
                    <span className="text-sm font-medium text-slate-900">{readinessWeight[0]}</span>
                  </div>
                  <Slider value={readinessWeight} onValueChange={setReadinessWeight} max={40} step={5} />
                  <p className="text-sm text-slate-500">Lead's timeline and decision-making readiness</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700">Region Match (0-20 points)</Label>
                    <span className="text-sm font-medium text-slate-900">{regionWeight[0]}</span>
                  </div>
                  <Slider value={regionWeight} onValueChange={setRegionWeight} max={20} step={5} />
                  <p className="text-sm text-slate-500">Match between preferred and available regions</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/20">
                <h4 className="font-medium mb-3 text-slate-900">Score Thresholds</h4>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Hot Lead</span>
                    <span className="font-medium text-slate-900">≥ 70 points</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Warm Lead</span>
                    <span className="font-medium text-slate-900">40-69 points</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Cold Lead</span>
                    <span className="font-medium text-slate-900">{"<"} 40 points</span>
                  </div>
                </div>
              </div>

              <Button className="bg-white/40 backdrop-blur-xl border-white/20 mt-6">Save Scoring Settings</Button>
            </div>
          </AdminGlassCard>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <AdminGlassCard index={1} title="Communication Integrations" headerActions={<Plug className="h-5 w-5 text-blue-600" />}>
            <p className="text-sm text-slate-600 mb-6">Configure WhatsApp, Telegram, and email settings</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp-webhook" className="text-slate-700">WhatsApp Webhook URL</Label>
                <Input id="whatsapp-webhook" placeholder="https://api.whatsapp.com/webhook" type="url" className="bg-white/60 backdrop-blur-sm border-white/30" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegram-bot" className="text-slate-700">Telegram Bot Token</Label>
                <Input id="telegram-bot" placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz" type="password" className="bg-white/60 backdrop-blur-sm border-white/30" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ical-domain" className="text-slate-700">iCal Domain</Label>
                <Input id="ical-domain" placeholder="https://spotlight.gr" type="url" className="bg-white/60 backdrop-blur-sm border-white/30" />
              </div>

              <Button className="bg-white/40 backdrop-blur-xl border-white/20 mt-4">Save Integration Settings</Button>
            </div>
          </AdminGlassCard>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <AdminGlassCard index={2} title="GDPR & Privacy Tools" headerActions={<Shield className="h-5 w-5 text-blue-600" />}>
            <p className="text-sm text-slate-600 mb-4">
              GDPR tools for data export, deletion, and consent management will be available in the Ops & Compliance
              section.
            </p>
            <Button variant="outline" className="bg-white/40 backdrop-blur-sm border-white/30">Configure Privacy Settings</Button>
          </AdminGlassCard>
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  )
}
