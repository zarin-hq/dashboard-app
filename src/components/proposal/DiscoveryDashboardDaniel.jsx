import { useState } from 'react'

const PAGE_TYPES = [
  { name: 'Listing Detail', pattern: '/listing/{slug}/{id}/', count: 4629, section: 'listings' },
  { name: 'Event Detail', pattern: '/event/{category}/{slug}/{id}/', count: 1898, section: 'events' },
  { name: 'Blog Post', pattern: '/blog/stories/post/{slug}/', count: 310, section: 'content' },
  { name: 'PR Articles', pattern: '/articles/post/{slug}/', count: 206, section: 'content' },
  { name: 'Things To Do', pattern: '/things-to-do/{category}/', count: 112, section: 'listings' },
  { name: 'Convention Microsites', pattern: '/{convention-slug}/', count: 79, section: 'microsites' },
  { name: 'Hospitality Jobs', pattern: '/hospitality-jobs/{slug}/{id}/', count: 76, section: 'listings' },
  { name: 'Plan Your Visit', pattern: '/plan-your-visit/{topic}/', count: 63, section: 'content' },
  { name: 'Meetings Microsite', pattern: '/meetings/{section}/', count: 46, section: 'meetings' },
  { name: 'Neighborhoods & Areas', pattern: '/salt-lake-city/{area}/', count: 104, section: 'content' },
  { name: 'Restaurants', pattern: '/restaurants/{category}/', count: 32, section: 'listings' },
  { name: 'Places To Stay', pattern: '/places-to-stay/{type}/', count: 15, section: 'listings' },
  { name: 'Sports', pattern: '/sports/{section}/', count: 20, section: 'content' },
  { name: 'B2B Sections', pattern: '/travel-trade/, /film/, /speak-salt-lake/', count: 27, section: 'content' },
  { name: 'Landing Pages', pattern: '/{campaign-slug}/', count: 16, section: 'microsites' },
  { name: 'Static / Corporate', pattern: '/about-us/, /members/, /press-research/', count: 30, section: 'admin' },
  { name: 'Homepage', pattern: '/', count: 1, section: 'public' },
  { name: 'Search Results', pattern: '/search/', count: 1, section: 'public' },
  { name: 'System Pages', pattern: '/compare/, /rfp/, /staff-list/', count: 20, section: 'admin' },
]

const INTEGRATIONS = [
  { name: 'Simpleview CMS', status: 'confirmed', criticality: 'critical', description: 'Core platform — serves every page, 70+ Page Builder widgets' },
  { name: 'Simpleview CRM', status: 'confirmed', criticality: 'critical', description: 'Source of truth for 4,629 listings + 1,898 events' },
  { name: 'Google Tag Manager', status: 'confirmed', criticality: 'high', description: '2 containers (GTM-5L5W32, GTM-NFBVG93) — all analytics flow through these' },
  { name: 'Google Analytics 4', status: 'confirmed', criticality: 'high', description: '4 GA4 properties tracking site activity' },
  { name: 'Outdooractive + Leaflet', status: 'confirmed', criticality: 'high', description: 'Interactive maps on all listing detail pages' },
  { name: 'Connect Pass', status: 'confirmed', criticality: 'high', description: 'Persistent shopping cart for experience passes' },
  { name: 'CrowdRiff', status: 'confirmed', criticality: 'high', description: 'UGC social photo gallery on homepage and key pages' },
  { name: 'NowPlayingUtah', status: 'confirmed', criticality: 'high', description: 'External events feed — significant portion of events' },
  { name: 'RootRez', status: 'confirmed', criticality: 'high', description: 'Hotel booking widget on Places To Stay' },
  { name: 'TripAdvisor', status: 'confirmed', criticality: 'medium', description: 'Reviews and ratings on listing cards and detail pages' },
  { name: 'Yelp', status: 'confirmed', criticality: 'medium', description: 'Review integration on listing detail pages' },
  { name: 'GTranslate', status: 'confirmed', criticality: 'medium', description: '8-language translation widget (client-side)' },
  { name: 'Vimeo', status: 'confirmed', criticality: 'medium', description: 'Video hosting via Plyr player — 136 videos' },
  { name: 'Threshold360', status: 'confirmed', criticality: 'medium', description: '360° virtual tour viewer on some listing pages' },
  { name: 'Act On', status: 'confirmed', criticality: 'medium', description: 'Marketing automation — connected via CRM form submissions' },
  { name: 'Facebook Pixel', status: 'confirmed', criticality: 'medium', description: '3 pixels for social retargeting' },
  { name: 'Microsoft Clarity', status: 'confirmed', criticality: 'low', description: 'Session recording and heatmaps' },
  { name: 'Mouseflow', status: 'confirmed', criticality: 'low', description: 'Session recording (redundant with Clarity)' },
  { name: 'Monsido', status: 'confirmed', criticality: 'low', description: 'Accessibility monitoring — 3 scripts' },
  { name: 'Sojern', status: 'confirmed', criticality: 'low', description: 'Travel industry retargeting — 2 tags' },
  { name: 'DoubleClick', status: 'confirmed', criticality: 'medium', description: 'Display advertising — 4 tags' },
  { name: 'Google Ads', status: 'confirmed', criticality: 'medium', description: 'Search/display advertising' },
  { name: 'Pinterest', status: 'confirmed', criticality: 'low', description: 'Conversion tracking' },
  { name: 'LinkedIn Insights', status: 'confirmed', criticality: 'low', description: 'Conversion tracking' },
  { name: 'Shopify', status: 'confirmed', criticality: 'low', description: 'External store — "Local Crafts & Gifts" outbound link' },
  { name: 'Bandwango', status: 'partial', criticality: 'high', description: 'Pass/ticketing platform — CTA exists but mechanism needs verification' },
  { name: 'VWO', status: 'confirmed', criticality: 'medium', description: 'A/B testing platform — active experiments on homepage' },
  { name: 'Weather API', status: 'confirmed', criticality: 'medium', description: 'Real-time weather widget in header on every page' },
]

