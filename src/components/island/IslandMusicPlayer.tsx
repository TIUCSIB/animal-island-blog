import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Button } from 'animal-island-ui'
import { Pause, Play, X } from 'lucide-react'

import './island.css'

type SynthNodes = {
  context: AudioContext
  master: GainNode
  oscillators: OscillatorNode[]
}

type PlayerPosition = {
  x: number
  y: number
}

type DragState = {
  pointerId: number
  offsetX: number
  offsetY: number
}

const PLAYER_WIDTH = 88
const PLAYER_HEIGHT = 118
const PLAYER_PADDING = 8
const PLAYER_POSITION_STORAGE_KEY = 'island-music-player-position'
const DEFAULT_COVER = 'https://www.loliapi.com/acg/pp'

export type IslandMusicTrack = {
  title?: string
  author?: string
  pic?: string
  url: string
  lrc?: string
}

export interface IslandMusicPlayerProps {
  open: boolean
  src?: string
  coverSrc?: string
  title?: string
  subtitle?: string
  tracks?: IslandMusicTrack[]
  onClose: () => void
}

function getAudioContextConstructor() {
  return window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
}

function getDefaultPosition(): PlayerPosition {
  if (typeof window === 'undefined') return { x: 12, y: 12 }

  return clampPositionToViewport({
    x: Math.max(10, Math.round((window.innerWidth - PLAYER_WIDTH) / 2)),
    y: Math.max(10, window.visualViewport?.offsetTop ?? 18),
  })
}

function clampPositionToViewport(position: PlayerPosition, width = PLAYER_WIDTH, height = PLAYER_HEIGHT) {
  if (typeof window === 'undefined') return position

  const maxX = Math.max(PLAYER_PADDING, window.innerWidth - width - PLAYER_PADDING)
  const maxY = Math.max(PLAYER_PADDING, window.innerHeight - height - PLAYER_PADDING)

  return {
    x: Math.min(Math.max(PLAYER_PADDING, position.x), maxX),
    y: Math.min(Math.max(PLAYER_PADDING, position.y), maxY),
  }
}

function readStoredPosition() {
  if (typeof window === 'undefined') return getDefaultPosition()

  try {
    const rawPosition = window.localStorage.getItem(PLAYER_POSITION_STORAGE_KEY)

    if (!rawPosition) return getDefaultPosition()

    const position = JSON.parse(rawPosition) as Partial<PlayerPosition>

    if (Number.isFinite(position.x) && Number.isFinite(position.y)) {
      return clampPositionToViewport({
        x: Number(position.x),
        y: Number(position.y),
      })
    }
  } catch {
    // localStorage may be unavailable
  }

  return getDefaultPosition()
}

function saveStoredPosition(position: PlayerPosition) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(
      PLAYER_POSITION_STORAGE_KEY,
      JSON.stringify({
        x: Math.round(position.x),
        y: Math.round(position.y),
      }),
    )
  } catch {
    // localStorage may be unavailable
  }
}

function getRandomTrackIndex(length: number, currentIndex = -1) {
  if (length <= 1) return 0

  let nextIndex = Math.floor(Math.random() * length)

  if (nextIndex === currentIndex) {
    nextIndex = (nextIndex + 1) % length
  }

  return nextIndex
}

function getRandomTrackIndexExceptUrl(trackList: IslandMusicTrack[], currentUrl?: string) {
  if (trackList.length <= 1) return 0

  const availableIndexes = trackList
    .map((track, index) => (track.url && track.url !== currentUrl ? index : -1))
    .filter((index) => index >= 0)

  if (availableIndexes.length === 0) return getRandomTrackIndex(trackList.length)

  return availableIndexes[Math.floor(Math.random() * availableIndexes.length)]
}

