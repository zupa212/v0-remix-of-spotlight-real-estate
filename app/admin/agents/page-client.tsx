"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminAgentsGrid } from "@/components/admin-agents-grid"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import { AdminAgentFormSheet } from "@/components/admin-agent-form-sheet"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { Agent } from "@/lib/hooks/use-agents"

export function AdminAgentsPageClient() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [editingAgent, setEditingAgent] = React.useState<Agent | undefined>(undefined)

  const handleNewAgentClick = () => {
    setEditingAgent(undefined)
    setIsSheetOpen(true)
  }

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent)
    setIsSheetOpen(true)
  }

  return (
    <AdminPageWrapper
      title="Agents"
      description="Manage your real estate agents"
      headerActions={
        <Button onClick={handleNewAgentClick}>
          <Plus className="mr-2 h-4 w-4" />
          New Agent
        </Button>
      }
    >
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Agents</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Agents Grid */}
      <AdminAgentsGrid onEditAgent={handleEditAgent} />

      {/* Agent Create/Edit Sheet */}
      <AdminAgentFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        initialData={editingAgent}
      />
    </AdminPageWrapper>
  )
}


