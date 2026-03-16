import { useRef, useState, useCallback, useEffect } from 'react'

export default function VideoPlayer({ onCapture, uploading }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [videoSrc, setVideoSrc] = useState(null)
  const [videoName, setVideoName] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('video/')) return
    const url = URL.createObjectURL(file)
    setVideoSrc(url)
    setVideoName(file.name)
    setIsPlaying(false)
    setCurrentTime(0)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const togglePlayback = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }, [])

  const skip = useCallback((seconds) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds))
  }, [])

  const captureFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    onCapture(dataUrl, videoName, video.currentTime)
  }, [onCapture, videoName])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onLoaded = () => setDuration(video.duration)
    const onEnded = () => setIsPlaying(false)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('loadedmetadata', onLoaded)
    video.addEventListener('ended', onEnded)
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('loadedmetadata', onLoaded)
      video.removeEventListener('ended', onEnded)
    }
  }, [videoSrc])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'Space' && videoSrc) {
        e.preventDefault()
        togglePlayback()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [videoSrc, togglePlayback])

  const formatTime = (t) => {
    if (!t || isNaN(t)) return '0:00'
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  if (!videoSrc) {
    return (
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          isDragging ? 'border-deep bg-deep/10' : 'border-tan'
        }`}
      >
        <p className="text-deep-muted mb-3">Drag & drop a video file here</p>
        <label className="inline-block px-4 py-2 bg-sky text-deep text-sm font-semibold cursor-pointer hover:bg-sky-dark transition">
          Choose File
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </label>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={videoSrc}
          preload="auto"
          playsInline
          className="w-full max-h-[480px] object-contain"
        />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => skip(-5)} className="px-2 py-1 text-xs rounded bg-sand-dark hover:bg-tan text-deep-muted font-medium transition-colors">-5s</button>
        <button
          onClick={togglePlayback}
          className="px-3 py-1.5 bg-sky text-deep text-sm font-semibold hover:bg-sky-dark transition"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={() => skip(5)} className="px-2 py-1 text-xs rounded bg-sand-dark hover:bg-tan text-deep-muted font-medium transition-colors">+5s</button>

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={(e) => {
            const t = parseFloat(e.target.value)
            videoRef.current.currentTime = t
            setCurrentTime(t)
          }}
          className="flex-1"
        />
        <span className="text-xs text-deep-muted tabular-nums whitespace-nowrap">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <button
          onClick={captureFrame}
          disabled={uploading}
          className="px-4 py-1.5 bg-sky text-deep text-sm font-semibold hover:bg-sky-dark transition ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Capture Frame'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-deep-muted truncate">{videoName}</span>
        <button
          onClick={() => { setVideoSrc(null); setVideoName('') }}
          className="text-xs text-deep-muted hover:text-deep ml-auto transition-colors"
        >
          Remove video
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
