import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router'

import { Loading } from 'animal-island-ui'
import { Gallery } from './components/Gallery'
import type { SiteLayoutContext } from './components/SiteLayout'

const HOME_LOADING_DURATION = 1100
const HOME_LOADING_EXIT_DURATION = 1400
const HOME_LOADING_SEEN_STORAGE_KEY = 'home-loading-seen'

function shouldShowHomeLoading() {
  if (typeof window === 'undefined') return false

  return window.sessionStorage.getItem(HOME_LOADING_SEEN_STORAGE_KEY) !== 'true'
}

export default function HomePage() {
  const [showLoading] = useState(() => shouldShowHomeLoading())
  const [loadingActive, setLoadingActive] = useState(showLoading)
  const [loadingMounted, setLoadingMounted] = useState(showLoading)
  const { siteProfile } = useOutletContext<SiteLayoutContext>()

  useEffect(() => {
    if (!showLoading) return

    window.sessionStorage.setItem(HOME_LOADING_SEEN_STORAGE_KEY, 'true')

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
  }, [showLoading])

  return (
    <>
      {loadingMounted ?
        <div className={`homepage-loading ${loadingActive ? '' : 'homepage-loading--leaving'}`} role="status" aria-live="polite" aria-label="首页加载中">
          <Loading active={loadingActive} />
        </div>
      : null}

      <Gallery siteProfile={siteProfile} />
    </>
  )
}
