"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Trash2, FileText } from "lucide-react"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import { AdminGlassCard } from "@/components/admin-glass-card"
import { motion } from "framer-motion"
import { showToast } from "@/lib/toast"

export default function AdminPrivacyPage() {
  const [leadId, setLeadId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const supabase = createClient()

  async function handleExportData() {
    if (!leadId) {
      showToast.warning("Lead ID required", "Please enter a lead ID to export data")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Fetch all lead data
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .select(`
          *,
          viewings(*),
          lead_activity(*),
          tasks(*),
          offers(*),
          documents(*),
          consents(*)
        `)
        .eq("id", leadId)
        .single()

      if (leadError) throw leadError

      // Create downloadable JSON
      const dataStr = JSON.stringify(lead, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `lead-data-${leadId}.json`
      link.click()

      // Log audit trail
      await supabase.from("audit_logs").insert({
        entity_type: "leads",
        entity_id: leadId,
        action: "export",
        diff_json: { reason: "GDPR data export request" },
      })

      setResult("Data exported successfully")
      showToast.success("Data exported", "Lead data has been downloaded successfully")
    } catch (error) {
      console.error("Export error:", error)
      setResult("Error exporting data")
      showToast.error("Export failed", error instanceof Error ? error.message : "Failed to export data")
    }

    setLoading(false)
  }

  async function handleAnonymizeData() {
    if (!leadId) {
      showToast.warning("Lead ID required", "Please enter a lead ID to anonymize data")
      return
    }

    if (!confirm("This will permanently anonymize all personal data for this lead. Continue?")) {
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Anonymize lead data
      const { error } = await supabase
        .from("leads")
        .update({
          name: "REDACTED",
          email: `redacted-${leadId}@anonymized.local`,
          phone: null,
          message: "REDACTED",
        })
        .eq("id", leadId)

      if (error) throw error

      // Log audit trail
      await supabase.from("audit_logs").insert({
        entity_type: "leads",
        entity_id: leadId,
        action: "update",
        diff_json: { reason: "GDPR anonymization request" },
      })

      setResult("Data anonymized successfully")
      showToast.success("Data anonymized", "All personal data has been anonymized successfully")
    } catch (error) {
      console.error("Anonymization error:", error)
      setResult("Error anonymizing data")
      showToast.error("Anonymization failed", error instanceof Error ? error.message : "Failed to anonymize data")
    }

    setLoading(false)
  }

  async function handleDeleteData() {
    if (!leadId) {
      showToast.warning("Lead ID required", "Please enter a lead ID to delete data")
      return
    }

    if (!confirm("This will permanently delete all data for this lead. This action cannot be undone. Continue?")) {
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Delete lead (cascade will handle related records)
      const { error } = await supabase.from("leads").delete().eq("id", leadId)

      if (error) throw error

      setResult("Data deleted successfully")
      setLeadId("")
      showToast.success("Data deleted", "All data has been permanently deleted")
    } catch (error) {
      console.error("Deletion error:", error)
      setResult("Error deleting data")
      showToast.error("Deletion failed", error instanceof Error ? error.message : "Failed to delete data")
    }

    setLoading(false)
  }

  return (
    <AdminPageWrapper
      title="Privacy & GDPR"
      description="Manage data privacy and compliance tools"
    >
      <Tabs defaultValue="export" className="space-y-6">
        <TabsList className="bg-white/40 backdrop-blur-xl border-white/20">
          <TabsTrigger value="export" className="data-[state=active]:bg-white/60">Data Export</TabsTrigger>
          <TabsTrigger value="delete" className="data-[state=active]:bg-white/60">Data Deletion</TabsTrigger>
          <TabsTrigger value="consents" className="data-[state=active]:bg-white/60">Consent Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <AdminGlassCard index={0} title="Export Lead Data" headerActions={<Download className="h-5 w-5 text-blue-600" />}>
            <p className="text-sm text-slate-600 mb-6">Export all data associated with a lead in JSON format (GDPR Article 20)</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="export-lead-id" className="text-slate-700">Lead ID</Label>
                <Input
                  id="export-lead-id"
                  placeholder="Enter lead UUID"
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="bg-white/60 backdrop-blur-sm border-white/30"
                />
              </div>

              <Button onClick={handleExportData} disabled={loading} className="bg-white/40 backdrop-blur-xl border-white/20">
                {loading ? "Exporting..." : "Export Data"}
              </Button>

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg text-sm border backdrop-blur-sm ${
                    result.includes("Error")
                      ? "bg-red-100/80 text-red-800 border-red-200/50"
                      : "bg-green-100/80 text-green-800 border-green-200/50"
                  }`}
                >
                  {result}
                </motion.div>
              )}
            </div>
          </AdminGlassCard>
        </TabsContent>

        <TabsContent value="delete" className="space-y-6">
          <AdminGlassCard index={1} title="Delete or Anonymize Lead Data" headerActions={<Trash2 className="h-5 w-5 text-blue-600" />}>
            <p className="text-sm text-slate-600 mb-6">Permanently delete or anonymize personal data (GDPR Article 17)</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="delete-lead-id" className="text-slate-700">Lead ID</Label>
                <Input
                  id="delete-lead-id"
                  placeholder="Enter lead UUID"
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="bg-white/60 backdrop-blur-sm border-white/30"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAnonymizeData} disabled={loading} variant="outline" className="bg-white/40 backdrop-blur-sm border-white/30">
                  {loading ? "Processing..." : "Anonymize Data"}
                </Button>
                <Button onClick={handleDeleteData} disabled={loading} variant="destructive" className="bg-red-500/80 backdrop-blur-sm border-red-300/30">
                  {loading ? "Deleting..." : "Delete Data"}
                </Button>
              </div>

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg text-sm border backdrop-blur-sm ${
                    result.includes("Error")
                      ? "bg-red-100/80 text-red-800 border-red-200/50"
                      : "bg-green-100/80 text-green-800 border-green-200/50"
                  }`}
                >
                  {result}
                </motion.div>
              )}

              <div className="p-4 bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Warning:</strong> Anonymization replaces personal data with placeholder values. Deletion
                  permanently removes all records. Both actions are irreversible.
                </p>
              </div>
            </div>
          </AdminGlassCard>
        </TabsContent>

        <TabsContent value="consents" className="space-y-6">
          <AdminGlassCard index={2} title="Consent Ledger" headerActions={<FileText className="h-5 w-5 text-blue-600" />}>
            <p className="text-sm text-slate-600 mb-4">
              All consent records are automatically captured when leads submit forms, including:
            </p>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside mb-4">
              <li>Consent text shown to the user</li>
              <li>Timestamp of acceptance</li>
              <li>IP address and user agent</li>
              <li>Associated lead information</li>
            </ul>
            <div className="mt-4">
              <Button variant="outline" asChild className="bg-white/40 backdrop-blur-sm border-white/30">
                <Link href="/admin/privacy/consents">View Consent Records</Link>
              </Button>
            </div>
          </AdminGlassCard>
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  )
}
