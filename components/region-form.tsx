"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { Save, X } from "lucide-react"

interface RegionFormProps {
  initialData?: any
  isEdit?: boolean
}

export function RegionForm({ initialData, isEdit = false }: RegionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nameEn: initialData?.name_en || "",
    nameGr: initialData?.name_gr || "",
    slug: initialData?.slug || "",
    descriptionEn: initialData?.description_en || "",
    descriptionGr: initialData?.description_gr || "",
    imageUrl: initialData?.image_url || "",
    featured: initialData?.featured ?? false,
    displayOrder: initialData?.display_order || 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validation
    if (!formData.nameEn.trim()) {
      setError("Region name (English) is required")
      setIsSubmitting(false)
      return
    }

    if (!formData.slug.trim()) {
      setError("Slug is required")
      setIsSubmitting(false)
      return
    }

    // Generate slug from name if not provided
    const slug = formData.slug.trim() || formData.nameEn.toLowerCase().replace(/\s+/g, "-")

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const regionData = {
        name_en: formData.nameEn,
        name_gr: formData.nameGr || formData.nameEn,
        slug: slug,
        description_en: formData.descriptionEn || null,
        description_gr: formData.descriptionGr || null,
        image_url: formData.imageUrl || null,
        featured: formData.featured,
        display_order: formData.displayOrder,
      }

      if (isEdit && initialData?.id) {
        const { error: updateError } = await supabase.from("regions").update(regionData).eq("id", initialData.id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from("regions").insert(regionData)
        if (insertError) throw insertError
      }

      router.push("/admin/regions")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save region")
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
                placeholder="Athens"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameGr">Name (Greek)</Label>
              <Input
                id="nameGr"
                value={formData.nameGr}
                onChange={(e) => setFormData({ ...formData, nameGr: e.target.value })}
                placeholder="Αθήνα"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              placeholder="athens"
            />
            <p className="text-xs text-slate-600">URL-friendly identifier (e.g., athens, mykonos)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionEn">Description (English)</Label>
            <Textarea
              id="descriptionEn"
              value={formData.descriptionEn}
              onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              placeholder="Region description in English..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionGr">Description (Greek)</Label>
            <Textarea
              id="descriptionGr"
              value={formData.descriptionGr}
              onChange={(e) => setFormData({ ...formData, descriptionGr: e.target.value })}
              placeholder="Region description in Greek..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/region-image.jpg"
            />
          </div>
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
              <p className="text-sm text-slate-600">Show this region in featured sections</p>
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
            <p className="text-xs text-slate-600">Lower numbers appear first</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Saving..." : isEdit ? "Update Region" : "Create Region"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </form>
  )
}

