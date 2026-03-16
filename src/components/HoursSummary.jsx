import { useProject } from '../hooks/useProject'

export default function HoursSummary() {
  const { state, totalHours, hoursByPage } = useProject()

  if (state.annotations.length === 0) {
    return null
  }

  // Build page → annotations mapping
  const screenshotToPage = {}
  for (const s of state.screenshots) {
    screenshotToPage[s.id] = s.pageId
  }
  const pageMap = {}
  for (const page of state.pages) {
    pageMap[page.id] = { page, annotations: [] }
  }
  for (const a of state.annotations) {
    const pageId = screenshotToPage[a.screenshotId]
    if (pageId && pageMap[pageId]) {
      pageMap[pageId].annotations.push(a)
    }
  }

  const sumField = (anns, field) => anns.reduce((s, a) => s + (a[field] || 0), 0)
  const allAnnotations = state.annotations

  return (
    <div className="rounded-xl border border-tan bg-sand-light p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-deep-muted uppercase tracking-wide">Estimate Summary</h3>
        <span className="text-lg font-bold text-deep">{totalHours}h total</span>
      </div>

      <div className="flex gap-4 text-xs">
        <span className="text-purple-600 font-medium">Design: {sumField(allAnnotations, 'designHours')}h</span>
        <span className="text-blue-600 font-medium">FE: {sumField(allAnnotations, 'frontendHours')}h</span>
        <span className="text-emerald-600 font-medium">BE: {sumField(allAnnotations, 'backendHours')}h</span>
      </div>

      <div className="space-y-3">
        {state.pages.map((page) => {
          const entry = pageMap[page.id]
          if (!entry || entry.annotations.length === 0) return null
          return (
            <div key={page.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-deep">{page.name}</span>
                <span className="text-sm font-semibold text-deep-muted">
                  {hoursByPage[page.id] || 0}h
                </span>
              </div>
              <div className="space-y-0.5 pl-3">
                {entry.annotations.map((a) => {
                  const total = (a.designHours || 0) + (a.frontendHours || 0) + (a.backendHours || 0)
                  return (
                    <div key={a.id} className="flex items-center justify-between text-xs text-deep-muted">
                      <span className="truncate">{a.label || 'Unlabeled section'}</span>
                      <span className="ml-2 tabular-nums">{total}h</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
