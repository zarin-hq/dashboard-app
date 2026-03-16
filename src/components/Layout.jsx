import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useProject } from '../hooks/useProject'
import { clearAllScreenshotImages } from '../lib/db'

const navLinks = [
  { to: '/', label: 'Capture' },
  { to: '/estimate', label: 'Estimate' },
  { to: '/proposal', label: 'Proposal' },
]

export default function Layout() {
  const { state, totalHours, dispatch } = useProject()
  const location = useLocation()

  const handleClearProject = () => {
    if (!window.confirm('Clear all project data? This cannot be undone.')) return
    clearAllScreenshotImages(state.screenshots)
    dispatch({ type: 'CLEAR_ALL' })
  }

  return (
    <div className="min-h-screen bg-sand">
      <header className="px-6 bg-deep" style={{ height: 60 }}>
        <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-6 h-full">
            <div className="flex items-center gap-3">
              <img src="/hq-logo.svg" alt="HQ" className="h-[60px] w-auto" />
              <span className="text-lg font-bold tracking-tight text-white">
                Estimate Builder
              </span>
            </div>
            <nav className="flex items-center gap-1 h-full">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/15 text-sky'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {totalHours > 0 && location.pathname !== '/proposal' && (
              <div className="px-3 py-1.5 rounded-lg bg-white/15 text-sky text-sm font-semibold">
                {totalHours}h total
              </div>
            )}
            <button
              onClick={handleClearProject}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-white/60 hover:text-red-300 hover:bg-red-500/15 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
