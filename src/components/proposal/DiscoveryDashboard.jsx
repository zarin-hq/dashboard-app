import { useState } from 'react'

const AUDIT_PHASES = [
  { id: 'a', name: 'Global Elements', status: 'complete', file: 'global-elements.md' },
  { id: 'b1', name: 'Homepage', status: 'complete', file: 'pages/homepage.md' },
  { id: 'b2', name: 'Event Detail', status: 'complete', file: 'pages/event-detail.md' },
  { id: 'b3', name: 'Event Category', status: 'complete', file: 'pages/event-category.md' },
  { id: 'b4', name: 'Listing Detail', status: 'complete', file: 'pages/listing-detail.md' },
  { id: 'b5', name: 'Category Index', status: 'complete', file: 'pages/category-index.md' },
  { id: 'b6', name: 'Blog / Article', status: 'complete', file: 'pages/blog-article.md' },
  { id: 'b7', name: 'Neighborhood', status: 'complete', file: 'pages/neighborhood.md' },
  { id: 'b8', name: 'Plan Your Visit', status: 'complete', file: 'pages/plan-your-visit.md' },
  { id: 'b9', name: 'Meetings & Convention', status: 'complete', file: 'pages/meetings-convention.md' },
  { id: 'b10', name: 'Places to Stay', status: 'complete', file: 'pages/places-to-stay.md' },
  { id: 'b11', name: 'Sports', status: 'complete', file: 'pages/sports.md' },
  { id: 'b12', name: 'Hospitality Jobs', status: 'partial', file: 'pages/hospitality-jobs.md' },
  { id: 'b13', name: 'Static / Corporate', status: 'complete', file: 'pages/static-corporate.md' },
  { id: 'b14', name: 'Search Results', status: 'complete', file: 'pages/search-results.md' },
  { id: 'b15', name: 'Passes & Tickets', status: 'complete', file: 'pages/passes-tickets.md' },
  { id: 'c', name: 'User Flows', status: 'complete', file: 'user-flows.md' },
  { id: 'd', name: 'Data Sources', status: 'complete', file: 'data-sources.md' },
  { id: 'e', name: 'Integration Depth', status: 'complete', file: 'integration-depth.md' },
  { id: 'f', name: 'Backend (CMS)', status: 'deferred', file: null },
]

const PAGE_TYPES = [
  { name: 'Homepage', pattern: '/', count: 1, section: 'public' },
  { name: 'Event Detail', pattern: '/event/{category}/{slug}', count: 1800, section: 'events' },
  { name: 'Event Category Index', pattern: '/events/{category}', count: 30, section: 'events' },
  { name: 'Listing Detail', pattern: '/listing/{name}/{location}', count: 2000, section: 'listings' },
  { name: 'Category Index', pattern: '/things-to-do/{category}', count: 100, section: 'listings' },
  { name: 'Blog / Article', pattern: '/blog/stories/{slug}', count: 460, section: 'content' },
  { name: 'Neighborhood', pattern: '/salt-lake-city/{area}', count: 50, section: 'content' },
  { name: 'Plan Your Visit', pattern: '/plan-your-visit/{topic}', count: 50, section: 'content' },
  { name: 'Meetings & Convention', pattern: '/meetings/*', count: 50, section: 'meetings' },
  { name: 'Places to Stay', pattern: '/places-to-stay/*', count: 20, section: 'listings' },
  { name: 'Sports', pattern: '/sports/*', count: 15, section: 'content' },
  { name: 'Hospitality Jobs', pattern: '/hospitality-jobs/*', count: 72, section: 'admin' },
  { name: 'Static / Corporate', pattern: '/about-us/*, /members/*', count: 30, section: 'admin' },
  { name: 'Search Results', pattern: '/search', count: 1, section: 'public' },
  { name: '404 / Error', pattern: '/404', count: 1, section: 'public' },
]

const INTEGRATIONS = [
  { name: 'Simpleview CMS', status: 'confirmed', criticality: 'critical', description: 'Core platform — serves every page' },
  { name: 'Simpleview CRM', status: 'confirmed', criticality: 'critical', description: 'Source of truth for listings, events, forms' },
  { name: 'Google Tag Manager', status: 'confirmed', criticality: 'high', description: '2 containers — analytics and tracking' },
  { name: 'NowPlayingUtah', status: 'confirmed', criticality: 'high', description: 'External events feed — significant portion of ~1,800 events' },
  { name: 'TripAdvisor', status: 'confirmed', criticality: 'medium', description: 'Reviews and ratings on listing pages' },
  { name: 'VWO', status: 'confirmed', criticality: 'medium', description: 'A/B testing platform' },
  { name: 'Bandwango', status: 'partial', criticality: 'high', description: 'Pass ticketing — CTA exists but integration not visible' },
  { name: 'Act On', status: 'not-found', criticality: 'medium', description: 'Marketing automation — not found in page source' },
  { name: 'Ripe', status: 'not-found', criticality: 'unknown', description: 'Hotel booking — not found on any page' },
  { name: 'EventsForce', status: 'not-found', criticality: 'unknown', description: 'Event ticketing — not found on event pages' },
  { name: 'Mint+', status: 'not-found', criticality: 'unknown', description: 'Sales comparison tool — likely internal only' },
  { name: 'Civic Plus', status: 'not-found', criticality: 'low', description: 'ADA overlay — not visible, native ARIA present' },
  { name: 'Map Publisher', status: 'not-found', criticality: 'unknown', description: 'CRM-integrated maps — not found on inspected pages' },
  { name: 'Shopify', status: 'confirmed', criticality: 'low', description: 'External store — outbound link only' },
]

