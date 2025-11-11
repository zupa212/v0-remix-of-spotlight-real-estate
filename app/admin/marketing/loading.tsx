import { DashboardSkeleton } from "@/components/loading-skeletons"

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="lg:pl-64">
        <div className="p-8">
          <DashboardSkeleton />
        </div>
      </div>
    </div>
  )
}
