"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Upload, GripVertical, Image as ImageIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadPropertyImage, deleteImage } from "@/lib/utils/image-upload"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface PropertyImage {
  id: string
  url: string
  alt_text: string | null
  display_order: number
}

interface AdminPropertyImageUploaderProps {
  propertyId: string
  initialImages?: PropertyImage[]
  onImagesChange?: (images: PropertyImage[]) => void
  maxImages?: number
}

function SortableImageItem({
  image,
  onUpdateAlt,
  onDelete,
}: {
  image: PropertyImage
  onUpdateAlt: (id: string, alt: string) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative border rounded-lg overflow-hidden bg-muted",
        isDragging && "ring-2 ring-primary"
      )}
    >
      <AspectRatio ratio={16 / 9}>
        <img src={image.url} alt={image.alt_text || ""} className="w-full h-full object-cover" />
      </AspectRatio>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 bg-background/90 rounded"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-foreground" />
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(image.id)}
          className="bg-background/90"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/70">
        <Input
          placeholder="Alt text (optional)"
          value={image.alt_text || ""}
          onChange={(e) => onUpdateAlt(image.id, e.target.value)}
          className="h-7 text-xs bg-background/90"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )
}

export function AdminPropertyImageUploader({
  propertyId,
  initialImages = [],
  onImagesChange,
  maxImages = 20,
}: AdminPropertyImageUploaderProps) {
  const [images, setImages] = useState<PropertyImage[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  React.useEffect(() => {
    // Update images when initialImages prop changes
    // Only update if the IDs or URLs are different to avoid unnecessary re-renders
    const initialIds = new Set(initialImages.map(img => img.id))
    const currentIds = new Set(images.map(img => img.id))
    const idsMatch = initialIds.size === currentIds.size && 
                     Array.from(initialIds).every(id => currentIds.has(id))
    
    if (!idsMatch || initialImages.length !== images.length) {
      setImages(initialImages)
    }
  }, [initialImages, images])

  React.useEffect(() => {
    onImagesChange?.(images)
  }, [images, onImagesChange])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    setError(null)
    setUploading(true)

    try {
      const newImages: PropertyImage[] = []

      for (const file of files) {
        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
        if (!validTypes.includes(file.type)) {
          toast.error(`${file.name}: Invalid file type`)
          continue
        }

        // Validate file size (5MB)
        const maxSizeBytes = 5 * 1024 * 1024
        if (file.size > maxSizeBytes) {
          toast.error(`${file.name}: File size exceeds 5MB`)
          continue
        }

        // Upload image
        const url = await uploadPropertyImage(file, propertyId || "temp")

        // Save to property_images table if propertyId exists
        if (propertyId && propertyId !== "temp") {
          const { data, error: insertError } = await supabase
            .from("property_images")
            .insert({
              property_id: propertyId,
              image_url: url,
              alt_text: null,
              display_order: images.length + newImages.length,
            })
            .select()
            .single()

          if (insertError) {
            console.error("Error saving image to database:", insertError)
            // Continue anyway, image is uploaded
          } else if (data) {
            newImages.push({
              id: data.id,
              url: data.image_url,
              alt_text: data.alt_text,
              display_order: data.display_order,
            })
            continue
          }
        }

        // Fallback: create temporary image object
        newImages.push({
          id: `temp-${Date.now()}-${Math.random()}`,
          url,
          alt_text: null,
          display_order: images.length + newImages.length,
        })
      }

      setImages((prev) => [...prev, ...newImages])
      toast.success(`Uploaded ${newImages.length} image(s)`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload images"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async (imageId: string) => {
    const image = images.find((img) => img.id === imageId)
    if (!image) return

    try {
      // Delete from storage if it's a real image (not temp)
      if (!imageId.startsWith("temp-")) {
        // Extract path from URL
        const urlParts = image.url.split("/")
        const path = urlParts.slice(urlParts.indexOf("property-images")).join("/")

        await deleteImage("property-images", path)

        // Delete from database
        if (propertyId && propertyId !== "temp") {
          await supabase.from("property_images").delete().eq("id", imageId)
        }
      }

      setImages((prev) => {
        const updated = prev.filter((img) => img.id !== imageId)
        // Reorder display_order
        return updated.map((img, index) => ({ ...img, display_order: index }))
      })

      toast.success("Image deleted")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete image"
      toast.error(errorMessage)
    }
  }

  const handleUpdateAlt = async (imageId: string, altText: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, alt_text: altText } : img))
    )

    // Update in database if not temp
    if (!imageId.startsWith("temp-") && propertyId && propertyId !== "temp") {
      await supabase
        .from("property_images")
        .update({ alt_text: altText || null })
        .eq("id", imageId)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    setImages((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      const reordered = arrayMove(items, oldIndex, newIndex)

      // Update display_order in database
      if (propertyId && propertyId !== "temp") {
        reordered.forEach(async (img, index) => {
          if (!img.id.startsWith("temp-")) {
            await supabase
              .from("property_images")
              .update({ display_order: index })
              .eq("id", img.id)
          }
        })
      }

      return reordered.map((img, index) => ({ ...img, display_order: index }))
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files || [])
    if (files.length === 0) return

    const syntheticEvent = {
      target: { files },
    } as React.ChangeEvent<HTMLInputElement>

    handleFileSelect(syntheticEvent)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Property Images ({images.length}/{maxImages})</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Add Images
            </>
          )}
        </Button>
      </div>

      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 transition-colors",
          uploading ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          error && "border-destructive bg-destructive/5"
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {images.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop images here, or click "Add Images" to select
            </p>
            <p className="text-xs text-muted-foreground">Max {maxImages} images, 5MB each</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={images.map((img) => img.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <SortableImageItem
                    key={image.id}
                    image={image}
                    onUpdateAlt={handleUpdateAlt}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <Input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>}
    </div>
  )
}

