import { Suspense } from "react"
import PropertiesPageClient from "./page-client"

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <p className="text-slate-600">Loading properties...</p>
        </div>
      }
    >
      <PropertiesPageClient />
    </Suspense>
  )
}
