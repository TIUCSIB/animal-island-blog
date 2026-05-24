import { useEffect, useState } from 'react'

import { Loading } from 'animal-island-ui'
import { defaultSiteProfile } from '@/data/site-profile'
import { useSiteProfileQuery } from '@/lib/query-hooks'
import { Gallery } from './components/Gallery'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'

const HOME_LOADING_DURATION = 1100
const HOME_LOADING_EXIT_DURATION = 1400

export default function HomePage() {
  const [loadingActive, setLoadingActive] = useState(true)
  const [loadingMounted, setLoadingMounted] = useState(true)
  const siteProfileQuery = useSiteProfileQuery()
  const siteProfile = siteProfileQuery.data ?? defaultSiteProfile

  useEffect(() => {
    const hideTimer = window.setTimeout(() => {
      setLoadingActive(false)
    }, HOME_LOADING_DURATION)

    const unmountTimer = window.setTimeout(() => {
      setLoadingMounted(false)
    }, HOME_LOADING_DURATION + HOME_LOADING_EXIT_DURATION)

    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(unmountTimer)
    }
  }, [])

  return (
    <>
      {loadingMounted ?
        <div className={`homepage-loading ${loadingActive ? '' : 'homepage-loading--leaving'}`} role="status" aria-live="polite" aria-label="首页加载中">
          <Loading active={loadingActive} />
        </div>
      : null}

      <div className="m-auto flex min-h-dvh max-w-lg flex-col px-5 pt-7.5">
        <SiteHeader profile={siteProfile} typewriterTrigger={loadingMounted} />
        <main className="flex-1">
          <Gallery siteProfile={siteProfile} />
        </main>
        <SiteFooter />
      </div>
    </>
  )
}
