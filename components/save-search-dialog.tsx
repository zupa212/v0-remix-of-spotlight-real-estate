"use client"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell } from "lucide-react"

type SaveSearchDialogProps = {
  filters: Record<string, any>
}

export function SaveSearchDialog({ filters }: SaveSearchDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [channels, setChannels] = useState<string[]>(["email"])
  const [frequency, setFrequency] = useState("daily")
  const [saving, setSaving] = useState(false)

  const supabase = createBrowserClient()

  async function handleSave() {
    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("Please sign in to save searches")
      setSaving(false)
      return
    }

    const { error } = await supabase.from("saved_searches").insert({
      user_id: user.id,
      name,
      filters_json: filters,
      channels,
      frequency,
      is_active: true,
    })

    if (error) {
      console.error("Error saving search:", error)
      alert("Failed to save search")
    } else {
      alert("Search saved successfully! You will receive alerts when new properties match your criteria.")
      setOpen(false)
      setName("")
      setChannels(["email"])
      setFrequency("daily")
    }

    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Bell className="h-4 w-4" />
          Save Search
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Search & Get Alerts</DialogTitle>
          <DialogDescription>Get notified when new properties match your search criteria</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Search Name</Label>
            <Input
              id="name"
              placeholder="e.g., Luxury Villas in Mykonos"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Alert Channels</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={channels.includes("email")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setChannels([...channels, "email"])
                    } else {
                      setChannels(channels.filter((c) => c !== "email"))
                    }
                  }}
                />
                <label htmlFor="email" className="text-sm">
                  Email
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp"
                  checked={channels.includes("whatsapp")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setChannels([...channels, "whatsapp"])
                    } else {
                      setChannels(channels.filter((c) => c !== "whatsapp"))
                    }
                  }}
                />
                <label htmlFor="whatsapp" className="text-sm">
                  WhatsApp
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="telegram"
                  checked={channels.includes("telegram")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setChannels([...channels, "telegram"])
                    } else {
                      setChannels(channels.filter((c) => c !== "telegram"))
                    }
                  }}
                />
                <label htmlFor="telegram" className="text-sm">
                  Telegram
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Alert Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instant (as they arrive)</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name || channels.length === 0 || saving}>
            {saving ? "Saving..." : "Save Search"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
