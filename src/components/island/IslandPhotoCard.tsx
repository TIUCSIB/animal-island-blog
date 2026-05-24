import type { HTMLAttributes, ReactNode } from 'react'
import { Card } from 'animal-island-ui'

import { cn } from '@/lib/utils'

import { IslandBadge } from './IslandBadge'
import type { IslandBadgeTone } from './IslandBadge'
import './island.css'

export interface IslandPhotoCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'title'> {
  imageSrc: string
  imageAlt?: string
  title: ReactNode
  description?: ReactNode
  category?: ReactNode
  categoryTone?: IslandBadgeTone
  meta?: ReactNode
  onOpen?: () => void
}

export function IslandPhotoCard({
  imageSrc,
  imageAlt = '',
  title,
  description,
  category,
  categoryTone = 'teal',
  meta,
  onOpen,
  className,
  ...props
}: IslandPhotoCardProps) {
  const media = (
    <>
      <img className="island-photo-card__image" src={imageSrc} alt={imageAlt} />
      {category ? (
        <IslandBadge className="island-photo-card__category" tone={categoryTone}>
          {category}
        </IslandBadge>
      ) : null}
    </>
  )

  return (
    <Card className={cn('island-photo-card', className)} {...props}>
      {onOpen ? (
        <button type="button" className="island-photo-card__media-button" onClick={onOpen}>
          {media}
        </button>
      ) : (
        <div className="island-photo-card__media-frame">{media}</div>
      )}

      <h3 className="island-photo-card__title">{title}</h3>
      {description ? <p className="island-photo-card__description">{description}</p> : null}
      {meta ? <div className="island-photo-card__meta">{meta}</div> : null}
    </Card>
  )
}