export function IslandMusicPlayer({ open, src, coverSrc = DEFAULT_COVER, title = '小岛电台', subtitle = 'lo-fi 小岛电台', tracks, onClose }: IslandMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playerRef = useRef<HTMLElement | null>(null)
  const synthRef = useRef<SynthNodes | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const prevOpenRef = useRef(open)
  const lastClosedTrackUrlRef = useRef<string | undefined>(undefined)
  const playAttemptRef = useRef(0)
  const [playing, setPlaying] = useState(true)
  const [audioReady, setAudioReady] = useState(true)
  const [position, setPosition] = useState<PlayerPosition>(() => readStoredPosition())
  const positionRef = useRef(position)
  const [activeTrackIndex, setActiveTrackIndex] = useState(0)
  const trackList = useMemo(
    () => tracks?.filter((track) => track.url) ?? (src ? [{ title, author: subtitle, pic: coverSrc, url: src }] : []),
    [coverSrc, src, subtitle, title, tracks],
  )
  const activeTrack = trackList[activeTrackIndex] ?? trackList[0]
  const currentSrc = activeTrack?.url
  const currentCoverSrc = activeTrack?.pic || coverSrc
  const currentTitle = activeTrack?.title || title
  const currentSubtitle = activeTrack?.author || subtitle

  function clampPosition(nextX: number, nextY: number) {
    const rect = playerRef.current?.getBoundingClientRect()
    const width = rect?.width ?? PLAYER_WIDTH
    const height = rect?.height ?? PLAYER_HEIGHT

    return clampPositionToViewport({ x: nextX, y: nextY }, width, height)
  }

  function updatePosition(nextPosition: PlayerPosition) {
    positionRef.current = nextPosition
    setPosition(nextPosition)
  }

  function handleTrackEnded() {
    const audio = audioRef.current

    if (trackList.length <= 1) {
      if (audio) {
        audio.currentTime = 0
      }

      setPlaying(false)
      return
    }

    setActiveTrackIndex((current) => getRandomTrackIndex(trackList.length, current))
    setPlaying(true)
  }

  function playAudio(audio: HTMLAudioElement, expectedSrc: string) {
    const attemptId = playAttemptRef.current + 1

    playAttemptRef.current = attemptId

    void audio.play().catch((error: unknown) => {
      if (playAttemptRef.current !== attemptId) return
      if (audioRef.current !== audio) return
      if (audio.currentSrc && audio.currentSrc !== expectedSrc) return
      if (error instanceof DOMException && error.name === 'AbortError') return

      setPlaying(false)
    })
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return

    const rect = event.currentTarget.getBoundingClientRect()

    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current

    if (!drag || drag.pointerId !== event.pointerId) return

    updatePosition(clampPosition(event.clientX - drag.offsetX, event.clientY - drag.offsetY))
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current

    if (!drag || drag.pointerId !== event.pointerId) return

    dragRef.current = null
    saveStoredPosition(positionRef.current)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function stopSynth() {
    const synth = synthRef.current
    if (!synth) return

    const now = synth.context.currentTime

    synth.master.gain.cancelScheduledValues(now)
    synth.master.gain.setTargetAtTime(0.0001, now, 0.08)
    window.setTimeout(() => {
      synth.oscillators.forEach((oscillator) => {
        try {
          oscillator.stop()
        } catch {
          // oscillator may already be stopped
        }
      })
      void synth.context.close()
    }, 180)

    synthRef.current = null
  }

  function startSynth() {
    if (synthRef.current) return

    const AudioContextConstructor = getAudioContextConstructor()

    if (!AudioContextConstructor) {
      setAudioReady(false)
      setPlaying(false)
      return
    }

    const context = new AudioContextConstructor()
    const master = context.createGain()
    const filter = context.createBiquadFilter()
    const delay = context.createDelay()
    const feedback = context.createGain()

    const now = context.currentTime
    const frequencies = [261.63, 329.63, 392]
    const oscillators = frequencies.map((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()

      oscillator.type = index === 1 ? 'triangle' : 'sine'
      oscillator.frequency.setValueAtTime(frequency, now)
      oscillator.detune.setValueAtTime((index - 1) * 4, now)
      gain.gain.setValueAtTime(0.009, now)

      oscillator.connect(gain)
      gain.connect(filter)
      oscillator.start()

      return oscillator
    })

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(880, now)
    delay.delayTime.setValueAtTime(0.28, now)
    feedback.gain.setValueAtTime(0.18, now)
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.035, now + 0.6)

    filter.connect(master)
    filter.connect(delay)
    delay.connect(feedback)
    feedback.connect(delay)
    delay.connect(master)
    master.connect(context.destination)

    void context.resume()
    synthRef.current = { context, master, oscillators }
  }

  useLayoutEffect(() => {
    const wasOpen = prevOpenRef.current
    prevOpenRef.current = open

    if (wasOpen && !open) {
      lastClosedTrackUrlRef.current = currentSrc
      playAttemptRef.current += 1
      saveStoredPosition(positionRef.current)
      setPlaying(true)
      stopSynth()
      return
    }

    if (!wasOpen && open) {
      const nextPosition = clampPosition(positionRef.current.x, positionRef.current.y)

      updatePosition(nextPosition)
      saveStoredPosition(nextPosition)

      if (trackList.length <= 1) {
        lastClosedTrackUrlRef.current = trackList[0]?.url
        setActiveTrackIndex(0)
        return
      }

      const nextIndex = getRandomTrackIndexExceptUrl(trackList, lastClosedTrackUrlRef.current)
      lastClosedTrackUrlRef.current = trackList[nextIndex]?.url
      setActiveTrackIndex(nextIndex)
    }
  }, [currentSrc, open, trackList])

  useEffect(() => {
    if (!open) return

    if (!currentSrc) return

    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      playAudio(audio, currentSrc)
    } else {
      playAttemptRef.current += 1
      audio.pause()
    }

    return () => {
      playAttemptRef.current += 1
    }
  }, [currentSrc, open, playing])

  useEffect(() => {
    if (!open || currentSrc) return

    if (playing) {
      startSynth()
    } else {
      stopSynth()
    }

    return () => {
      stopSynth()
    }
  }, [currentSrc, open, playing])

  useEffect(() => {
    if (!open) return

    function handleResize() {
      setPosition((current) => {
        const nextPosition = clampPosition(current.x, current.y)

        positionRef.current = nextPosition
        saveStoredPosition(nextPosition)

        return nextPosition
      })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [open])

  if (!open) return null

  return (
    <aside
      ref={playerRef}
      className={['island-music-player', playing && 'island-music-player--playing'].filter(Boolean).join(' ')}
      style={{ left: position.x, top: position.y }}
      aria-label={audioReady ? `${currentTitle} ${currentSubtitle} 音乐播放器` : '音乐不可播放'}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {currentSrc ?
        <audio
          key={currentSrc}
          ref={audioRef}
          src={currentSrc}
          preload="auto"
          autoPlay={playing}
          onCanPlay={() => {
            const audio = audioRef.current

            if (audio && playing) {
              playAudio(audio, currentSrc)
            }
          }}
          onEnded={handleTrackEnded}
        />
      : null}

      <img className="island-music-player__cover" src={currentCoverSrc} alt="" draggable={false} />

      <Button
        className="island-music-player__button"
        type="text"
        size="small"
        htmlType="button"
        aria-label={playing ? '暂停音乐' : '播放音乐'}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => setPlaying((current) => !current)}
      >
        {playing ?
          <Pause className="island-music-player__icon" aria-hidden="true" />
        : <Play className="island-music-player__icon" aria-hidden="true" />}
      </Button>

      <Button
        className="island-music-player__button island-music-player__button--close"
        type="text"
        size="small"
        htmlType="button"
        aria-label="关闭音乐"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={onClose}
      >
        <X className="island-music-player__icon" aria-hidden="true" />
      </Button>
    </aside>
  )
}
