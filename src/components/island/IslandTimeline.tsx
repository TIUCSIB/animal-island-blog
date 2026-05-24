import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

import './island.css'

export interface IslandTimelineItem {
  key?: string
  time: ReactNode
  title: ReactNode
  description?: ReactNode
}

export interface IslandTimelineProps extends HTMLAttributes<HTMLUListElement> {
  items: IslandTimelineItem[]
}

export function IslandTimeline({ items, className, ...props }: IslandTimelineProps) {
  return (
    <ul className={cn('island-timeline', className)} {...props}>
      {items.map((item, index) => (
        <li key={item.key ?? index} className="island-timeline__item">
          <span className="island-timeline__rail" aria-hidden="true">
            <span className="island-timeline__dot" />
          </span>
          <article className="island-timeline__card">
            <time className="island-timeline__time">{item.time}</time>
            <h3 className="island-timeline__title">{item.title}</h3>
            {item.description ? <p className="island-timeline__description">{item.description}</p> : null}
          </article>
        </li>
      ))}
    </ul>
  )
}
