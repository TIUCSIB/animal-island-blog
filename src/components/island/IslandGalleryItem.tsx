import { useId, useState } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { Images, MapPin, Pin, Video } from 'lucide-react'

import { cn } from '@/lib/utils'

import './island.css'

export type IslandGalleryItemRatio = 'square' | 'portrait' | 'landscape' | 'wide'
export type IslandGalleryItemContentPlacement = 'overlay' | 'below' | 'none'
export type IslandGalleryItemMediaType = 'image' | 'video'

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
  multiple?: boolean
  mediaType?: IslandGalleryItemMediaType
  corner?: ReactNode
  onOpen?: () => void
  imageClassName?: string
  contentClassName?: string
}

type IslandGalleryImageProps = {
  src: string
  alt: string
  className?: string
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
  multiple = false,
  mediaType = 'image',
  corner,
  onOpen,
  className,
  style,
  imageClassName,
  contentClassName,
  ...props
}: IslandGalleryItemProps) {
  const titleId = useId()
  const hasContent = Boolean(title || location)
  const markerType =
    pinned ? 'pin'
    : mediaType === 'video' ? 'video'
    : multiple ? 'images'
    : null
  const markerLabel =
    markerType === 'pin' ? '置顶'
    : markerType === 'video' ? '视频'
    : markerType === 'images' ? '多图'
    : ''
  const markerIcon =
    markerType === 'pin' ? <Pin aria-hidden="true" size={13} strokeWidth={3.4} />
    : markerType === 'video' ? <Video aria-hidden="true" size={13} strokeWidth={3.2} />
    : markerType === 'images' ? <Images aria-hidden="true" size={13} strokeWidth={3.2} />
    : null

  const info = hasContent ? (
    <div className={cn('island-gallery-item__content', contentClassName)}>
      {location ? (
        <div className="island-gallery-item__location">
          <MapPin aria-hidden="true" size={14} strokeWidth={2.6} />
          <span>{location}</span>
        </div>
      ) : null}

      {title ? <h3 id={titleId} className="island-gallery-item__title">{title}</h3> : null}
    </div>
  ) : null

  const body = (
    <>
      <div className={cn('island-gallery-item__media', `island-gallery-item__media--${ratio}`)}>
        <IslandGalleryImage key={imageSrc} className={imageClassName} src={imageSrc} alt={imageAlt} />
        <div className="island-gallery-item__shade" />

        {(markerIcon || (!pinned && corner)) ? (
          <div className="island-gallery-item__corner">
            {pinned ? null : corner}
            {markerIcon ? (
              <span className={cn('island-gallery-item__marker', `island-gallery-item__marker--${markerType}`)} aria-label={markerLabel}>
                {markerIcon}
              </span>
            ) : null}
          </div>
        ) : null}

        {contentPlacement === 'overlay' && info ? <div className="island-gallery-item__overlay">{info}</div> : null}
      </div>

      {contentPlacement === 'below' && info ? info : null}

      {onOpen ? (
        <button
          className="island-gallery-item__trigger"
          type="button"
          aria-label={imageAlt || String(title || '打开文章')}
          aria-labelledby={title ? titleId : undefined}
          onClick={onOpen}
        />
      ) : null}
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

  return (
    <article className={classes} style={itemStyle} {...props}>
      {body}
    </article>
  )
}

function IslandGalleryImage({ src, alt, className }: IslandGalleryImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      <span className={cn('island-gallery-item__placeholder', loaded && 'is-loaded')} aria-hidden="true" />
      <img
        className={cn('island-gallery-item__image', loaded && 'is-loaded', className)}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </>
  )
}
