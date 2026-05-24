import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

import './island.css'

export type IslandBadgeTone = 'default' | 'teal' | 'yellow' | 'pink' | 'blue' | 'green' | 'red' | 'brown'

export interface IslandBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: IslandBadgeTone
  dot?: boolean
}

export function IslandBadge({ tone = 'default', dot = false, className, children, ...props }: IslandBadgeProps) {
  return (
    <span className={cn('island-badge', `island-badge--${tone}`, className)} {...props}>
      {dot ? <span className="island-badge__dot" aria-hidden="true" /> : null}
      {children}
    </span>
  )
}
