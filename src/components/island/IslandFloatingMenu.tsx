import { Button } from 'animal-island-ui'

import './island.css'

export interface IslandFloatingMenuProps {
  userName?: string | null
  musicAvailable?: boolean
  musicEnabled?: boolean
  className?: string
  onAboutClick: () => void
  onMusicClick: () => void
  onLoginClick: () => void
  onAdminClick?: () => void
}

export function IslandFloatingMenu({
  userName,
  musicAvailable = true,
  musicEnabled = false,
  className,
  onAboutClick,
  onMusicClick,
  onLoginClick,
  onAdminClick,
}: IslandFloatingMenuProps) {
  const signedIn = Boolean(userName)
  const menuClassName = [
    'island-floating-menu',
    musicEnabled && 'island-floating-menu--music-on',
    !musicAvailable && 'island-floating-menu--music-hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <nav className={menuClassName} aria-label="小岛快捷菜单">
      <Button className="island-floating-menu__item" type="primary" size="small" htmlType="button" aria-label="关于小岛" title="关于" onClick={onAboutClick}>
        <span className="island-floating-menu__icon" aria-hidden="true">
          🍃
        </span>
      </Button>

      {musicAvailable ? (
        <Button
          className={['island-floating-menu__item', musicEnabled && 'island-floating-menu__item--active'].filter(Boolean).join(' ')}
          type="primary"
          size="small"
          htmlType="button"
          aria-label={musicEnabled ? '关闭音乐' : '开启音乐'}
          aria-pressed={musicEnabled}
          title="音乐"
          onClick={onMusicClick}
        >
          <span className="island-floating-menu__icon" aria-hidden="true">
            {musicEnabled ? '♪' : '🎧'}
          </span>
        </Button>
      ) : null}

      {signedIn ? (
        <Button
          className="island-floating-menu__item island-floating-menu__item--signed"
          type="primary"
          size="small"
          htmlType="button"
          aria-label={`${userName} 已登岛，进入后台`}
          title="进入后台"
          onClick={onAdminClick}
        >
          <span className="island-floating-menu__icon" aria-hidden="true">
            🐾
          </span>
        </Button>
      ) : (
        <Button className="island-floating-menu__item" type="primary" size="small" htmlType="button" aria-label="登录" title="登录" onClick={onLoginClick}>
          <span className="island-floating-menu__icon" aria-hidden="true">
            🔑
          </span>
        </Button>
      )}

      {musicAvailable && musicEnabled ? (
        <span className="island-floating-menu__notes" aria-hidden="true">
          <span>♪</span>
          <span>♬</span>
          <span>♫</span>
        </span>
      ) : null}
    </nav>
  )
}
