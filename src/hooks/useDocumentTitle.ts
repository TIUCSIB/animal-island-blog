import { useEffect } from 'react'
import { useMatches } from 'react-router'

const SITE_NAME = 'island'

export function useDocumentTitle(override?: string) {
  const matches = useMatches()

  useEffect(() => {
    if (override) {
      document.title = `${override} | ${SITE_NAME}`
      return
    }

    for (let i = matches.length - 1; i >= 0; i--) {
      const title = (matches[i].handle as { title?: string })?.title
      if (title) {
        document.title = `${title} | ${SITE_NAME}`
        return
      }
    }
  }, [matches, override])
}
