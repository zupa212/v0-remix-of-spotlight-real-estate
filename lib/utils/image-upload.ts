import { createClient } from "@/lib/supabase/client"

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

/**
 * Upload a property image to Supabase Storage
 */
export async function uploadPropertyImage(
  file: File,
  propertyId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  const supabase = createClient()

  // Validate file type
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!validTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.")
  }

  // Validate file size (5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error("File size exceeds 5MB limit.")
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop()
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 15)
  const fileName = `${propertyId}/${timestamp}-${randomStr}.${fileExt}`

  // Upload with progress tracking
  const { data, error } = await supabase.storage
    .from("property-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (error) {
    console.error("Upload error:", error)
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("property-images").getPublicUrl(fileName)

  return publicUrl
}

/**
 * Upload an agent avatar to Supabase Storage
 */
export async function uploadAgentAvatar(
  file: File,
  agentId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  const supabase = createClient()

  // Validate file type
  const validTypes = ["image/jpeg", "image/png", "image/webp"]
  if (!validTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed.")
  }

  // Validate file size (2MB)
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error("File size exceeds 2MB limit.")
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop()
  const timestamp = Date.now()
  const fileName = `${agentId}/${timestamp}.${fileExt}`

  // Upload
  const { data, error } = await supabase.storage.from("agent-avatars").upload(fileName, file, {
    cacheControl: "3600",
    upsert: true, // Replace existing avatar
  })

  if (error) {
    console.error("Upload error:", error)
    throw new Error(`Failed to upload avatar: ${error.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("agent-avatars").getPublicUrl(fileName)

  return publicUrl
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(bucket: "property-images" | "agent-avatars", path: string): Promise<void> {
  const supabase = createClient()

  // Extract path from full URL if needed
  const imagePath = path.includes("/storage/v1/object/public/") 
    ? path.split("/storage/v1/object/public/")[1]?.split("/").slice(1).join("/")
    : path

  const { error } = await supabase.storage.from(bucket).remove([imagePath])

  if (error) {
    console.error("Delete error:", error)
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}

/**
 * Resize image on client side (optional optimization)
 */
export function resizeImage(file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Failed to get canvas context"))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob"))
              return
            }
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(resizedFile)
          },
          file.type,
          quality
        )
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}

