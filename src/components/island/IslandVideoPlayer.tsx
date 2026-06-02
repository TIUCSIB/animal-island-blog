import { useCallback, useEffect, useRef, useState } from 'react'
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface IslandVideoPlayerProps {
  src: string
  poster?: string
  className?: string
  lockFrame?: boolean
  onRatioReady?: (src: string, width: number, height: number) => void
}

const HIDE_CONTROLS_DELAY = 2500

export function IslandVideoPlayer({ src, className, lockFrame = false, onRatioReady }: IslandVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const restartHideTimer = useCallback(() => {
    clearHideTimer()
    hideTimerRef.current = setTimeout(() => {
      if (playing) {
        setShowControls(false)
      }
    }, HIDE_CONTROLS_DELAY)
  }, [clearHideTimer, playing])

  function togglePlay() {
    const video = videoRef.current
    if (!video) return

    if (video.paused || video.ended) {
      void video.play()
    } else {
      video.pause()
    }
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  function handleSeek(event: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current
    if (!video) return
    const seekTime = Number(event.target.value)
    video.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  function handleMouseEnter() {
    setShowControls(true)
    restartHideTimer()
  }

  function handleMouseMove() {
    setShowControls(true)
    restartHideTimer()
  }

  function handleMouseLeave() {
    clearHideTimer()
    if (playing) {
      setShowControls(false)
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function toggleFullscreen() {
    const container = videoRef.current?.closest('.group')
    if (!container) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      container.requestFullscreen()
    }
  }

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    function handleTimeUpdate() {
      setCurrentTime(video!.currentTime)
    }

    function handleDurationChange() {
      setDuration(video!.duration || 0)
    }

    function handlePlay() {
      setPlaying(true)
    }

    function handlePause() {
      setPlaying(false)
    }

    function handleEnded() {
      setPlaying(false)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('durationchange', handleDurationChange)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('durationchange', handleDurationChange)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  return (
    <div className="group relative flex size-full items-center justify-center overflow-hidden bg-black" onMouseEnter={handleMouseEnter} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <video
        ref={videoRef}
        className={cn('block size-full', lockFrame ? 'object-cover' : 'object-contain', className)}
        src={src}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onLoadedMetadata={(event) => {
          const video = event.currentTarget
          setDuration(video.duration || 0)
          if (onRatioReady && video.videoWidth > 0 && video.videoHeight > 0) {
            onRatioReady(src, video.videoWidth, video.videoHeight)
          }
        }}
      />

      {/* Large centered play icon when paused */}
      {!playing ?
        <button
          className="absolute left-1/2 top-1/2 z-10 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[2.5px] border-[#fff8ed] bg-[linear-gradient(180deg,rgba(255,251,243,0.96)_0%,rgba(244,233,210,0.96)_100%)] text-[#715d46] shadow-[0_4px_0_rgba(190,174,152,0.92),0_14px_26px_rgba(24,20,16,0.18)] transition-all duration-200 hover:bg-[linear-gradient(180deg,rgba(255,253,248,1)_0%,rgba(248,239,219,1)_100%)] hover:shadow-[0_5px_0_rgba(190,174,152,0.94),0_18px_32px_rgba(24,20,16,0.22)] active:shadow-[0_3px_0_rgba(190,174,152,0.9),0_10px_18px_rgba(24,20,16,0.18)]"
          type="button"
          aria-label="播放"
          onClick={(event) => {
            event.stopPropagation()
            togglePlay()
          }}
        >
          <Play aria-hidden="true" size={26} strokeWidth={2.8} fill="#715d46" />
        </button>
      : null}

      {/* Bottom controls bar */}
      <div className={`absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-200 ${showControls || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-1.5 bg-[linear-gradient(0deg,rgba(30,26,20,0.82)_0%,rgba(30,26,20,0.4)_60%,transparent_100%)] px-2 pb-2 pt-6">
          <button
            className="grid size-8 shrink-0 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white active:bg-white/10"
            type="button"
            aria-label={playing ? '暂停' : '播放'}
            onClick={(event) => {
              event.stopPropagation()
              togglePlay()
            }}
          >
            {playing ?
              <Pause aria-hidden="true" size={16} strokeWidth={2.8} fill="currentColor" />
            : <Play aria-hidden="true" size={16} strokeWidth={2.8} fill="currentColor" />}
          </button>

          <span className="shrink-0 text-[11px] font-medium tracking-tight text-white/70">{formatTime(currentTime)}</span>

          <div className="group/progress relative flex h-8 flex-1 cursor-pointer items-center">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              aria-label="进度"
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              onClick={(event) => event.stopPropagation()}
              onChange={handleSeek}
              onMouseDown={() => clearHideTimer()}
              onMouseUp={() => restartHideTimer()}
              onTouchStart={() => clearHideTimer()}
              onTouchEnd={() => restartHideTimer()}
            />
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white transition-[width] duration-100" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <span className="shrink-0 text-[11px] font-medium tracking-tight text-white/50">{formatTime(duration)}</span>

          <button
            className="grid size-8 shrink-0 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white active:bg-white/10"
            type="button"
            aria-label={muted ? '取消静音' : '静音'}
            onClick={(event) => {
              event.stopPropagation()
              toggleMute()
            }}
          >
            {muted ?
              <VolumeX aria-hidden="true" size={16} strokeWidth={2.4} />
            : <Volume2 aria-hidden="true" size={16} strokeWidth={2.4} />}
          </button>

          <button
            className="grid size-8 shrink-0 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white active:bg-white/10"
            type="button"
            aria-label={isFullscreen ? '退出全屏' : '全屏'}
            onClick={(event) => {
              event.stopPropagation()
              toggleFullscreen()
            }}
          >
            {isFullscreen ?
              <Minimize aria-hidden="true" size={16} strokeWidth={2.4} />
            : <Maximize aria-hidden="true" size={16} strokeWidth={2.4} />}
          </button>
        </div>
      </div>
    </div>
  )
}
