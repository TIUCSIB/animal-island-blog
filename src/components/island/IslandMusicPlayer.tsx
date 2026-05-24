import { useEffect, useRef, useState } from 'react'
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

  return {
    x: Math.max(10, Math.round((window.innerWidth - PLAYER_WIDTH) / 2)),
    y: Math.max(10, window.visualViewport?.offsetTop ?? 18),
  }
}

export function IslandMusicPlayer({ open, src, coverSrc = DEFAULT_COVER, title = '小岛电台', subtitle = 'lo-fi 小岛电台', tracks, onClose }: IslandMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playerRef = useRef<HTMLElement | null>(null)
  const synthRef = useRef<SynthNodes | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const [playing, setPlaying] = useState(true)
  const [audioReady, setAudioReady] = useState(true)
  const [position, setPosition] = useState<PlayerPosition>(() => getDefaultPosition())
  const [activeTrackIndex, setActiveTrackIndex] = useState(0)
  const trackList = tracks?.filter((track) => track.url) ?? (src ? [{ title, author: subtitle, pic: coverSrc, url: src }] : [])
  const activeTrack = trackList[activeTrackIndex] ?? trackList[0]
  const currentSrc = activeTrack?.url
  const currentCoverSrc = activeTrack?.pic || coverSrc
  const currentTitle = activeTrack?.title || title
  const currentSubtitle = activeTrack?.author || subtitle

  function clampPosition(nextX: number, nextY: number) {
    const rect = playerRef.current?.getBoundingClientRect()
    const width = rect?.width ?? PLAYER_WIDTH
    const height = rect?.height ?? PLAYER_HEIGHT
    const padding = 8
    const maxX = Math.max(padding, window.innerWidth - width - padding)
    const maxY = Math.max(padding, window.innerHeight - height - padding)

    return {
      x: Math.min(Math.max(padding, nextX), maxX),
      y: Math.min(Math.max(padding, nextY), maxY),
    }
  }

  function playNextTrack() {
    if (trackList.length <= 1) return

    setActiveTrackIndex((current) => (current + 1) % trackList.length)
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

    setPosition(clampPosition(event.clientX - drag.offsetX, event.clientY - drag.offsetY))
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current

    if (!drag || drag.pointerId !== event.pointerId) return

    dragRef.current = null

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

  useEffect(() => {
    if (!open) {
      setPlaying(true)
      stopSynth()
      return
    }

    if (!currentSrc) return

    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      void audio.play().catch(() => {
        setPlaying(false)
      })
    } else {
      audio.pause()
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
    setActiveTrackIndex(0)
  }, [src, tracks])

  useEffect(() => {
    if (!open) return

    function handleResize() {
      setPosition((current) => clampPosition(current.x, current.y))
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
        <audio key={currentSrc} ref={audioRef} src={currentSrc} loop={trackList.length <= 1} preload="auto" onEnded={playNextTrack} />
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