const ASSUMPTIONS = [
  { category: 'Platform', items: [
    'Current site runs entirely on Simpleview CMS',
    'We will have access to Simpleview data export for migration',
    'The rebuild will move off Simpleview entirely',
  ]},
  { category: 'Scope', items: [
    'Rebuilding both public website and CMS backend',
    'Third-party integrations replaced or re-integrated, not rebuilt',
    'New site will maintain SEO parity',
  ]},
  { category: 'Timeline', items: [
    'Target launch: end of 2026',
    'Phase 2 deep dive happens after Phase 1 approval',
  ]},
]

const RISKS = [
  { category: 'Data Migration', items: [
    'Simpleview export formats and data cleanliness unknown',
    'Large content databases (~3,800 events/listings) increase migration complexity',
    'Relational data (listings → categories, venues, neighborhoods) must be preserved',
  ]},
  { category: 'SEO', items: [
    'URL structure changes risk losing organic traffic',
    'Structured data (schema.org) must match or exceed current markup',
  ]},
  { category: 'Scope', items: [
    'Hidden complexity: seasonal logic, partner portals, booking integrations',
    'CRM depth unknown — replacement effort may exceed estimates',
  ]},
  { category: 'Timeline', items: [
    'End of 2026 is firm — scope pressure may force compromises',
  ]},
]

const OPEN_QUESTIONS = [
  { category: 'Front-end', count: 4 },
  { category: 'CMS / Backend', count: 6 },
  { category: 'SEO', count: 3 },
  { category: 'Business', count: 3 },
]

const CLIENT_QUESTIONS = [
  { category: 'Integrations & Vendors', count: 14 },
  { category: 'Content & Data', count: 11 },
  { category: 'Forms & Lead Capture', count: 5 },
  { category: 'Access & Auth', count: 4 },
  { category: 'Business & Priorities', count: 5 },
  { category: 'Technical', count: 8 },
]

function StatusBadge({ status }) {
  const styles = {
    confirmed: 'bg-emerald-100 text-emerald-700',
    partial: 'bg-amber-100 text-amber-700',
    'not-found': 'bg-red-100 text-red-700',
    complete: 'bg-emerald-100 text-emerald-700',
    deferred: 'bg-gray-100 text-gray-500',
  }
  const labels = {
    confirmed: 'Found',
    partial: 'Partial',
    'not-found': 'Not Found',
    complete: 'Complete',
    deferred: 'Deferred',
  }
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
      {labels[status] || status}
    </span>
  )
}

function CriticalityBadge({ level }) {
  const styles = {
    critical: 'text-red-600',
    high: 'text-amber-600',
    medium: 'text-blue-600',
    low: 'text-gray-500',
    unknown: 'text-gray-400',
  }
  return (
    <span className={`text-xs font-medium ${styles[level] || 'text-gray-400'}`}>
      {level}
    </span>
  )
}

