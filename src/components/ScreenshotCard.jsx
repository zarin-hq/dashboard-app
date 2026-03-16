import useImageUrl from '../hooks/useImageUrl'

export default function ScreenshotCard({ screenshot, onDelete }) {
  const imgSrc = useImageUrl(screenshot.imageUrl)

  return (
    <div className="group relative rounded-lg overflow-hidden border border-tan bg-sand-light">
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={`Screenshot from ${screenshot.videoSource}`}
          className="w-full aspect-video object-cover"
        />
      ) : (
        <div className="w-full aspect-video bg-sand-dark animate-pulse" />
      )}
      <div className="px-2 py-1.5 flex items-center justify-between">
        <span className="text-xs text-deep-muted truncate">
          {screenshot.videoSource ? screenshot.videoSource : 'Screenshot'}
          {screenshot.timestamp > 0 && ` @ ${Math.floor(screenshot.timestamp)}s`}
        </span>
        <button
          onClick={() => onDelete(screenshot)}
          className="text-xs text-deep-muted/50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
