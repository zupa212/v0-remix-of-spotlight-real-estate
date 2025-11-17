"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function AdminSettingsPageClient() {
  const [hotThreshold, setHotThreshold] = React.useState([75])
  const [warmThreshold, setWarmThreshold] = React.useState([50])

  return (
    <AdminPageWrapper
      title="Settings"
      description="Configure your admin panel settings"
    >
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic configuration for your admin panel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" defaultValue="Spotlight Estate Group" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input id="admin-email" type="email" defaultValue="admin@spotlight.gr" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>Customize brand colors and logo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <Input id="primary-color" type="color" defaultValue="#0EA5E9" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <Input id="accent-color" type="color" defaultValue="#F59E0B" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Logo Upload</Label>
                <Input id="logo-upload" type="file" accept="image/*" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Configure third-party service integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resend-key">Resend API Key</Label>
                <Input id="resend-key" type="password" placeholder="re_..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram-webhook">Telegram Webhook URL</Label>
                <Input id="telegram-webhook" type="url" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp-provider">WhatsApp Provider</Label>
                <Input id="whatsapp-provider" placeholder="Provider name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="map-token">Map API Token</Label>
                <Input id="map-token" type="password" placeholder="Enter map API token" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Scoring</CardTitle>
              <CardDescription>Configure scoring weights and thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Hot Threshold</Label>
                    <span className="text-sm text-muted-foreground">{hotThreshold[0]}%</span>
                  </div>
                  <Slider
                    value={hotThreshold}
                    onValueChange={setHotThreshold}
                    max={100}
                    min={0}
                    step={1}
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Warm Threshold</Label>
                    <span className="text-sm text-muted-foreground">{warmThreshold[0]}%</span>
                  </div>
                  <Slider
                    value={warmThreshold}
                    onValueChange={setWarmThreshold}
                    max={100}
                    min={0}
                    step={1}
                  />
                </div>
              </div>
              <div className="pt-4 border-t">
                <Button>Save Scoring Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Templates</CardTitle>
              <CardDescription>Configure task templates for each pipeline stage</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Task templates for pipeline stages will be configured here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  )
}


