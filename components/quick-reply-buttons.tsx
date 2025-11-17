"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, Send } from "lucide-react"
import { replyWhatsApp, replyTelegram } from "@/lib/actions/leads"
import { toast } from "sonner"
import { useState } from "react"

type QuickReplyButtonsProps = {
  leadId: string
  leadName: string
  leadPhone?: string
}

export function QuickReplyButtons({ leadId, leadName, leadPhone }: QuickReplyButtonsProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleWhatsAppReply() {
    if (!leadPhone) {
      toast.error("No phone number available for this lead")
      return
    }

    setIsLoading(true)
    try {
      const result = await replyWhatsApp(leadId)
      
      if (result.success && result.data) {
        // Open WhatsApp in new tab
        window.open(result.data.url, "_blank")
        toast.success("WhatsApp conversation opened")
      } else {
        toast.error(result.error || "Failed to open WhatsApp")
      }
    } catch (error) {
      toast.error("Failed to open WhatsApp")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleTelegramReply() {
    if (!leadPhone) {
      toast.error("No phone number available for this lead")
      return
    }

    setIsLoading(true)
    try {
      const result = await replyTelegram(leadId)
      
      if (result.success && result.data) {
        // Open Telegram in new tab
        window.open(result.data.url, "_blank")
        toast.success("Telegram conversation opened")
      } else {
        toast.error(result.error || "Failed to open Telegram")
      }
    } catch (error) {
      toast.error("Failed to open Telegram")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleWhatsAppReply}
        className="gap-2"
        disabled={!leadPhone || isLoading}
        aria-label="Reply via WhatsApp"
      >
        <MessageCircle className="h-4 w-4 text-green-600" />
        WhatsApp
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleTelegramReply}
        className="gap-2"
        disabled={!leadPhone || isLoading}
        aria-label="Reply via Telegram"
      >
        <Send className="h-4 w-4 text-blue-600" />
        Telegram
      </Button>
    </div>
  )
}
