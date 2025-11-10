export default function PropertiesLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-32 pb-12 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="h-12 bg-slate-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="h-10 bg-slate-200 rounded w-96 mb-4 animate-pulse"></div>
          <div className="h-6 bg-slate-200 rounded w-64 animate-pulse"></div>
        </div>
      </div>
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-slate-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

