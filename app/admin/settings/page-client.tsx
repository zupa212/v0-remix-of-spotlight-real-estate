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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Upload, X, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { updateLogoUrl } from "@/lib/actions/settings"
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
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = React.useState(false)
  const supabase = createClient()

  // Load existing logo on mount
  React.useEffect(() => {
    loadLogo()
  }, [])

  async function loadLogo() {
    try {
      // Load from database first
      const result = await getSettings()
      if (result.success && result.data?.logo_url) {
        setLogoUrl(result.data.logo_url)
        setLogoPreview(result.data.logo_url)
        localStorage.setItem("admin-logo-url", result.data.logo_url)
        return
      }
      
      // Fallback to localStorage
      const savedLogo = localStorage.getItem("admin-logo-url")
      if (savedLogo) {
        setLogoUrl(savedLogo)
        setLogoPreview(savedLogo)
      }
    } catch (error) {
      console.error("Error loading logo:", error)
      // Fallback to localStorage on error
      const savedLogo = localStorage.getItem("admin-logo-url")
      if (savedLogo) {
        setLogoUrl(savedLogo)
        setLogoPreview(savedLogo)
      }
    }
  }

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"]
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload PNG, JPEG, WebP, or SVG.")
      return
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("File size exceeds 2MB limit.")
      return
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file)
    setLogoPreview(previewUrl)

    // Upload to Supabase Storage
    setUploadingLogo(true)
    try {
      const fileExt = file.name.split(".").pop()
      const timestamp = Date.now()
      const fileName = `logo/${timestamp}.${fileExt}`

      // Upload to storage bucket (create 'logos' bucket if it doesn't exist)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true, // Replace existing logo
        })

      if (uploadError) {
        // If bucket doesn't exist, try 'general' or 'assets' bucket
        const fallbackBuckets = ["general", "assets", "uploads"]
        let uploaded = false

        for (const bucket of fallbackBuckets) {
          try {
            const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
              cacheControl: "3600",
              upsert: true,
            })
            if (!error && data) {
              const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)
              setLogoUrl(publicUrl)
              localStorage.setItem("admin-logo-url", publicUrl)
              toast.success("Logo uploaded successfully!")
              uploaded = true
              break
            }
          } catch (e) {
            continue
          }
        }

        if (!uploaded) {
          throw uploadError
        }
      } else {
        // Get public URL
        const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(fileName)
        setLogoUrl(publicUrl)
        localStorage.setItem("admin-logo-url", publicUrl)
        toast.success("Logo uploaded successfully!")
      }
    } catch (error) {
      console.error("Error uploading logo:", error)
      toast.error("Failed to upload logo. Please try again.")
      setLogoPreview(null)
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    } finally {
      setUploadingLogo(false)
    }
  }

  async function handleSaveLogo() {
    if (!logoUrl) return

    try {
      const result = await updateLogoUrl(logoUrl)
      if (result.success) {
        localStorage.setItem("admin-logo-url", logoUrl) // Also save to localStorage for quick access
        toast.success("Logo saved successfully!")
      } else {
        toast.error(result.error || "Failed to save logo.")
      }
    } catch (error) {
      console.error("Error saving logo:", error)
      toast.error("Failed to save logo.")
    }
  }

  async function handleDeleteLogo() {
    try {
      const result = await updateLogoUrl(null)
      if (result.success) {
        setLogoUrl(null)
        setLogoPreview(null)
        localStorage.removeItem("admin-logo-url")
        toast.success("Logo deleted successfully!")
      } else {
        toast.error(result.error || "Failed to delete logo.")
      }
    } catch (error) {
      console.error("Error deleting logo:", error)
      toast.error("Failed to delete logo.")
    }
  }

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
              <div className="space-y-4">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  {/* Logo Preview */}
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-border">
                      <AvatarImage src={logoPreview || logoUrl || undefined} alt="Logo" />
                      <AvatarFallback className="text-lg">LOGO</AvatarFallback>
                    </Avatar>
                    {logoPreview && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => {
                          setLogoPreview(null)
                          if (logoPreview.startsWith("blob:")) {
                            URL.revokeObjectURL(logoPreview)
                          }
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex-1 space-y-2">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: PNG or SVG, max 2MB. Logo will be displayed in the header.
                    </p>
                    {uploadingLogo && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading logo...
                      </div>
                    )}
                  </div>
                </div>
                {logoUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveLogo}
                    disabled={uploadingLogo}
                  >
                    Save Logo
                  </Button>
                )}
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


