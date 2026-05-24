import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from 'animal-island-ui'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

import { createIslandToastId, ISLAND_TOAST_EVENT } from './island-toast'
import type { IslandToastInput, IslandToastItem, IslandToastType } from './island-toast'
import './island.css'

function ToastIcon({ type }: { type: IslandToastType }) {
  if (type === 'success') return <CheckCircle2 aria-hidden="true" size={18} strokeWidth={3} />
  if (type === 'error') return <XCircle aria-hidden="true" size={18} strokeWidth={3} />

  return <Info aria-hidden="true" size={18} strokeWidth={3} />
}

export function IslandToastViewport() {
  const [toasts, setToasts] = useState<IslandToastItem[]>([])

  useEffect(() => {
    function handleToast(event: Event) {
      const detail = (event as CustomEvent<IslandToastInput>).detail
      const toast: IslandToastItem = {
        id: createIslandToastId(),
        type: detail.type ?? 'info',
        title: detail.title,
        description: detail.description,
        duration: detail.duration ?? 2600,
      }

      setToasts((current) => [toast, ...current].slice(0, 4))

      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id))
      }, toast.duration)
    }

    window.addEventListener(ISLAND_TOAST_EVENT, handleToast)

    return () => {
      window.removeEventListener(ISLAND_TOAST_EVENT, handleToast)
    }
  }, [])

  if (toasts.length === 0) return null

  return createPortal(
    <section className="island-toast-viewport" aria-label="消息提示" aria-live="polite">
      {toasts.map((toast) => (
        <article key={toast.id} className={`island-toast island-toast--${toast.type}`}>
          <span className="island-toast__icon">
            <ToastIcon type={toast.type} />
          </span>
          <span className="island-toast__content">
            <strong>{toast.title}</strong>
            {toast.description ? <small>{toast.description}</small> : null}
          </span>
          <Button
            className="island-toast__close"
            type="text"
            size="small"
            htmlType="button"
            aria-label="关闭提示"
            onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
          >
            <X aria-hidden="true" size={14} strokeWidth={3} />
          </Button>
        </article>
      ))}
    </section>,
    document.body,
  )
}
