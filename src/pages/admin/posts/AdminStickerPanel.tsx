import { useMemo, useRef, useState } from 'react'
import type { WheelEvent } from 'react'

import { stickerPacks, type AdminSticker } from '@/data/sticker-packs'

export type { AdminSticker } from '@/data/sticker-packs'

type AdminStickerPanelProps = {
  onSelect: (sticker: AdminSticker) => void
  pageSize?: number
}

const defaultPageSize = 45


export function AdminStickerPanel({ onSelect, pageSize = defaultPageSize }: AdminStickerPanelProps) {
  const [page, setPage] = useState(0)
  const lastWheelAtRef = useRef(0)
  const pages = useMemo(() => {
    const stickers = stickerPacks.flatMap((pack) => pack.stickers)

    return Array.from({ length: Math.ceil(stickers.length / pageSize) }, (_, index) => stickers.slice(index * pageSize, (index + 1) * pageSize))
  }, [pageSize])

  function switchPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 0), pages.length - 1))
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX

    if (Math.abs(delta) < 12) return

    event.preventDefault()

    const now = Date.now()
    if (now - lastWheelAtRef.current < 320) return

    lastWheelAtRef.current = now
    setPage((current) => Math.min(Math.max(current + (delta > 0 ? 1 : -1), 0), pages.length - 1))
  }

  return (
    <section className="island-admin-sticker-panel">
      <div className="island-admin-sticker-panel__viewport" onWheel={handleWheel}>
        <div className="island-admin-sticker-panel__clip">
          <div className="island-admin-sticker-panel__track" style={{ transform: `translate3d(-${page * 100}%, 0, 0)` }}>
            {pages.map((stickers, index) => (
              <ul key={index} className="island-admin-sticker-panel__page">
                {stickers.map((sticker) => (
                  <li key={sticker.src}>
                    <button
                      type="button"
                      title={sticker.alt}
                      aria-label={sticker.alt}
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={() => onSelect(sticker)}
                    >
                      <img src={sticker.src} alt={sticker.alt} loading="lazy" />
                    </button>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <div className="island-admin-sticker-panel__dots">
          {pages.map((_, index) => (
            <button key={index} className={index === page ? 'is-active' : ''} type="button" aria-label={`第 ${index + 1} 页`} onClick={() => switchPage(index)} />
          ))}
        </div>
      </div>
    </section>
  )
}