const CMS_BACKEND = [
  { label: 'Collection Types', value: '15', detail: 'Alerts, Hero Slides, FAQ, Slides, Vertical Videos, Staff, and 9 more' },
  { label: 'Page Builder Widgets', value: '70+', detail: 'Layout, navigation, collections, CTAs, dynamic content, search, social, utilities' },
  { label: 'Backend Layouts', value: '11', detail: 'Default, Main Nav, Footer Nav, Secondary Nav, Meetings, Sports, Ski, Microsite' },
  { label: 'User Roles', value: '9', detail: 'Admin, Marketing (no delete), PR Team, SMG Access, Membership, HR, and 3 more' },
  { label: 'Translation Namespaces', value: '10', detail: 'Common, Events, Listings, Offers, Search, Trip Builder, Media Gallery, Trails' },
  { label: 'CMS Tags', value: '1,432', detail: 'System-wide tags — ~40% are image-specific with "Image >" prefix' },
  { label: 'Blog Tags', value: '280', detail: 'Fine-grained tagging for blog posts' },
  { label: 'Redirects', value: '9,156', detail: 'URL redirect rules — critical for SEO migration' },
  { label: 'Personas', value: '7', detail: 'Craft Beverages, Family Fun, LGBTQ, Leisure, Outdoor, Restaurants, Winter' },
]

const MEDIA_LIBRARY = [
  { type: 'Images', count: '3,110', detail: '12 fields each — alt text, credits, focal points, categories, expiration' },
  { type: 'Documents', count: '590', detail: 'PDFs, DOCs, PPTs — categorized by file type' },
  { type: 'Videos', count: '136', detail: 'URL references to Vimeo — 7 categories' },
  { type: 'External Links', count: '68', detail: 'Reusable link objects — update once, reflects everywhere' },
]

const PERFORMANCE = [
  { metric: 'Performance', score: 50, detail: 'Listing pages weakest at 43' },
  { metric: 'Accessibility', score: 86, detail: 'Strong baseline — Meetings pages highest at 92' },
  { metric: 'Best Practices', score: 55, detail: 'Old jQuery, deprecated APIs' },
  { metric: 'SEO', score: 92, detail: 'Strong structured data, good canonicals' },
]

const CORE_WEB_VITALS = [
  { metric: 'LCP', value: '28.4s', target: '<2.5s', status: 'poor' },
  { metric: 'FCP', value: '4.7s', target: '<1.8s', status: 'poor' },
  { metric: 'CLS', value: '0.12', target: '<0.1', status: 'warning' },
  { metric: 'TBT', value: '12ms', target: '<200ms', status: 'good' },
]

