export default function PropertyDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="animate-pulse">
        <div className="h-96 bg-slate-200"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-slate-200 rounded"></div>
              <div className="h-32 bg-slate-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-96 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

