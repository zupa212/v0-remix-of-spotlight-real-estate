"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadPropertyImage, uploadAgentAvatar, deleteImage, resizeImage } from "@/lib/utils/image-upload"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onDelete?: () => void
  bucket: "property-images" | "agent-avatars"
  entityId: string
  label?: string
  maxSize?: number
  aspectRatio?: "square" | "wide" | "auto"
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  onDelete,
  bucket,
  entityId,
  label = "Upload Image",
  maxSize = bucket === "property-images" ? 5 : 2,
  aspectRatio = "auto",
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
      if (!validTypes.includes(file.type)) {
        throw new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.")
      }

      // Validate file size
      const maxSizeBytes = maxSize * 1024 * 1024
      if (file.size > maxSizeBytes) {
        throw new Error(`File size exceeds ${maxSize}MB limit.`)
      }

      // Resize if needed (optional optimization)
      let fileToUpload = file
      if (bucket === "property-images") {
        // Resize property images to max 1920x1080
        try {
          fileToUpload = await resizeImage(file, 1920, 1080, 0.85)
        } catch (resizeError) {
          console.warn("Failed to resize image, uploading original:", resizeError)
          fileToUpload = file
        }
      } else if (bucket === "agent-avatars") {
        // Resize avatars to max 800x800
        try {
          fileToUpload = await resizeImage(file, 800, 800, 0.9)
        } catch (resizeError) {
          console.warn("Failed to resize image, uploading original:", resizeError)
          fileToUpload = file
        }
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(fileToUpload)

      // Upload based on bucket type
      let url: string
      if (bucket === "property-images") {
        url = await uploadPropertyImage(fileToUpload, entityId)
      } else {
        url = await uploadAgentAvatar(fileToUpload, entityId)
      }

      onChange(url)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload image"
      setError(errorMessage)
      console.error("Upload error:", err)
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async () => {
    if (!value) return

    try {
      await deleteImage(bucket, value)
      setPreview(null)
      onChange("")
      onDelete?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete image"
      setError(errorMessage)
      console.error("Delete error:", err)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Create a synthetic event
    const syntheticEvent = {
      target: { files: [file] },
    } as React.ChangeEvent<HTMLInputElement>

    handleFileSelect(syntheticEvent)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}

      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors",
          uploading ? "border-blue-300 bg-blue-50" : "border-slate-300 hover:border-slate-400",
          error && "border-red-300 bg-red-50"
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <div
              className={cn(
                "relative overflow-hidden rounded-lg bg-slate-100",
                aspectRatio === "square" && "aspect-square",
                aspectRatio === "wide" && "aspect-video",
                aspectRatio === "auto" && "aspect-auto"
              )}
            >
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Replace
                  </>
                )}
              </Button>
              <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={uploading}>
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <p className="text-sm text-slate-600 mb-2">
              Drag and drop an image here, or click to select
            </p>
            <p className="text-xs text-slate-500 mb-4">Max size: {maxSize}MB</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Select Image
                </>
              )}
            </Button>
          </div>
        )}

        <Input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}

      {value && !preview && (
        <div className="text-sm text-slate-600">
          <p>Current image URL: {value.substring(0, 50)}...</p>
          <Button type="button" variant="outline" size="sm" onClick={handleDelete} className="mt-2">
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      )}
    </div>
  )
}

