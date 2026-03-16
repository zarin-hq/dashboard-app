import { useState, useRef, useEffect } from 'react'
import { useProject } from '../hooks/useProject'

export default function PageManager({ selectedPageId, onSelectPage }) {
  const { state, dispatch } = useProject()
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  const addPage = () => {
    const id = crypto.randomUUID()
    const name = `Page ${state.pages.length + 1}`
    dispatch({ type: 'ADD_PAGE', id, name })
    onSelectPage(id)
  }

  const startRename = (page) => {
    setEditingId(page.id)
    setEditValue(page.name)
  }

  const commitRename = () => {
    if (editingId && editValue.trim()) {
      dispatch({ type: 'RENAME_PAGE', id: editingId, name: editValue.trim() })
    }
    setEditingId(null)
  }

  const deletePage = (e, id) => {
    e.stopPropagation()
    dispatch({ type: 'DELETE_PAGE', id })
    if (selectedPageId === id) {
      const remaining = state.pages.filter(p => p.id !== id)
      onSelectPage(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {state.pages.map((page) => (
        <div
          key={page.id}
          onClick={() => {
            if (selectedPageId === page.id && editingId !== page.id) {
              startRename(page)
            } else {
              onSelectPage(page.id)
            }
          }}
          className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
            selectedPageId === page.id
              ? 'bg-sky text-deep'
              : 'bg-sand-dark text-deep-muted hover:bg-tan hover:text-deep'
          }`}
        >
          {editingId === page.id ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') setEditingId(null)
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent border-none outline-none w-20 text-sm text-inherit"
            />
          ) : (
            <span>{page.name}</span>
          )}
          <button
            onClick={(e) => deletePage(e, page.id)}
            className={`w-4 h-4 flex items-center justify-center rounded-full text-xs leading-none transition-opacity ${
              selectedPageId === page.id
                ? 'text-white/60 hover:text-white hover:bg-white/20'
                : 'text-deep-muted hover:text-deep hover:bg-tan opacity-0 group-hover:opacity-100'
            }`}
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={addPage}
        className="px-3 py-1.5 rounded-full text-sm font-medium border-2 border-dashed border-tan text-deep-muted hover:border-tan-dark hover:text-deep transition-colors"
      >
        + New Page
      </button>
    </div>
  )
}
