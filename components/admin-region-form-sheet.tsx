"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/image-upload"
import { createRegion, updateRegion } from "@/lib/actions/regions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { Region } from "@/lib/hooks/use-regions"

interface AdminRegionFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Region
}

export function AdminRegionFormSheet({ open, onOpenChange, initialData }: AdminRegionFormSheetProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [formData, setFormData] = React.useState({
    name_en: initialData?.name_en || "",
    name_gr: initialData?.name_gr || "",
    slug: initialData?.slug || "",
    description_en: initialData?.description_en || "",
    description_gr: initialData?.description_gr || "",
    image_url: initialData?.image_url || "",
    featured: initialData?.featured || false,
    display_order: initialData?.display_order || 0,
  })

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name_en: initialData.name_en || "",
        name_gr: initialData.name_gr || "",
        slug: initialData.slug || "",
        description_en: initialData.description_en || "",
        description_gr: initialData.description_gr || "",
        image_url: initialData.image_url || "",
        featured: initialData.featured || false,
        display_order: initialData.display_order || 0,
      })
    } else {
      setFormData({
        name_en: "",
        name_gr: "",
        slug: "",
        description_en: "",
        description_gr: "",
        image_url: "",
        featured: false,
        display_order: 0,
      })
    }
    setError(null)
  }, [initialData, open])

  // Auto-generate slug from name_en
  React.useEffect(() => {
    if (!initialData?.id && formData.name_en && !formData.slug) {
      const slug = formData.name_en
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setFormData((prev) => ({ ...prev, slug }))
    }
  }, [formData.name_en, initialData?.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      let result
      if (initialData?.id) {
        result = await updateRegion(initialData.id, formData)
      } else {
        result = await createRegion(formData)
      }

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success(`Region ${initialData?.id ? "updated" : "created"} successfully!`)
        onOpenChange(false)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
      toast.error(err.message || "An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initialData?.id ? "Edit Region" : "Create New Region"}</SheetTitle>
          <SheetDescription>
            {initialData?.id ? `Editing region ${initialData.name_en}` : "Add a new region to your listings."}
          </SheetDescription>
        </SheetHeader>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive-foreground">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name_en">Name (English) *</Label>
                <Input
                  id="name_en"
                  required
                  value={formData.name_en}
                  onChange={handleChange}
                  placeholder="Athens"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_gr">Name (Greek)</Label>
                <Input
                  id="name_gr"
                  value={formData.name_gr}
                  onChange={handleChange}
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
                onChange={handleChange}
                placeholder="athens"
                pattern="[a-z0-9-]+"
              />
              <p className="text-xs text-muted-foreground">URL-friendly identifier (lowercase, hyphens only)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description_en">Description (English)</Label>
              <Textarea
                id="description_en"
                value={formData.description_en}
                onChange={handleChange}
                placeholder="Region description in English..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description_gr">Description (Greek)</Label>
              <Textarea
                id="description_gr"
                value={formData.description_gr}
                onChange={handleChange}
                placeholder="Περιγραφή περιοχής στα ελληνικά..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Region Image</Label>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData((prev) => ({ ...prev, image_url: url }))}
                onDelete={() => setFormData((prev) => ({ ...prev, image_url: "" }))}
                bucket="property-images"
                entityId={initialData?.id || "regions"}
                label="Upload Region Image"
                maxSize={5}
                aspectRatio="wide"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured Region</Label>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, featured: checked }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))
                  }
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : initialData?.id ? "Save Changes" : "Create Region"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

