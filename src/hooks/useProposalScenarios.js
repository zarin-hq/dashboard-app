import { useMemo } from 'react'
import { useProject } from './useProject'
import { SCENARIOS, getModuleForPage } from '../lib/proposalData'

/**
 * Merges live annotation totals with scenario multipliers.
 * When moduleFilter is set (not 'all'), only annotations on pages
 * belonging to that module are summed.
 * Returns an array of { ...scenario, hours: { design, frontend, backend, misc, total } }
 */
export default function useProposalScenarios(moduleFilter = 'all') {
  const { state } = useProject()

  return useMemo(() => {
    // Build screenshot → page-name lookup
    const screenshotToPageName = {}
    const pageNameById = {}
    for (const p of state.pages) {
      pageNameById[p.id] = p.name
    }
    for (const s of state.screenshots) {
      screenshotToPageName[s.id] = pageNameById[s.pageId] || ''
    }

    // Sum raw hours from annotations, optionally filtered by module
    const raw = { design: 0, frontend: 0, backend: 0 }
    for (const a of state.annotations) {
      if (moduleFilter !== 'all') {
        const pageName = screenshotToPageName[a.screenshotId]
        if (!pageName || getModuleForPage(pageName) !== moduleFilter) continue
      }
      raw.design += a.designHours || 0
      raw.frontend += a.frontendHours || 0
      raw.backend += a.backendHours || 0
    }

    return SCENARIOS.map((scenario) => {
      const design = Math.round(raw.design * scenario.multipliers.design * 10) / 10
      const frontend = Math.round(raw.frontend * scenario.multipliers.frontend * 10) / 10
      const backend = Math.round(raw.backend * scenario.multipliers.backend * 10) / 10
      const misc = scenario.miscHours
      const total = Math.round((design + frontend + backend + misc) * 10) / 10
      return { ...scenario, hours: { design, frontend, backend, misc, total } }
    })
  }, [state.annotations, state.pages, state.screenshots, moduleFilter])
}
