"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { Save, X, Upload } from "lucide-react"
import Image from "next/image"
import { ImageUpload } from "@/components/image-upload"

interface AgentFormProps {
  initialData?: any
  isEdit?: boolean
}

export function AgentForm({ initialData, isEdit = false }: AgentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    nameEn: initialData?.name_en || "",
    nameGr: initialData?.name_gr || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    bioEn: initialData?.bio_en || "",
    bioGr: initialData?.bio_gr || "",
    avatarUrl: initialData?.avatar_url || "",
    languages: initialData?.languages || [],
    specialties: initialData?.specialties || [],
    featured: initialData?.featured ?? false,
    displayOrder: initialData?.display_order || 0,
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const supabase = createClient()
      const fileExt = file.name.split(".").pop()
      const fileName = `agent-${Date.now()}.${fileExt}`
      const filePath = `agents/${fileName}`

      // Note: This old upload code is kept for backward compatibility
      // The ImageUpload component should be used instead
      const { error: uploadError } = await supabase.storage.from("agent-avatars").upload(filePath, file, {
        upsert: false,
      })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("agent-avatars").getPublicUrl(filePath)

      setFormData({ ...formData, avatarUrl: publicUrl })
    } catch (err) {
      console.error("Error uploading image:", err)
      setError("Failed to upload image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validation
    if (!formData.nameEn.trim()) {
      setError("Agent name (English) is required")
      setIsSubmitting(false)
      return
    }

    if (!formData.email.trim()) {
      setError("Email is required")
      setIsSubmitting(false)
      return
    }

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const agentData = {
        name_en: formData.nameEn,
        name_gr: formData.nameGr || formData.nameEn,
        email: formData.email,
        phone: formData.phone || null,
        bio_en: formData.bioEn || null,
        bio_gr: formData.bioGr || null,
        avatar_url: formData.avatarUrl || null,
        languages: formData.languages,
        specialties: formData.specialties,
        featured: formData.featured,
        display_order: formData.displayOrder,
      }

      if (isEdit && initialData?.id) {
        const { error: updateError } = await supabase.from("agents").update(agentData).eq("id", initialData.id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from("agents").insert(agentData)
        if (insertError) throw insertError
      }

      router.push("/admin/agents")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save agent")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nameEn">Name (English) *</Label>
              <Input
                id="nameEn"
                required
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameGr">Name (Greek)</Label>
              <Input
                id="nameGr"
                value={formData.nameGr}
                onChange={(e) => setFormData({ ...formData, nameGr: e.target.value })}
                placeholder="Γιάννης Δόης"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+30 123 456 7890"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bioEn">Bio (English)</Label>
            <Textarea
              id="bioEn"
              value={formData.bioEn}
              onChange={(e) => setFormData({ ...formData, bioEn: e.target.value })}
              placeholder="Agent bio in English..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bioGr">Bio (Greek)</Label>
            <Textarea
              id="bioGr"
              value={formData.bioGr}
              onChange={(e) => setFormData({ ...formData, bioGr: e.target.value })}
              placeholder="Agent bio in Greek..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Avatar Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload
            value={formData.avatarUrl}
            onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
            bucket="agent-avatars"
            entityId={isEdit && initialData?.id ? initialData.id : "temp"}
            label="Agent Avatar"
            aspectRatio="square"
          />
          {!formData.avatarUrl && (
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Or enter image URL</Label>
              <Input
                id="avatarUrl"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="featured">Featured</Label>
              <p className="text-sm text-slate-600">Show this agent in featured sections</p>
            </div>
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: Number.parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting || uploading}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Saving..." : isEdit ? "Update Agent" : "Create Agent"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </form>
  )
}

