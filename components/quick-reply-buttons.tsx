"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, Send } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

type QuickReplyButtonsProps = {
  leadId: string
  leadName: string
  leadPhone?: string
}

export function QuickReplyButtons({ leadId, leadName, leadPhone }: QuickReplyButtonsProps) {
  const supabase = createBrowserClient()

  async function handleWhatsAppReply() {
    if (!leadPhone) {
      alert("No phone number available for this lead")
      return
    }

    // Log activity
    await supabase.from("lead_activity").insert({
      lead_id: leadId,
      type: "whatsapp",
      content: `Opened WhatsApp conversation with ${leadName}`,
    })

    // Open WhatsApp
    const cleanPhone = leadPhone.replace(/\D/g, "")
    window.open(`https://wa.me/${cleanPhone}`, "_blank")
  }

  async function handleTelegramReply() {
    if (!leadPhone) {
      alert("No phone number available for this lead")
      return
    }

    // Log activity
    await supabase.from("lead_activity").insert({
      lead_id: leadId,
      type: "telegram",
      content: `Opened Telegram conversation with ${leadName}`,
    })

    // Open Telegram (requires username, this is a placeholder)
    alert("Telegram integration requires username. Please configure in settings.")
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleWhatsAppReply}
        className="gap-2 bg-transparent"
        disabled={!leadPhone}
      >
        <MessageCircle className="h-4 w-4 text-green-600" />
        WhatsApp
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleTelegramReply}
        className="gap-2 bg-transparent"
        disabled={!leadPhone}
      >
        <Send className="h-4 w-4 text-blue-600" />
        Telegram
      </Button>
    </div>
  )
}
