"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminBackButton } from "@/components/admin-back-button"
import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Trash2, FileText } from "lucide-react"

export default function AdminPrivacyPage() {
  const [leadId, setLeadId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const supabase = createClient()

  async function handleExportData() {
    if (!leadId) {
      alert("Please enter a lead ID")
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
    } catch (error) {
      console.error("Export error:", error)
      setResult("Error exporting data")
    }

    setLoading(false)
  }

  async function handleAnonymizeData() {
    if (!leadId) {
      alert("Please enter a lead ID")
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
    } catch (error) {
      console.error("Anonymization error:", error)
      setResult("Error anonymizing data")
    }

    setLoading(false)
  }

  async function handleDeleteData() {
    if (!leadId) {
      alert("Please enter a lead ID")
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
    } catch (error) {
      console.error("Deletion error:", error)
      setResult("Error deleting data")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="lg:pl-64">
        <div className="p-8 space-y-6">
          <AdminBreadcrumbs items={[{ label: "Privacy & GDPR" }]} />
          <AdminBackButton href="/admin" label="Back to Dashboard" />
          
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy & GDPR</h1>
            <p className="text-slate-600">Manage data privacy and compliance tools</p>
          </div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList>
          <TabsTrigger value="export">Data Export</TabsTrigger>
          <TabsTrigger value="delete">Data Deletion</TabsTrigger>
          <TabsTrigger value="consents">Consent Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Lead Data
              </CardTitle>
              <CardDescription>Export all data associated with a lead in JSON format (GDPR Article 20)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="export-lead-id">Lead ID</Label>
                <Input
                  id="export-lead-id"
                  placeholder="Enter lead UUID"
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                />
              </div>

              <Button onClick={handleExportData} disabled={loading}>
                {loading ? "Exporting..." : "Export Data"}
              </Button>

              {result && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    result.includes("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {result}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delete" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete or Anonymize Lead Data
              </CardTitle>
              <CardDescription>Permanently delete or anonymize personal data (GDPR Article 17)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="delete-lead-id">Lead ID</Label>
                <Input
                  id="delete-lead-id"
                  placeholder="Enter lead UUID"
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAnonymizeData} disabled={loading} variant="outline">
                  {loading ? "Processing..." : "Anonymize Data"}
                </Button>
                <Button onClick={handleDeleteData} disabled={loading} variant="destructive">
                  {loading ? "Deleting..." : "Delete Data"}
                </Button>
              </div>

              {result && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    result.includes("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {result}
                </div>
              )}

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Warning:</strong> Anonymization replaces personal data with placeholder values. Deletion
                  permanently removes all records. Both actions are irreversible.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Consent Ledger
              </CardTitle>
              <CardDescription>View and manage consent records for data processing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                All consent records are automatically captured when leads submit forms, including:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Consent text shown to the user</li>
                <li>Timestamp of acceptance</li>
                <li>IP address and user agent</li>
                <li>Associated lead information</li>
              </ul>
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <Link href="/admin/privacy/consents">View Consent Records</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  )
}
