import { useMemo } from 'react'

type IslandPostContentProps = {
  content: string
}

export function IslandPostContent({ content }: IslandPostContentProps) {
  const html = useMemo(() => content || '', [content])

  return (
    <div
      className="island-gallery-post-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
