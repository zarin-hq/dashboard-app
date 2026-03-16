import { useState } from 'react'
import { useProject } from '../hooks/useProject'
import { saveScreenshotImage, deleteScreenshotImage } from '../lib/db'
import VideoPlayer from '../components/VideoPlayer'
import PageManager from '../components/PageManager'
import ScreenshotCard from '../components/ScreenshotCard'

export default function Capture() {
  const { state, dispatch } = useProject()
  const [selectedPageId, setSelectedPageId] = useState(
    () => state.pages.length > 0 ? state.pages[0].id : null
  )
  const [uploading, setUploading] = useState(false)

  const handleCapture = async (dataUrl, videoName, timestamp) => {
    setUploading(true)
    try {
      let pageId = selectedPageId
      if (!pageId) {
        pageId = crypto.randomUUID()
        dispatch({ type: 'ADD_PAGE', id: pageId, name: 'Page 1' })
        setSelectedPageId(pageId)
      }
      const id = crypto.randomUUID()
      const imageUrl = await saveScreenshotImage(id, dataUrl)
      dispatch({ type: 'ADD_SCREENSHOT', id, pageId, imageUrl, videoSource: videoName, timestamp })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteScreenshot = async (screenshot) => {
    await deleteScreenshotImage(screenshot.imageUrl)
    dispatch({ type: 'DELETE_SCREENSHOT', id: screenshot.id })
  }

  const pageScreenshots = state.screenshots.filter(s => s.pageId === selectedPageId)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-deep">Capture Screenshots</h2>

      <VideoPlayer onCapture={handleCapture} uploading={uploading} />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-deep-muted uppercase tracking-wide">Pages</h3>
        <PageManager selectedPageId={selectedPageId} onSelectPage={setSelectedPageId} />
      </div>

      {selectedPageId && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-deep-muted uppercase tracking-wide">
            Screenshots {pageScreenshots.length > 0 && `(${pageScreenshots.length})`}
          </h3>
          {pageScreenshots.length === 0 ? (
            <p className="text-sm text-deep-muted py-4">
              No screenshots yet. Upload a video and capture frames above.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {pageScreenshots.map((ss) => (
                <ScreenshotCard key={ss.id} screenshot={ss} onDelete={handleDeleteScreenshot} />
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedPageId && state.pages.length === 0 && (
        <p className="text-sm text-deep-muted py-4">
          Create a page to start organizing your screenshots.
        </p>
      )}
    </div>
  )
}
