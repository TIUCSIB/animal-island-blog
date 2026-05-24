import type { HTMLAttributes, ReactNode } from 'react'
import { Button, Card } from 'animal-island-ui'
import type { CardColor } from 'animal-island-ui'

import { cn } from '@/lib/utils'

import './island.css'

export interface IslandNoticeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'title'> {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  color?: CardColor
  actionText?: ReactNode
  onAction?: () => void
}

export function IslandNotice({
  title,
  description,
  icon = '✦',
  color = 'default',
  actionText,
  onAction,
  className,
  ...props
}: IslandNoticeProps) {
  return (
    <Card color={color} className={cn('island-notice', className)} {...props}>
      <span className="island-notice__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="island-notice__body">
        <h3 className="island-notice__title">{title}</h3>
        {description ? <p className="island-notice__description">{description}</p> : null}
        {actionText ? (
          <div className="island-notice__action">
            <Button type="primary" size="small" onClick={onAction}>
              {actionText}
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
