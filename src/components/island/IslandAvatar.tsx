import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

import './island.css'

export type IslandAvatarSize = 'sm' | 'md' | 'lg' | 'xl'
export type IslandAvatarShape = 'circle' | 'rounded' | 'squircle'
export type IslandAvatarStatus = 'online' | 'away' | 'busy' | 'offline'

const avatarSizeClass: Record<IslandAvatarSize, string> = {
  sm: 'size-11 text-sm border-[3px]',
  md: 'size-16 text-xl',
  lg: 'size-24 text-3xl',
  xl: 'size-30 text-[34px]',
}

type IslandAvatarBaseProps = {
  src?: string
  alt?: string
  name?: string
  fallback?: ReactNode
  size?: IslandAvatarSize
  shape?: IslandAvatarShape
  status?: IslandAvatarStatus
  badge?: ReactNode
}

type IslandAvatarStaticProps = IslandAvatarBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
    onClick?: undefined
  }

type IslandAvatarButtonProps = IslandAvatarBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    onClick: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
  }

export type IslandAvatarProps = IslandAvatarStaticProps | IslandAvatarButtonProps

function getInitials(name?: string) {
  if (!name) return '岛'

  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '岛'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function IslandAvatar(props: IslandAvatarProps) {
  const { src, alt, name, fallback, size = 'md', shape = 'rounded', status, badge, className, ...rest } = props

  const content = (
    <>
      {src ?
        <img className="island-avatar__image" src={src} alt={alt ?? name ?? ''} />
      : <span className="island-avatar__fallback">{fallback ?? getInitials(name)}</span>}
      {status ?
        <span className={cn('island-avatar__status', `island-avatar__status--${status}`)} />
      : null}
      {badge ?
        <span className="island-avatar__badge animate-pulse transition-all">{badge}</span>
      : null}
    </>
  )

  const classes = cn('island-avatar', avatarSizeClass[size], `island-avatar--${size}`, `island-avatar--${shape}`, 'onClick' in props && props.onClick ? 'island-avatar--button' : undefined, className)

  if ('onClick' in props && props.onClick) {
    return (
      <button type="button" className={classes} aria-label={alt ?? name ?? 'avatar'} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
        {content}
      </button>
    )
  }

  return (
    <div className={classes} {...(rest as HTMLAttributes<HTMLDivElement>)}>
      {content}
    </div>
  )
}
