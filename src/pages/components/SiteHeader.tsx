import { Divider, Typewriter } from 'animal-island-ui'
import { useLocation, useNavigate } from 'react-router'

import { IslandAvatar, IslandText } from '@/components/island'
import type { SiteProfile } from '@/data/site-profile'

export interface SiteHeaderProps {
  profile: SiteProfile
  typewriterTrigger?: unknown
}

export function SiteHeader({ profile, typewriterTrigger }: SiteHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const isAboutPage = location.pathname === '/about'

  function handleAvatarClick() {
    navigate(isAboutPage ? '/' : '/about')
  }

  return (
    <>
      <header className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 max-md:items-center max-md:gap-x-3">
        <IslandAvatar
          badge={profile.badgeEnabled ? profile.badge : undefined}
          status={profile.avatarStatus || undefined}
          src={profile.avatarUrl}
          name={profile.nickname}
          alt={profile.nickname}
          title={isAboutPage ? '返回首页' : '查看关于页面'}
          aria-label={isAboutPage ? '返回首页' : '查看关于页面'}
          className="row-span-2 size-30 shrink-0 max-md:row-span-1 max-md:size-18"
          shape="circle"
          onClick={handleAvatarClick}
        />

        <div className="my-4 flex min-w-0 flex-col whitespace-nowrap max-md:my-0.5">
          <span className="title text-lg max-md:text-base max-md:leading-tight">
            <IslandText tone="yellow" variant="subtitle">
              {profile.nickname}
            </IslandText>
          </span>
          <span className="text-sm/5 text-muted-foreground max-md:text-[10px]">
            <IslandText variant="caption" tone="default">
              {profile.handle}
            </IslandText>
          </span>
        </div>

        <p className="-mt-3 m-0 text-sm text-muted-foreground max-md:col-span-2 max-md:mt-5 max-md:text-xs">
          <IslandText tone="teal" variant="label">
            <Typewriter trigger={typewriterTrigger}>{profile.bio}</Typewriter>
          </IslandText>
        </p>
      </header>

      <Divider type="line-white" className="mt-5" />
    </>
  )
}
