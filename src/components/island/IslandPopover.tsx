import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type IslandPopoverProps = {
  open: boolean
  trigger: ReactNode
  children: ReactNode
  onOpenChange: (open: boolean) => void
  className?: string
  contentClassName?: string
}

export function IslandPopover({ open, trigger, children, onOpenChange, className, contentClassName }: IslandPopoverProps) {
  const rootRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onOpenChange(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onOpenChange, open])

  return (
    <span ref={rootRef} className={cn('relative inline-flex', className)}>
      {trigger}
      {open ? (
        <span
          className={cn(
            'absolute bottom-[calc(100%+10px)] left-1/2 z-30 grid w-72 -translate-x-1/2 gap-3 rounded-[22px] border-2 border-[#c4b89e]/60 bg-[#fffdf7]/95 p-3 text-[#725d42] shadow-[0_5px_0_rgba(212,201,180,0.72),0_18px_36px_rgba(61,52,40,0.14)] backdrop-blur',
            contentClassName,
          )}
          role="dialog"
        >
          {children}
        </span>
      ) : null}
    </span>
  )
}
