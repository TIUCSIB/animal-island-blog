import { createElement, type HTMLAttributes, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

import './island.css'

export type IslandTextAs = 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'small' | 'strong'
export type IslandTextVariant = 'display' | 'title' | 'subtitle' | 'body' | 'muted' | 'caption' | 'label'
export type IslandTextTone = 'default' | 'primary' | 'secondary' | 'brown' | 'teal' | 'green' | 'yellow' | 'red' | 'white'
export type IslandTextAlign = 'left' | 'center' | 'right'
export type IslandTextClamp = 1 | 2 | 3

export interface IslandTextProps extends HTMLAttributes<HTMLElement> {
  as?: IslandTextAs
  variant?: IslandTextVariant
  tone?: IslandTextTone
  align?: IslandTextAlign
  clamp?: IslandTextClamp
  balance?: boolean
  children: ReactNode
}

export function IslandText({
  as,
  variant = 'body',
  tone = 'default',
  align,
  clamp,
  balance = false,
  className,
  children,
  ...props
}: IslandTextProps) {
  const element = as ?? (variant === 'display' ? 'h1' : variant === 'title' ? 'h2' : variant === 'caption' ? 'small' : 'p')

  return createElement(
    element,
    {
      className: cn(
        'island-text',
        `island-text--${variant}`,
        tone !== 'default' ? `island-text--${tone}` : undefined,
        align ? `island-text--${align}` : undefined,
        balance ? 'island-text--balance' : undefined,
        clamp === 1 ? 'island-text--truncate' : undefined,
        clamp === 2 ? 'island-text--clamp-2' : undefined,
        clamp === 3 ? 'island-text--clamp-3' : undefined,
        className,
      ),
      ...props,
    },
    children,
  )
}

export interface IslandTextStackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: 'sm' | 'md' | 'lg'
}

export function IslandTextStack({ gap = 'md', className, ...props }: IslandTextStackProps) {
  return <div className={cn('island-text-stack', `island-text-stack--${gap}`, className)} {...props} />
}
