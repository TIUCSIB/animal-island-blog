import { Outlet, useLocation, useNavigate } from 'react-router'

import { defaultSiteProfile } from '@/data/site-profile'
import type { SiteProfile } from '@/data/site-profile'
import { useSiteProfileQuery } from '@/lib/query-hooks'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { Button } from 'animal-island-ui'

export type SiteLayoutContext = {
  siteProfile: SiteProfile
}

export function SiteLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAboutPage = location.pathname === '/about'
  const siteProfileQuery = useSiteProfileQuery()
  const siteProfile = siteProfileQuery.data ?? defaultSiteProfile

  return (
    <div className="m-auto flex min-h-dvh max-w-3xl flex-col px-5 pt-7.5">
      {isAboutPage ?
        <Button className="island-about-page__back w-fit" type="primary" size="small" onClick={() => navigate('/')}>
          ← 返回首页
        </Button>
      : null}
      <SiteHeader profile={siteProfile} />
      <main className="flex-1">
        <Outlet context={{ siteProfile } satisfies SiteLayoutContext} />
      </main>
      <SiteFooter />
    </div>
  )
}
