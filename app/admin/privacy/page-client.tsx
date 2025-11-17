"use client"

import * as React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Shield, FileText } from "lucide-react"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function AdminPrivacyPageClient() {
  const [selectedLeadId, setSelectedLeadId] = React.useState<string | null>(null)

  return (
    <AdminPageWrapper
      title="Privacy"
      description="GDPR compliance tools and consent management"
    >
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Privacy</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Warning Alert */}
      <Alert variant="destructive" className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertTitle>Destructive Actions</AlertTitle>
        <AlertDescription>
          The actions below are permanent and cannot be undone. Please proceed with caution.
        </AlertDescription>
      </Alert>

      {/* GDPR Tools */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Export Lead Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Export all data associated with a lead in a GDPR-compliant format.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Lead ID or Email"
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anonymize Lead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Permanently anonymize a lead's personal data while preserving analytics.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Lead ID or Email"
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Anonymize</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently anonymize the lead's
                      personal data including name, email, phone, and other identifying information.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground">
                      Anonymize
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consent Ledger */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Consent Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            View and manage consent records for all leads.
          </p>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            View Consent Ledger
          </Button>
        </CardContent>
      </Card>
    </AdminPageWrapper>
  )
}


