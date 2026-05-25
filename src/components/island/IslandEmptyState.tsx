import type { HTMLAttributes, ReactNode } from 'react'
import { Button } from 'animal-island-ui'

import { cn } from '@/lib/utils'

import './island.css'

export interface IslandEmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'title'> {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  actionText?: ReactNode
  onAction?: () => void
}

export function IslandEmptyState({ title, description, icon = '☁', actionText, onAction, className, ...props }: IslandEmptyStateProps) {
  return (
    <div className={cn('island-empty-state', className)} {...props}>
      <div className="island-empty-state__inner">
        <span className="island-empty-state__icon" aria-hidden="true">
          {icon}
        </span>
        <span className="island-empty-state__title">{title}</span>
        {description ?
          <p className="island-empty-state__description">{description}</p>
        : null}
        {actionText ?
          <div className="island-empty-state__action">
            <Button type="primary" onClick={onAction}>
              {actionText}
            </Button>
          </div>
        : null}
      </div>
    </div>
  )
}
