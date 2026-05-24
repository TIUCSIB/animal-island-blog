import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router'

import { Loading } from 'animal-island-ui'
import { Gallery } from './components/Gallery'
import type { SiteLayoutContext } from './components/SiteLayout'

const HOME_LOADING_DURATION = 1100
const HOME_LOADING_EXIT_DURATION = 1400

export default function HomePage() {
  const [loadingActive, setLoadingActive] = useState(true)
  const [loadingMounted, setLoadingMounted] = useState(true)
  const { siteProfile } = useOutletContext<SiteLayoutContext>()

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

      <Gallery siteProfile={siteProfile} />
    </>
  )
}