function SectionBadge({ section }) {
  const styles = {
    public: 'bg-sky-100 text-sky-700',
    events: 'bg-violet-100 text-violet-700',
    listings: 'bg-emerald-100 text-emerald-700',
    content: 'bg-amber-100 text-amber-700',
    meetings: 'bg-rose-100 text-rose-700',
    admin: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${styles[section] || 'bg-gray-100 text-gray-500'}`}>
      {section}
    </span>
  )
}

function CollapsibleSection({ title, count, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-tan">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-deep hover:bg-sand-light transition-colors"
      >
        <span>{title}{count != null && <span className="ml-2 text-deep-muted font-normal">({count})</span>}</span>
        <svg className="w-4 h-4 text-deep-muted" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4 text-sm text-deep">{children}</div>}
    </div>
  )
}

export default function DiscoveryDashboard() {
  const totalUrls = 7692
  const templateCount = PAGE_TYPES.length
  const completedPhases = AUDIT_PHASES.filter(p => p.status === 'complete').length
  const totalQuestions = CLIENT_QUESTIONS.reduce((sum, c) => sum + c.count, 0)
  const confirmedIntegrations = INTEGRATIONS.filter(i => i.status === 'confirmed').length
  const notFoundIntegrations = INTEGRATIONS.filter(i => i.status === 'not-found').length

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'URLs Inventoried', value: totalUrls.toLocaleString() },
          { label: 'Page Templates', value: templateCount },
          { label: 'Audit Phases', value: `${completedPhases}/${AUDIT_PHASES.length}` },
          { label: 'Client Questions', value: `${totalQuestions}+` },
        ].map((stat) => (
          <div key={stat.label} className="p-4 border border-tan bg-sand-light text-center">
            <p className="text-2xl font-bold text-deep">{stat.value}</p>
            <p className="text-xs text-deep-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Page Types */}
      <CollapsibleSection title="Page Types" count={PAGE_TYPES.length} defaultOpen>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-tan">
                <th className="py-2 pr-4 text-xs font-semibold text-deep-muted uppercase">Template</th>
                <th className="py-2 pr-4 text-xs font-semibold text-deep-muted uppercase">Pattern</th>
                <th className="py-2 pr-4 text-xs font-semibold text-deep-muted uppercase text-right">URLs</th>
                <th className="py-2 text-xs font-semibold text-deep-muted uppercase">Section</th>
              </tr>
            </thead>
            <tbody>
              {PAGE_TYPES.map((pt) => (
                <tr key={pt.name} className="border-b border-tan/50">
                  <td className="py-2 pr-4 font-medium">{pt.name}</td>
                  <td className="py-2 pr-4 text-deep-muted font-mono text-xs">{pt.pattern}</td>
                  <td className="py-2 pr-4 text-right">{pt.count.toLocaleString()}</td>
                  <td className="py-2"><SectionBadge section={pt.section} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* Integrations */}
      <CollapsibleSection title="Third-Party Integrations" count={INTEGRATIONS.length} defaultOpen>
        <div className="space-y-1">
          <div className="flex gap-3 text-xs text-deep-muted mb-3">
            <span>{confirmedIntegrations} confirmed</span>
            <span>·</span>
            <span>{notFoundIntegrations} not found on public site</span>
          </div>
          {INTEGRATIONS.map((intg) => (
            <div key={intg.name} className="flex items-start gap-3 py-2 border-b border-tan/50 last:border-0">
              <div className="w-32 shrink-0">
                <span className="font-medium">{intg.name}</span>
              </div>
              <div className="flex-1 text-deep-muted">{intg.description}</div>
              <div className="flex items-center gap-2 shrink-0">
                <CriticalityBadge level={intg.criticality} />
                <StatusBadge status={intg.status} />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Audit Progress */}
      <CollapsibleSection title="Audit Progress" count={`${completedPhases}/${AUDIT_PHASES.length}`}>
        <div className="space-y-1">
          {AUDIT_PHASES.map((phase) => (
            <div key={phase.id} className="flex items-center gap-3 py-1.5">
              <StatusBadge status={phase.status} />
              <span>{phase.name}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Assumptions & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CollapsibleSection title="Assumptions" count={ASSUMPTIONS.reduce((s, a) => s + a.items.length, 0)}>
          {ASSUMPTIONS.map((group) => (
            <div key={group.category} className="mb-3 last:mb-0">
              <p className="font-semibold mb-1">{group.category}</p>
              <ul className="list-disc list-inside space-y-0.5 text-deep-muted">
                {group.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          ))}
        </CollapsibleSection>

        <CollapsibleSection title="Risks" count={RISKS.reduce((s, r) => s + r.items.length, 0)}>
          {RISKS.map((group) => (
            <div key={group.category} className="mb-3 last:mb-0">
              <p className="font-semibold mb-1">{group.category}</p>
              <ul className="list-disc list-inside space-y-0.5 text-deep-muted">
                {group.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          ))}
        </CollapsibleSection>
      </div>

      {/* Client Questions */}
      <CollapsibleSection title="Questions for Client" count={totalQuestions}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CLIENT_QUESTIONS.map((cat) => (
            <div key={cat.category} className="p-3 border border-tan/50 bg-sand-light">
              <p className="text-lg font-bold text-deep">{cat.count}</p>
              <p className="text-xs text-deep-muted">{cat.category}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Open Questions */}
      <CollapsibleSection title="Open Questions" count={OPEN_QUESTIONS.reduce((s, q) => s + q.count, 0)}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {OPEN_QUESTIONS.map((cat) => (
            <div key={cat.category} className="p-3 border border-tan/50 bg-sand-light">
              <p className="text-lg font-bold text-deep">{cat.count}</p>
              <p className="text-xs text-deep-muted">{cat.category}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  )
}
