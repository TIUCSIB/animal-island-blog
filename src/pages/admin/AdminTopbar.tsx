import { useEffect, useRef, useState } from 'react'
import { Button, Card } from 'animal-island-ui'
import { ChevronDown, Home, LogOut, Sprout } from 'lucide-react'

import { IslandAvatar } from '@/components/island'
import type { SiteProfile } from '@/data/site-profile'

type AdminTopbarProps = {
  account?: string
  profile: SiteProfile
  onHomeClick: () => void
  onLogout: () => void
}

export function AdminTopbar({ account, profile, onHomeClick, onLogout }: AdminTopbarProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function handleHomeClick() {
    setOpen(false)
    onHomeClick()
  }

  function handleLogoutClick() {
    setOpen(false)
    onLogout()
  }

  const displayName = profile.nickname || account || '岛主'
  const displayHandle = profile.handle || (account ? `@${account}` : '@island-admin')

  return (
    <Card className="island-admin-topbar">
      <div className="island-admin-topbar__brand">
        <span className="island-admin-topbar__brand-icon" aria-hidden="true">
          <Sprout size={18} strokeWidth={3} />
        </span>
        <span>
          <strong>小岛后台</strong>
          <small>{profile.bio}</small>
        </span>
      </div>

      <div ref={menuRef} className="island-admin-user-menu">
        <button className="island-admin-user-menu__trigger" type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
          <IslandAvatar src={profile.avatarUrl} name={displayName} size="sm" shape="circle" className="island-admin-user-menu__avatar" />
          <span className="island-admin-user-menu__text">
            <strong>{displayName}</strong>
            <small>{displayHandle}</small>
          </span>
          <ChevronDown className={open ? 'island-admin-user-menu__chevron island-admin-user-menu__chevron--open' : 'island-admin-user-menu__chevron'} size={16} strokeWidth={3} />
        </button>

        {open ?
          <div className="island-admin-user-menu__dropdown" role="menu">
            <Button className="island-admin-user-menu__item" type="text" size="small" htmlType="button" icon={<Home size={14} strokeWidth={3} />} onClick={handleHomeClick}>
              返回首页
            </Button>
            <Button
              className="island-admin-user-menu__item island-admin-user-menu__item--danger"
              type="primary"
              danger
              size="small"
              htmlType="button"
              icon={<LogOut size={14} strokeWidth={3} />}
              onClick={handleLogoutClick}
            >
              退出登录
            </Button>
          </div>
        : null}
      </div>
    </Card>
  )
}
