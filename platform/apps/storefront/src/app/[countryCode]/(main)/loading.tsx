/** Route-level loading UI — keeps perceived performance high without blocking SEO HTML on full navigations. */
export default function Loading() {
  return (
    <div className="content-container py-16 animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-3 w-24 bg-crease rounded mb-4" />
      <div className="h-10 w-2/3 max-w-md bg-crease rounded mb-8" />
      <div className="grid grid-cols-2 small:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[4/5] bg-crease rounded-xl" />
            <div className="h-3 w-3/4 bg-crease rounded" />
            <div className="h-3 w-1/2 bg-crease rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
