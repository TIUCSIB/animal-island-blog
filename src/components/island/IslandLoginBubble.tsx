import { Typewriter } from 'animal-island-ui'

import './island.css'

export interface IslandLoginBubbleProps {
  userName?: string | null
  musicEnabled?: boolean
  className?: string
  onAboutClick: () => void
  onMusicClick: () => void
  onLoginClick: () => void
  onLogout?: () => void
}

export function IslandLoginBubble({ userName, musicEnabled = false, className, onAboutClick, onMusicClick, onLoginClick, onLogout }: IslandLoginBubbleProps) {
  const signedIn = Boolean(userName)

  return (
    <aside className={['island-login-bubble', signedIn && 'island-login-bubble--signed-in', className].filter(Boolean).join(' ')} aria-live="polite">
      <div className="island-login-bubble__avatar" aria-hidden="true">
        {musicEnabled ?
          '🎵'
        : signedIn ?
          '🐾'
        : '🌿'}
      </div>

      <div className="island-login-bubble__content">
        <strong>{signedIn ? `${userName} 已登岛` : '小岛模式'}</strong>
        <p>
          <Typewriter speed={38} trigger={`${signedIn}-${musicEnabled}`}>
            {signedIn ? '主人模式已开启，可以继续扩展照片管理入口。' : '选择关于、音乐或登录。'}
          </Typewriter>
        </p>

        <div className="island-login-bubble__menu">
          <button className="island-login-bubble__action" type="button" onClick={onAboutClick}>
            <span aria-hidden="true">🍃</span>
          </button>

          <button className={['island-login-bubble__action', musicEnabled && 'island-login-bubble__action--active'].filter(Boolean).join(' ')} type="button" onClick={onMusicClick}>
            <span aria-hidden="true">{musicEnabled ? '♪' : '🎧'}</span>
            音乐
          </button>

          {signedIn ?
            <button className="island-login-bubble__action" type="button" onClick={onLogout}>
              <span aria-hidden="true">🐾</span>
              退出
            </button>
          : <button className="island-login-bubble__action" type="button" onClick={onLoginClick}>
              <span aria-hidden="true">🔑</span>
              登录
            </button>
          }
        </div>
      </div>

      {musicEnabled ?
        <div className="island-login-bubble__notes" aria-hidden="true">
          <span>♪</span>
          <span>♬</span>
          <span>♫</span>
        </div>
      : null}
    </aside>
  )
}