const MIGRATION_SCOPE = [
  { label: 'Total URL Scope', value: '16,775', detail: '7,619 pages + 9,156 redirects' },
  { label: 'CRM Records', value: '6,527', detail: '4,629 listings + 1,898 events (85.7% of site)' },
  { label: 'Media Assets', value: '3,904', detail: '3,110 images + 590 docs + 136 videos + 68 links' },
  { label: 'Taxonomy Items', value: '~1,846', detail: '10 taxonomy systems to consolidate and migrate' },
]

const ASSUMPTIONS = [
  { category: 'Platform', items: [
    'Full custom platform rebuild — replacing both Simpleview CMS and CRM',
    'First phase is 1-to-1 rebuild with exact feature parity',
    'Enhancements and new features come after 1-to-1 is live',
  ]},
  { category: 'Data', items: [
    'Data extraction approach will be determined based on Simpleview access level',
    'All 16,775 URLs must be preserved or properly redirected',
    'Image migration includes metadata (alt text, credits, focal points)',
  ]},
  { category: 'Scope', items: [
    'Rebuilding public website + content management backend + admin panel',
    'Third-party integrations will be re-integrated with the new platform',
    'New site will maintain or exceed SEO parity',
  ]},
]

const RISKS = [
  { category: 'Data Extraction', items: [
    'Simpleview access level unknown — may need to rely on frontend scraping',
    'Page Builder content (70+ widgets) has no known API for extraction',
    '3,110 images need metadata preserved alongside file migration',
  ]},
  { category: 'Hidden Functionality', items: [
    'CRM backend not yet accessible — unknown workflows and automations',
    'Third-party services (Connect Pass, RootRez) may be Simpleview-dependent',
    'Personalization rules (7 personas + geo-targeting) need full documentation',
  ]},
  { category: 'SEO & URLs', items: [
    'Listing/event URLs contain Simpleview CRM IDs — need mapping strategy',
    '9,156 existing redirects must be fully exported before decommission',
    'Structured data (JSON-LD) varies by listing type — must replicate per category',
  ]},
]

const NEXT_STEPS = [
  { label: 'CRM Backend Access', description: 'Audit hidden functionality, workflows, and automations', priority: 'critical' },
  { label: 'API Credentials', description: 'Request from Simpleview for data extraction planning', priority: 'critical' },
  { label: 'Service Ownership', description: 'Verify which third-party accounts are client-owned vs Simpleview', priority: 'high' },
  { label: 'Contract Review', description: 'Confirm data export rights in Simpleview contract', priority: 'high' },
  { label: 'Microsite Triage', description: '79 convention microsites — which are active and need migration?', priority: 'medium' },
]

function StatusBadge({ status }) {
  const styles = {
    confirmed: 'bg-emerald-100 text-emerald-700',
    partial: 'bg-amber-100 text-amber-700',
    'not-found': 'bg-red-100 text-red-700',
  }
  const labels = {
    confirmed: 'Found',
    partial: 'Partial',
    'not-found': 'Not Found',
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
  }
  return <span className={`text-xs font-medium ${styles[level] || 'text-gray-400'}`}>{level}</span>
}

function SectionBadge({ section }) {
  const styles = {
    public: 'bg-sky-100 text-sky-700',
    events: 'bg-violet-100 text-violet-700',
    listings: 'bg-emerald-100 text-emerald-700',
    content: 'bg-amber-100 text-amber-700',
    meetings: 'bg-rose-100 text-rose-700',
    microsites: 'bg-indigo-100 text-indigo-700',
    admin: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${styles[section] || 'bg-gray-100 text-gray-500'}`}>
      {section}
    </span>
  )
}

function PriorityBadge({ priority }) {
  const styles = { critical: 'bg-red-100 text-red-700', high: 'bg-amber-100 text-amber-700', medium: 'bg-blue-100 text-blue-700' }
  return <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${styles[priority] || 'bg-gray-100 text-gray-500'}`}>{priority}</span>
}

function ScoreBadge({ score }) {
  const color = score >= 90 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'
  return <span className={`text-lg font-bold ${color}`}>{score}</span>
}

