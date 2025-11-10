"use client"

import { Share2, Facebook, Twitter, Linkedin, Mail, Link2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ShareButtonsProps {
  url: string
  title: string
  description?: string
  className?: string
}

export function ShareButtons({ url, title, description, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const shareUrl = encodeURIComponent(url)
  const shareTitle = encodeURIComponent(title)
  const shareDescription = encodeURIComponent(description || "")

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
    email: `mailto:?subject=${shareTitle}&body=${shareDescription}%20${shareUrl}`,
  }

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400")
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="border-[#E0E0E0] hover:bg-[#F8F8F8]">
            <Share2 className="h-5 w-5 text-[#333333]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleShare("facebook")}>
            <Facebook className="h-4 w-4 mr-2" />
            Share on Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("twitter")}>
            <Twitter className="h-4 w-4 mr-2" />
            Share on Twitter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("linkedin")}>
            <Linkedin className="h-4 w-4 mr-2" />
            Share on LinkedIn
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("email")}>
            <Mail className="h-4 w-4 mr-2" />
            Share via Email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-600" />
                Link Copied!
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4 mr-2" />
                Copy Link
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

