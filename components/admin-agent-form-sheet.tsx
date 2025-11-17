"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/image-upload"
import { createAgent, updateAgent, type Agent } from "@/lib/actions/agents"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { Agent as AgentType } from "@/lib/hooks/use-agents"

interface AdminAgentFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: AgentType
}

export function AdminAgentFormSheet({ open, onOpenChange, initialData }: AdminAgentFormSheetProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [formData, setFormData] = React.useState({
    name_en: initialData?.name_en || "",
    name_gr: initialData?.name_gr || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    bio_en: "",
    bio_gr: "",
    avatar_url: initialData?.avatar_url || "",
    languages: initialData?.languages || ["en", "gr"],
    specialties: [] as string[],
    featured: false,
    display_order: 0,
  })

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name_en: initialData.name_en || "",
        name_gr: initialData.name_gr || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        bio_en: "",
        bio_gr: "",
        avatar_url: initialData.avatar_url || "",
        languages: initialData.languages || ["en", "gr"],
        specialties: [],
        featured: false,
        display_order: 0,
      })
    } else {
      setFormData({
        name_en: "",
        name_gr: "",
        email: "",
        phone: "",
        bio_en: "",
        bio_gr: "",
        avatar_url: "",
        languages: ["en", "gr"],
        specialties: [],
        featured: false,
        display_order: 0,
      })
    }
    setError(null)
  }, [initialData, open])

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
        result = await updateAgent(initialData.id, formData)
      } else {
        result = await createAgent(formData)
      }

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success(`Agent ${initialData?.id ? "updated" : "created"} successfully!`)
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
          <SheetTitle>{initialData?.id ? "Edit Agent" : "Create New Agent"}</SheetTitle>
          <SheetDescription>
            {initialData?.id
              ? `Editing agent ${initialData.name_en}`
              : "Add a new agent to your team."}
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
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_gr">Name (Greek)</Label>
                <Input
                  id="name_gr"
                  value={formData.name_gr}
                  onChange={handleChange}
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
                  onChange={handleChange}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+30 123 456 7890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio_en">Bio (English)</Label>
              <Textarea
                id="bio_en"
                value={formData.bio_en}
                onChange={handleChange}
                placeholder="Agent biography in English..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio_gr">Bio (Greek)</Label>
              <Textarea
                id="bio_gr"
                value={formData.bio_gr}
                onChange={handleChange}
                placeholder="Βιογραφία πράκτορα στα ελληνικά..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Avatar</Label>
              <ImageUpload
                value={formData.avatar_url}
                onChange={(url) => setFormData((prev) => ({ ...prev, avatar_url: url }))}
                onDelete={() => setFormData((prev) => ({ ...prev, avatar_url: "" }))}
                bucket="agent-avatars"
                entityId={initialData?.id || "new"}
                label="Upload Avatar"
                maxSize={2}
                aspectRatio="square"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="featured">Featured Agent</Label>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, featured: checked }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : initialData?.id ? "Save Changes" : "Create Agent"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

