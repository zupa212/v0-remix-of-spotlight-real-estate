"use client"

import * as React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AdminErrorAlertProps {
  title?: string
  description: string
  onRetry?: () => void
  className?: string
}

export function AdminErrorAlert({
  title = "Error",
  description,
  onRetry,
  className,
}: AdminErrorAlertProps) {
  return (
    <Alert variant="destructive" className={cn("mb-4", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{description}</span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-4"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}


