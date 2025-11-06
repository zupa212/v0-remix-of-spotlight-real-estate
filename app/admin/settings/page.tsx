"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { TrendingUp, Shield, Plug } from "lucide-react"

export default function AdminSettingsPage() {
  const [budgetWeight, setBudgetWeight] = useState([40])
  const [readinessWeight, setReadinessWeight] = useState([40])
  const [regionWeight, setRegionWeight] = useState([20])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure system settings and integrations</p>
      </div>

      <Tabs defaultValue="scoring" className="space-y-6">
        <TabsList>
          <TabsTrigger value="scoring">Lead Scoring</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & GDPR</TabsTrigger>
        </TabsList>

        <TabsContent value="scoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Lead Scoring Configuration
              </CardTitle>
              <CardDescription>Adjust scoring weights to prioritize leads based on your criteria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Budget Fit (0-40 points)</Label>
                    <span className="text-sm font-medium">{budgetWeight[0]}</span>
                  </div>
                  <Slider value={budgetWeight} onValueChange={setBudgetWeight} max={40} step={5} />
                  <p className="text-sm text-muted-foreground">How well the lead's budget matches property prices</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Readiness (0-40 points)</Label>
                    <span className="text-sm font-medium">{readinessWeight[0]}</span>
                  </div>
                  <Slider value={readinessWeight} onValueChange={setReadinessWeight} max={40} step={5} />
                  <p className="text-sm text-muted-foreground">Lead's timeline and decision-making readiness</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Region Match (0-20 points)</Label>
                    <span className="text-sm font-medium">{regionWeight[0]}</span>
                  </div>
                  <Slider value={regionWeight} onValueChange={setRegionWeight} max={20} step={5} />
                  <p className="text-sm text-muted-foreground">Match between preferred and available regions</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Score Thresholds</h4>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Hot Lead</span>
                    <span className="font-medium">≥ 70 points</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Warm Lead</span>
                    <span className="font-medium">40-69 points</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cold Lead</span>
                    <span className="font-medium">{"<"} 40 points</span>
                  </div>
                </div>
              </div>

              <Button>Save Scoring Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Communication Integrations
              </CardTitle>
              <CardDescription>Configure WhatsApp, Telegram, and email settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp-webhook">WhatsApp Webhook URL</Label>
                <Input id="whatsapp-webhook" placeholder="https://api.whatsapp.com/webhook" type="url" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegram-bot">Telegram Bot Token</Label>
                <Input id="telegram-bot" placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ical-domain">iCal Domain</Label>
                <Input id="ical-domain" placeholder="https://spotlight.gr" type="url" />
              </div>

              <Button>Save Integration Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                GDPR & Privacy Tools
              </CardTitle>
              <CardDescription>Manage data privacy and compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                GDPR tools for data export, deletion, and consent management will be available in the Ops & Compliance
                section.
              </p>
              <Button variant="outline">Configure Privacy Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
