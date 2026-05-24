import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { MapPin, Pin } from 'lucide-react'

import { cn } from '@/lib/utils'

import './island.css'

export type IslandGalleryItemRatio = 'square' | 'portrait' | 'landscape' | 'wide'
export type IslandGalleryItemContentPlacement = 'overlay' | 'below' | 'none'

export interface IslandGalleryGridProps extends HTMLAttributes<HTMLDivElement> {
  minItemWidth?: string
  gap?: string
}

export interface IslandGalleryItemProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  imageSrc: string
  imageAlt?: string
  title?: ReactNode
  location?: ReactNode
  ratio?: IslandGalleryItemRatio
  contentPlacement?: IslandGalleryItemContentPlacement
  radius?: string
  pinned?: boolean
  corner?: ReactNode
  onOpen?: () => void
  imageClassName?: string
  contentClassName?: string
}

export function IslandGalleryGrid({
  minItemWidth = '180px',
  gap = '14px',
  className,
  style,
  ...props
}: IslandGalleryGridProps) {
  return (
    <div
      className={cn('island-gallery-grid', className)}
      style={
        {
          '--island-gallery-min': minItemWidth,
          '--island-gallery-gap': gap,
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  )
}

export function IslandGalleryItem({
  imageSrc,
  imageAlt = '',
  title,
  location,
  ratio = 'portrait',
  contentPlacement = 'overlay',
  radius,
  pinned = false,
  corner,
  onOpen,
  className,
  style,
  imageClassName,
  contentClassName,
  ...props
}: IslandGalleryItemProps) {
  const hasContent = Boolean(title || location)

  const info = hasContent ? (
    <div className={cn('island-gallery-item__content', contentClassName)}>
      {location ? (
        <div className="island-gallery-item__location">
          <MapPin aria-hidden="true" size={14} strokeWidth={2.6} />
          <span>{location}</span>
        </div>
      ) : null}

      {title ? <h3 className="island-gallery-item__title">{title}</h3> : null}
    </div>
  ) : null

  const body = (
    <>
      <div className={cn('island-gallery-item__media', `island-gallery-item__media--${ratio}`)}>
        <img className={cn('island-gallery-item__image', imageClassName)} src={imageSrc} alt={imageAlt} />
        <div className="island-gallery-item__shade" />

        {(pinned || corner) ? (
          <div className="island-gallery-item__corner">
            {corner}
            {pinned ? (
              <span className="island-gallery-item__marker island-gallery-item__marker--pin" aria-label="置顶">
                <Pin aria-hidden="true" size={13} strokeWidth={3.4} />
              </span>
            ) : null}
          </div>
        ) : null}

        {contentPlacement === 'overlay' && info ? <div className="island-gallery-item__overlay">{info}</div> : null}
      </div>

      {contentPlacement === 'below' && info ? info : null}
    </>
  )

  const classes = cn(
    'island-gallery-item',
    `island-gallery-item--${contentPlacement}`,
    onOpen ? 'island-gallery-item--clickable' : undefined,
    className,
  )
  const itemStyle = {
    '--island-gallery-radius': radius,
    ...style,
  } as CSSProperties

  if (onOpen) {
    return (
      <button className={classes} type="button" onClick={onOpen} aria-label={imageAlt || String(title || '打开图片')} style={itemStyle} {...props}>
        {body}
      </button>
    )
  }

  return (
    <article className={classes} style={itemStyle} {...props}>
      {body}
    </article>
  )
}
