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
  const [activePackId, setActivePackId] = useState(stickerPacks[0]?.id ?? '')
  const [page, setPage] = useState(0)
  const lastWheelAtRef = useRef(0)
  const activePack = useMemo(() => stickerPacks.find((pack) => pack.id === activePackId) ?? stickerPacks[0], [activePackId])
  const pages = useMemo(() => {
    const stickers = activePack?.stickers ?? []

    return Array.from({ length: Math.ceil(stickers.length / pageSize) }, (_, index) => stickers.slice(index * pageSize, (index + 1) * pageSize))
  }, [activePack, pageSize])

  function switchPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 0), Math.max(pages.length - 1, 0)))
  }

  function switchPack(packId: string) {
    setActivePackId(packId)
    setPage(0)
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX

    if (Math.abs(delta) < 12) return

    event.preventDefault()

    const now = Date.now()
    if (now - lastWheelAtRef.current < 320) return

    lastWheelAtRef.current = now
    setPage((current) => Math.min(Math.max(current + (delta > 0 ? 1 : -1), 0), Math.max(pages.length - 1, 0)))
  }

  return (
    <section className="island-admin-sticker-panel">
      <div className="island-admin-sticker-panel__viewport" onWheel={handleWheel}>
        {stickerPacks.length > 1 ? (
          <div className="island-admin-sticker-panel__packs" role="tablist" aria-label="表情包分类">
            {stickerPacks.map((pack) => (
              <button
                key={pack.id}
                className={pack.id === activePackId ? 'is-active' : ''}
                type="button"
                role="tab"
                aria-selected={pack.id === activePackId}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => switchPack(pack.id)}
              >
                {pack.label}
              </button>
            ))}
          </div>
        ) : null}
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