function CwvBadge({ status }) {
  const styles = { good: 'bg-emerald-100 text-emerald-700', warning: 'bg-amber-100 text-amber-700', poor: 'bg-red-100 text-red-700' }
  return <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${styles[status]}`}>{status}</span>
}

function CollapsibleSection({ title, count, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-tan">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-deep hover:bg-sand-light transition-colors">
        <span>{title}{count != null && <span className="ml-2 text-deep-muted font-normal">({count})</span>}</span>
        <svg className="w-4 h-4 text-deep-muted" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6l4 4 4-4" /></svg>
      </button>
      {open && <div className="px-4 pb-4 text-sm text-deep">{children}</div>}
    </div>
  )
}

export default function DiscoveryDashboardDaniel() {
  const confirmedIntegrations = INTEGRATIONS.filter(i => i.status === 'confirmed').length

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'URLs Mapped', value: '7,619' },
          { label: 'Page Templates', value: '21+' },
          { label: 'Integrations Found', value: `${INTEGRATIONS.length}` },
          { label: 'Research Documents', value: '38' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 border border-tan bg-sand-light text-center">
            <p className="text-2xl font-bold text-deep">{stat.value}</p>
            <p className="text-xs text-deep-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Page Types */}
      <CollapsibleSection title="Page Types & Templates" count={`${PAGE_TYPES.length} types, 7,619 URLs`} defaultOpen>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b border-tan">
              <th className="py-2 pr-4 text-xs font-semibold text-deep-muted uppercase">Template</th>
              <th className="py-2 pr-4 text-xs font-semibold text-deep-muted uppercase">Pattern</th>
              <th className="py-2 pr-4 text-xs font-semibold text-deep-muted uppercase text-right">URLs</th>
              <th className="py-2 text-xs font-semibold text-deep-muted uppercase">Section</th>
            </tr></thead>
            <tbody>{PAGE_TYPES.map((pt) => (
              <tr key={pt.name} className="border-b border-tan/50">
                <td className="py-2 pr-4 font-medium">{pt.name}</td>
                <td className="py-2 pr-4 text-deep-muted font-mono text-xs">{pt.pattern}</td>
                <td className="py-2 pr-4 text-right">{pt.count.toLocaleString()}</td>
                <td className="py-2"><SectionBadge section={pt.section} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* CMS Backend */}
      <CollapsibleSection title="CMS Backend" count={CMS_BACKEND.length + ' areas documented'} defaultOpen>
        <div className="space-y-2">
          {CMS_BACKEND.map((item) => (
            <div key={item.label} className="flex items-start gap-3 py-2 border-b border-tan/50 last:border-0">
              <div className="w-48 shrink-0"><span className="font-medium">{item.label}</span></div>
              <div className="w-16 shrink-0 font-bold text-deep">{item.value}</div>
              <div className="flex-1 text-deep-muted">{item.detail}</div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Media Library */}
      <CollapsibleSection title="Media Library" count="3,904 assets">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MEDIA_LIBRARY.map((item) => (
            <div key={item.type} className="p-3 border border-tan/50 bg-sand-light">
              <p className="text-lg font-bold text-deep">{item.count}</p>
              <p className="text-xs font-semibold text-deep mb-1">{item.type}</p>
              <p className="text-xs text-deep-muted">{item.detail}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Integrations */}
      <CollapsibleSection title="Third-Party Integrations" count={INTEGRATIONS.length} defaultOpen>
        <div className="space-y-1">
          <div className="flex gap-3 text-xs text-deep-muted mb-3">
            <span>{confirmedIntegrations} confirmed</span>
            <span>·</span>
            <span>{INTEGRATIONS.length - confirmedIntegrations} partially confirmed</span>
          </div>
          {INTEGRATIONS.map((intg) => (
            <div key={intg.name} className="flex items-start gap-3 py-2 border-b border-tan/50 last:border-0">
              <div className="w-40 shrink-0"><span className="font-medium">{intg.name}</span></div>
              <div className="flex-1 text-deep-muted">{intg.description}</div>
              <div className="flex items-center gap-2 shrink-0">
                <CriticalityBadge level={intg.criticality} />
                <StatusBadge status={intg.status} />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Performance Baseline */}
      <CollapsibleSection title="Performance Baseline" count="2,281 pages audited">
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PERFORMANCE.map((item) => (
              <div key={item.metric} className="p-3 border border-tan/50 bg-sand-light text-center">
                <ScoreBadge score={item.score} />
                <p className="text-xs font-semibold text-deep mt-1">{item.metric}</p>
                <p className="text-xs text-deep-muted mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CORE_WEB_VITALS.map((item) => (
              <div key={item.metric} className="p-3 border border-tan/50 bg-sand-light">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-deep">{item.metric}</span>
                  <CwvBadge status={item.status} />
                </div>
                <p className="text-lg font-bold text-deep">{item.value}</p>
                <p className="text-xs text-deep-muted">Target: {item.target}</p>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Migration Scope */}
      <CollapsibleSection title="Migration Scope" count="16,775 URLs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MIGRATION_SCOPE.map((item) => (
            <div key={item.label} className="p-3 border border-tan/50 bg-sand-light">
              <p className="text-lg font-bold text-deep">{item.value}</p>
              <p className="text-xs font-semibold text-deep mb-1">{item.label}</p>
              <p className="text-xs text-deep-muted">{item.detail}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Interactive Features */}
      <CollapsibleSection title="Interactive Features" count="15 features documented">
        <div className="space-y-1">
          {[
            { name: 'Faceted Listing Filtering', complexity: 'High', scope: 'Restaurants, Places To Stay, Things To Do', detail: 'Keyword + type + location checkboxes with live counts, sort, grid/list toggle' },
            { name: 'Event Date & Category Filtering', complexity: 'High', scope: 'Events page', detail: 'Quick date buttons (Today/Week/Weekend/Month), category + audience + location checkboxes' },
            { name: 'Listing Detail Tabs', complexity: 'High', scope: '4,629 listing pages', detail: '5 tabs: Overview, Features, Reviews, Facilities, Related Stories + MAP button' },
            { name: 'Trip Planner / Trip Builder', complexity: 'Medium', scope: 'Global', detail: '3 JS files, localStorage persistence, anonymous usage, counter widget' },
            { name: 'Compare Tool', complexity: 'Medium', scope: '/compare/ + listing cards', detail: 'Side-by-side listing comparison, click-to-compare on cards' },
            { name: 'Booking Widget (RootRez)', complexity: 'Medium', scope: '/places-to-stay/', detail: 'Check-in/out date pickers, guest count, submits to lodging.visitsaltlake.com' },
            { name: 'Persistent Cart (Connect Pass)', complexity: 'High', scope: 'Global', detail: 'Cross-page e-commerce cart for experience passes, external checkout' },
            { name: 'Site Search', complexity: 'Medium', scope: 'Global header', detail: '8 content type facets with counts, autocomplete, 10 results/page' },
            { name: 'Interactive Maps (Outdooractive)', complexity: 'Medium', scope: 'Listing/event detail', detail: 'Leaflet.js 1.9.4, enlarge map, 3D flyover on trail listings' },
            { name: 'Photo Gallery / Lightbox', complexity: 'Low', scope: 'Detail pages', detail: 'GLightbox carousel with "X OF Y" counter, prev/next navigation' },
            { name: 'Quick View Overlay', complexity: 'Low-Med', scope: 'Listing browse', detail: 'Preview overlay without navigating to full detail page' },
            { name: 'CrowdRiff UGC Gallery', complexity: 'Medium', scope: 'Homepage, key pages', detail: 'Social photo grid pulling Instagram content' },
            { name: 'Content Tabs', complexity: 'Low', scope: 'Things To Do', detail: 'Client-side tab switching: Attractions, Tours, Outdoor Rec, Nightlife' },
            { name: 'Social Sharing', complexity: 'Low', scope: 'All content pages', detail: 'Expandable share panel: Facebook, X, Email, LinkedIn, Reddit' },
            { name: 'Weather Widget', complexity: 'Low', scope: 'Global header', detail: 'Real-time weather dropdown from Simpleview API' },
          ].map((f) => (
            <div key={f.name} className="flex items-start gap-3 py-2 border-b border-tan/50 last:border-0">
              <div className="w-52 shrink-0"><span className="font-medium">{f.name}</span></div>
              <div className="w-20 shrink-0"><span className={`text-xs font-medium ${f.complexity === 'High' ? 'text-red-600' : f.complexity === 'Medium' ? 'text-amber-600' : 'text-blue-600'}`}>{f.complexity}</span></div>
              <div className="flex-1 text-deep-muted">{f.detail}</div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* SEO Health */}
      <CollapsibleSection title="SEO Health" count="8,818 URLs crawled">
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Internal 404s', value: '5', status: 'good', detail: 'Excellent — only 5 broken internal links' },
              { label: 'Redirect Chains', value: '0', status: 'good', detail: 'Clean — no chained redirects' },
              { label: 'Orphan Pages', value: '0', status: 'good', detail: 'All pages reachable via internal links' },
              { label: 'Response Time', value: '0.455s', status: 'good', detail: 'Median server response (fast)' },
            ].map((item) => (
              <div key={item.label} className="p-3 border border-tan/50 bg-sand-light">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-deep">{item.label}</span>
                  <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-700">{item.status}</span>
                </div>
                <p className="text-lg font-bold text-deep">{item.value}</p>
                <p className="text-xs text-deep-muted">{item.detail}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'Missing Meta Descriptions', value: '510 (26%)', status: 'warning', detail: 'Many CRM pages rely on auto-generated snippets' },
              { label: 'Missing H1 Tags', value: '948 (48%)', status: 'warning', detail: 'CRM pages render titles in non-H1 elements' },
              { label: 'Missing Page Titles', value: '159 (8%)', status: 'warning', detail: '57 duplicate titles (mostly blog archive pagination)' },
            ].map((item) => (
              <div key={item.label} className="p-3 border border-tan/50 bg-sand-light">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-deep">{item.label}</span>
                  <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-700">{item.status}</span>
                </div>
                <p className="text-lg font-bold text-deep">{item.value}</p>
                <p className="text-xs text-deep-muted">{item.detail}</p>
              </div>
            ))}
          </div>
          <div className="text-xs text-deep-muted space-y-1">
            <p><strong className="text-deep">Structured Data:</strong> JSON-LD on listings (LocalBusiness + activity type), events (ExhibitionEvent), blog (BlogPosting). Missing on homepage.</p>
            <p><strong className="text-deep">Open Graph:</strong> All pages have og:title, og:description, og:image. No og:locale:alternate for translations.</p>
            <p><strong className="text-deep">Canonicals:</strong> Self-referencing on all pages. No conflicts detected.</p>
            <p><strong className="text-deep">RSS Feeds:</strong> None found. Potential improvement for blog/events.</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Navigation & IA */}
      <CollapsibleSection title="Navigation & Information Architecture" count="6 components, 8 contexts">
        <div className="space-y-4">
          <div className="space-y-1">
            {[
              { name: 'Three-Column Mega Menu', scope: 'Desktop', detail: '7 primary items: Things To Do, Skiing, Events, Restaurants, Places To Stay, Plan Your Visit, Neighborhoods' },
              { name: 'Secondary Navigation', scope: 'Desktop', detail: '5 B2B links: Meetings, Travel Trade, Sports, Film, Blog' },
              { name: 'Mobile Hamburger Menu', scope: 'Mobile (<769px)', detail: 'Full-screen accordion with "open submenu" buttons + "EXPLORE SALT LAKE" bottom CTA' },
              { name: 'Footer Navigation', scope: 'Global', detail: '7 links including Shopify external store. Dynamic events feed, blog feed, sponsor logos.' },
              { name: 'Industry Section Navs', scope: 'B2B pages', detail: '6 unique navs: Meetings (5 items), Travel Trade (6), Sports (7), Film (3), Speak SL (5), Members (4)' },
              { name: 'Breadcrumbs', scope: 'All interior pages', detail: 'Linked hierarchy. No BreadcrumbList schema (improvement opportunity).' },
            ].map((item) => (
              <div key={item.name} className="flex items-start gap-3 py-2 border-b border-tan/50 last:border-0">
                <div className="w-52 shrink-0"><span className="font-medium">{item.name}</span></div>
                <div className="w-28 shrink-0 text-xs text-deep-muted">{item.scope}</div>
                <div className="flex-1 text-deep-muted">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* B2B / Industry Sections */}
      <CollapsibleSection title="B2B / Industry Sections" count="5 active sections">
        <div className="space-y-1">
          {[
            { name: 'Meetings', pages: '46+', layout: 'Dedicated template', detail: '~45 pages deep hierarchy, convention calendar (CRM widget), RFP form (80+ fields), 5 hotel districts, venue specs' },
            { name: 'Travel Trade', pages: '15', layout: 'Secondary Nav', detail: 'FAM maps, partnerships, partner directory. A/B testing + personalization active.' },
            { name: 'Sports', pages: '20', layout: 'Dedicated template', detail: 'Own "Sports Salt Lake" brand identity. Featured upcoming events from CRM.' },
            { name: 'Film', pages: '6', layout: 'Secondary Nav', detail: '"Film Ready Utah" badge. Filming location + production vendor signup forms.' },
            { name: 'Speak Salt Lake', pages: '6', layout: 'Secondary Nav', detail: 'Speakers bureau — Olympic Athletes + Business Leaders categories with booking.' },
          ].map((s) => (
            <div key={s.name} className="flex items-start gap-3 py-2 border-b border-tan/50 last:border-0">
              <div className="w-36 shrink-0"><span className="font-medium">{s.name}</span></div>
              <div className="w-16 shrink-0 text-xs text-deep-muted">{s.pages} pages</div>
              <div className="w-36 shrink-0 text-xs text-deep-muted">{s.layout}</div>
              <div className="flex-1 text-deep-muted">{s.detail}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-deep-muted">
          <p><strong className="text-deep">Convention Microsites:</strong> 79 templated welcome pages ("Salt Lake Welcomes [Convention]") + Influencer page with CRM Form Builder.</p>
        </div>
      </CollapsibleSection>

      {/* Seasonal & Dynamic Content */}
      <CollapsibleSection title="Seasonal & Dynamic Content" count="3 mechanisms">
        <div className="space-y-3">
          <div className="p-3 border border-tan/50 bg-sand-light">
            <p className="font-semibold text-deep mb-1">Seasonal Content Rotation</p>
            <p className="text-xs text-deep-muted">Homepage content changes significantly across seasons (verified via Wayback Machine): Winter → ski passes, aprés ski, ice skating. Summer → patio dining, wildflowers, family activities. Spring → cherry blossoms, spring skiing, festivals. Hero carousel, featured blog posts, and promotional offers all rotate seasonally via draft scheduling.</p>
          </div>
          <div className="p-3 border border-tan/50 bg-sand-light">
            <p className="font-semibold text-deep mb-1">Content Personalization (7 Personas)</p>
            <p className="text-xs text-deep-muted">Dynamic Content system with geo-targeting (country, region, metro, city). Personas: Craft Beverages, Family Fun, LGBTQ, Leisure Travel, Outdoor Recreation, Restaurants & Bars, Winter Activities. Applied to: hero slides, vertical videos, blog posts, nav items, page builder panels.</p>
          </div>
          <div className="p-3 border border-tan/50 bg-sand-light">
            <p className="font-semibold text-deep mb-1">A/B Testing</p>
            <p className="text-xs text-deep-muted">Active on homepage (Original/Variant panels) and Travel Trade section. VWO platform (account 967565) + Simpleview built-in A/B panels. GTM tracking via form "variation" field.</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Forms & Lead Capture */}
      <CollapsibleSection title="Forms & Lead Capture" count="6 CRM forms">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b border-tan">
              <th className="py-2 pr-4 text-xs font-semibold text-deep-muted uppercase">Form</th>
              <th className="py-2 pr-4 text-xs font-semibold text-deep-muted uppercase">ID</th>
              <th className="py-2 pr-4 text-xs font-semibold text-deep-muted uppercase">Page</th>
              <th className="py-2 text-xs font-semibold text-deep-muted uppercase">Key Fields</th>
            </tr></thead>
            <tbody>
              {[
                { form: 'Contact', id: 'frm_18', page: '/contact/', fields: 'Full address + phone + company + comments (most comprehensive)' },
                { form: 'Newsletter Subscribe', id: 'frm_46', page: '/plan-your-visit/subscribe/', fields: 'Email + name + zip + country + email opt-in + custom field (udf_3845)' },
                { form: 'Meeting Planner Guide', id: 'frm_54', page: '/meetings/contact/', fields: 'Same as subscribe — triggers physical guide mail-out' },
                { form: 'Meeting Newsletter', id: 'frm_54', page: '/meetings/contact/', fields: 'Same form ID, different CRM groupid for segmentation' },
                { form: 'Influencer Application', id: 'CRM widget', page: '/influencer/', fields: 'CRM Form Builder widget on microsite page' },
                { form: 'RFP Submission', id: 'CRM RFP', page: '/rfp/', fields: '80+ fields — contact, meeting details, 14-day room block grid, file upload' },
              ].map((f) => (
                <tr key={f.form + f.page} className="border-b border-tan/50">
                  <td className="py-2 pr-4 font-medium">{f.form}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-deep-muted">{f.id}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-deep-muted">{f.page}</td>
                  <td className="py-2 text-deep-muted text-xs">{f.fields}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-deep-muted">
          <p>All forms powered by Simpleview CRM Form Builder. Google reCAPTCHA + honeypot (youcompleteme_sv) spam protection on all forms. CRM groupid field segments contacts into different lists.</p>
        </div>
      </CollapsibleSection>

      {/* Responsive & Mobile */}
      <CollapsibleSection title="Responsive & Mobile" count="15+ breakpoints">
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { bp: '375px', label: 'Mobile', desc: 'Single column, hamburger menu' },
              { bp: '575px', label: 'Large Phone', desc: 'Cards shift to 2 columns' },
              { bp: '769px', label: 'Tablet', desc: 'Major shift — 2-column layouts' },
              { bp: '992px', label: 'Desktop', desc: 'Full nav, 3-4 column grids' },
              { bp: '1440px', label: 'Large Desktop', desc: 'Max content width, centered' },
            ].map((item) => (
              <div key={item.bp} className="p-2 border border-tan/50 bg-sand-light text-center">
                <p className="text-sm font-bold text-deep">{item.bp}</p>
                <p className="text-xs font-semibold text-deep">{item.label}</p>
                <p className="text-xs text-deep-muted mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-xs text-deep-muted space-y-1">
            <p><strong className="text-deep">Mobile Features:</strong> Click-to-call phone links, touch swipe carousels (Glide.js), "EXPLORE SALT LAKE" mobile-only CTA, collapsible filter panels</p>
            <p><strong className="text-deep">No Art Direction:</strong> Same image crops at all viewports (srcset for size only). Improvement opportunity with &lt;picture&gt; element.</p>
            <p><strong className="text-deep">Device Split:</strong> 61% desktop, 38% mobile, &lt;1% tablet</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Tech Stack */}
      <CollapsibleSection title="Current Tech Stack" count="to be replaced">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold mb-2">Core Platform</p>
            <div className="space-y-1 text-xs text-deep-muted">
              <p>Simpleview CMS (proprietary tourism platform)</p>
              <p>Simpleview CRM (listings, events, contacts)</p>
              <p>Simpleview CDN / Cloudinary (image hosting + transforms)</p>
              <p>Server-side rendered HTML (not SPA)</p>
              <p>Goatee — Simpleview's custom templating engine</p>
            </div>
          </div>
          <div>
            <p className="font-semibold mb-2">Frontend Libraries</p>
            <div className="space-y-1 text-xs text-deep-muted">
              <p>jQuery 2.2.4 (outdated — needs replacement)</p>
              <p>RequireJS (AMD module loader)</p>
              <p>Vue.js (internal, selective components)</p>
              <p>Glide.js 3.4.1 (carousels)</p>
              <p>Plyr 3.x (video player)</p>
              <p>GLightbox (lightbox/modal)</p>
              <p>Leaflet.js 1.9.4 (maps via Outdooractive)</p>
              <p>Font Awesome 5.14.0, PT Sans Narrow (Google Fonts)</p>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Data Quality */}
      <CollapsibleSection title="Data Quality Observations" count="from CMS dashboard">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Listings Without Media', value: '3,723', severity: 'high' },
            { label: 'Unpublished Articles', value: '1,030', severity: 'medium' },
            { label: 'Unpublished Blog Posts', value: '1,229', severity: 'medium' },
            { label: 'Unpublished Pages', value: '195', severity: 'low' },
            { label: 'Events Without Images', value: '155', severity: 'low' },
            { label: 'Broken External Links', value: '161', severity: 'low' },
          ].map((item) => (
            <div key={item.label} className="p-3 border border-tan/50 bg-sand-light">
              <p className={`text-lg font-bold ${item.severity === 'high' ? 'text-red-600' : item.severity === 'medium' ? 'text-amber-600' : 'text-deep'}`}>{item.value}</p>
              <p className="text-xs text-deep-muted">{item.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-deep-muted mt-3">3,723 listings without media is the most significant data quality issue — these listings will need placeholder handling or media sourcing during migration.</p>
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
        <CollapsibleSection title="Risks & Unknowns" count={RISKS.reduce((s, r) => s + r.items.length, 0)}>
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

      {/* Next Steps */}
      <CollapsibleSection title="Next Steps" count={NEXT_STEPS.length} defaultOpen>
        <div className="space-y-2">
          {NEXT_STEPS.map((item) => (
            <div key={item.label} className="flex items-start gap-3 py-2 border-b border-tan/50 last:border-0">
              <PriorityBadge priority={item.priority} />
              <div>
                <span className="font-medium">{item.label}</span>
                <span className="text-deep-muted ml-2">— {item.description}</span>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  )
}
