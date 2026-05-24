import type { HTMLAttributes, ReactNode } from 'react'
import { Card } from 'animal-island-ui'
import type { CardColor } from 'animal-island-ui'

import { cn } from '@/lib/utils'

import './island.css'

export interface IslandStatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  icon?: ReactNode
  color?: CardColor
}

export function IslandStatCard({
  label,
  value,
  hint,
  icon = '★',
  color = 'app-yellow',
  className,
  ...props
}: IslandStatCardProps) {
  return (
    <Card color={color} className={cn('island-stat-card', className)} {...props}>
      <span className="island-stat-card__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="island-stat-card__content">
        <span className="island-stat-card__label">{label}</span>
        <strong className="island-stat-card__value">{value}</strong>
        {hint ? <span className="island-stat-card__hint">{hint}</span> : null}
      </span>
    </Card>
  )
}
