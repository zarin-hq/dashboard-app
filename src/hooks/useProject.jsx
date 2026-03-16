import { createContext, useContext, useReducer, useEffect, useMemo, useRef, useState } from 'react'
import { loadState, saveState } from '../lib/db'

const initialState = {
  pages: [],
  screenshots: [],
  annotations: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...initialState, ...action.payload }

    case 'ADD_PAGE': {
      const order = state.pages.length
      return { ...state, pages: [...state.pages, { id: action.id, name: action.name, order }] }
    }
    case 'RENAME_PAGE':
      return {
        ...state,
        pages: state.pages.map(p => p.id === action.id ? { ...p, name: action.name } : p),
      }
    case 'DELETE_PAGE': {
      const screenshotIds = state.screenshots.filter(s => s.pageId === action.id).map(s => s.id)
      return {
        ...state,
        pages: state.pages.filter(p => p.id !== action.id),
        screenshots: state.screenshots.filter(s => s.pageId !== action.id),
        annotations: state.annotations.filter(a => !screenshotIds.includes(a.screenshotId)),
      }
    }

    case 'ADD_SCREENSHOT':
      return {
        ...state,
        screenshots: [...state.screenshots, {
          id: action.id,
          pageId: action.pageId,
          imageUrl: action.imageUrl,
          videoSource: action.videoSource || '',
          timestamp: action.timestamp || 0,
          order: state.screenshots.filter(s => s.pageId === action.pageId).length,
        }],
      }
    case 'DELETE_SCREENSHOT':
      return {
        ...state,
        screenshots: state.screenshots.filter(s => s.id !== action.id),
        annotations: state.annotations.filter(a => a.screenshotId !== action.id),
      }
    case 'MOVE_SCREENSHOT':
      return {
        ...state,
        screenshots: state.screenshots.map(s =>
          s.id === action.id ? { ...s, pageId: action.pageId } : s
        ),
      }

    case 'ADD_ANNOTATION':
      return {
        ...state,
        annotations: [...state.annotations, {
          id: action.id,
          screenshotId: action.screenshotId,
          x: action.x,
          y: action.y,
          width: action.width,
          height: action.height,
          label: action.label || '',
          designHours: action.designHours || 0,
          frontendHours: action.frontendHours || 0,
          backendHours: action.backendHours || 0,
        }],
      }
    case 'UPDATE_ANNOTATION':
      return {
        ...state,
        annotations: state.annotations.map(a =>
          a.id === action.id ? { ...a, ...action.updates } : a
        ),
      }
    case 'DELETE_ANNOTATION':
      return {
        ...state,
        annotations: state.annotations.filter(a => a.id !== action.id),
      }

    case 'CLEAR_ALL':
      return { ...initialState }

    default:
      return state
  }
}

const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [loading, setLoading] = useState(true)
  const saveTimer = useRef(null)
  const skipNextSave = useRef(true)

  // Hydrate from cloud on mount
  useEffect(() => {
    loadState()
      .then((data) => {
        if (data && (data.pages?.length || data.screenshots?.length || data.annotations?.length)) {
          dispatch({ type: 'LOAD_STATE', payload: data })
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // After loading finishes and LOAD_STATE has been applied, allow future saves
  useEffect(() => {
    if (!loading) {
      // Skip the save triggered by this render (the hydrated state),
      // only save on subsequent user-driven changes
      skipNextSave.current = true
    }
  }, [loading])

  // Debounced save to cloud on every state change
  useEffect(() => {
    if (loading) return
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveState(state).catch(() => {})
    }, 500)
    return () => clearTimeout(saveTimer.current)
  }, [state, loading])

  const annotationTotal = (a) =>
    (a.designHours || 0) + (a.frontendHours || 0) + (a.backendHours || 0)

  const totalHours = useMemo(
    () => state.annotations.reduce((sum, a) => sum + annotationTotal(a), 0),
    [state.annotations]
  )

  const hoursByPage = useMemo(() => {
    const screenshotToPage = {}
    for (const s of state.screenshots) {
      screenshotToPage[s.id] = s.pageId
    }
    const map = {}
    for (const page of state.pages) {
      map[page.id] = 0
    }
    for (const a of state.annotations) {
      const pageId = screenshotToPage[a.screenshotId]
      if (pageId && map[pageId] !== undefined) {
        map[pageId] += annotationTotal(a)
      }
    }
    return map
  }, [state.pages, state.screenshots, state.annotations])

  const value = useMemo(
    () => ({ state, dispatch, totalHours, hoursByPage, loading }),
    [state, totalHours, hoursByPage, loading]
  )

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within ProjectProvider')
  return ctx
}
