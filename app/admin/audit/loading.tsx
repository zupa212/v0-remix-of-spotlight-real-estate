import { TableSkeleton } from "@/components/loading-skeletons"

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="lg:pl-64">
        <div className="p-8">
          <div className="mb-8">
            <div className="h-8 bg-slate-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-96 animate-pulse"></div>
          </div>
          <TableSkeleton rows={15} cols={7} />
        </div>
      </div>
    </div>
  )
}
