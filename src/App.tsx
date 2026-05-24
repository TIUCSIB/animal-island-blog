import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { Cursor } from 'animal-island-ui'
import { emitIslandToast, IslandFloatingMenu, IslandFloatingSwitch, IslandLoginModal, IslandMusicPlayer, IslandToastViewport } from '@/components/island'
import { fetchMusicConfig, loginAdmin } from '@/lib/posts-api'
import type { MusicConfig } from '@/lib/posts-api'

const ISLAND_MODE_STORAGE_KEY = 'island-mode-enabled'
const ISLAND_USER_STORAGE_KEY = 'island-user-name'
const ISLAND_OPEN_LOGIN_EVENT = 'island-open-login'

const defaultMusicConfig: MusicConfig = {
  enabled: true,
  platform: 'netease',
  sourceType: 'song',
  musicId: '473403185',
  tracks: [
    {
      title: 'ふたつの影',
      author: 'Famishin / 春風まゆき',
      pic: 'https://p1.music.126.net/UtBzZyeeHb84vRQXWoH48A==/19019352137357551.jpg',
      url: 'https://music.030456.xyz/api?server=netease&type=url&id=473403185',
      lrc: 'https://music.030456.xyz/api?server=netease&type=lrc&id=473403185',
    },
  ],
}

function readStoredBoolean(key: string) {
  return localStorage.getItem(key) === 'true'
}

function readStoredUserName() {
  const token = localStorage.getItem('island-admin-token')
  const userName = localStorage.getItem(ISLAND_USER_STORAGE_KEY)

  if (!token) {
    localStorage.removeItem(ISLAND_USER_STORAGE_KEY)
    return null
  }

  return userName || null
}

export default function App() {
  const navigate = useNavigate()
  const [isIslandMode, setIsIslandMode] = useState(() => readStoredBoolean(ISLAND_MODE_STORAGE_KEY))
  const [loginOpen, setLoginOpen] = useState(false)
  const [musicEnabled, setMusicEnabled] = useState(false)
  const [musicConfig, setMusicConfig] = useState<MusicConfig>(defaultMusicConfig)
  const [userName, setUserName] = useState<string | null>(() => readStoredUserName())
  const musicAvailable = musicConfig.enabled && musicConfig.tracks.length > 0

  useEffect(() => {
    const controller = new AbortController()

    fetchMusicConfig(controller.signal)
      .then((nextMusicConfig) => {
        setMusicConfig(nextMusicConfig)
      })
      .catch(() => {
        // 后端未启动时，继续使用默认音乐。
      })

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    function syncAdminAuth() {
      setUserName(readStoredUserName())
    }

    syncAdminAuth()
    window.addEventListener('island-admin-auth-change', syncAdminAuth)
    window.addEventListener('storage', syncAdminAuth)

    return () => {
      window.removeEventListener('island-admin-auth-change', syncAdminAuth)
      window.removeEventListener('storage', syncAdminAuth)
    }
  }, [])

  useEffect(() => {
    function openLoginFromPage() {
      setLoginOpen(true)
    }

    window.addEventListener(ISLAND_OPEN_LOGIN_EVENT, openLoginFromPage)

    return () => {
      window.removeEventListener(ISLAND_OPEN_LOGIN_EVENT, openLoginFromPage)
    }
  }, [])

  function handleIslandModeChange(nextChecked: boolean) {
    setIsIslandMode(nextChecked)
    localStorage.setItem(ISLAND_MODE_STORAGE_KEY, String(nextChecked))

    if (!nextChecked) {
      setLoginOpen(false)
      setMusicEnabled(false)
    }
  }

  function openAboutPage() {
    navigate('/about')
  }

  function openAdminPage() {
    navigate('/admin')
  }

  async function handleLogin(userNameValue: string, password: string) {
    const { token, profile } = await loginAdmin(userNameValue, password)
    const nextUserName = profile?.account || userNameValue.trim() || 'mewbarkjoy'

    localStorage.setItem('island-admin-token', token)
    localStorage.setItem(ISLAND_USER_STORAGE_KEY, nextUserName)
    window.dispatchEvent(new Event('island-admin-auth-change'))
    setUserName(nextUserName)
    emitIslandToast({
      type: 'success',
      title: '登录成功',
      description: '正在进入后台',
    })
    navigate('/admin')
  }

  return (
    <section className={['island-app', isIslandMode && 'island-app--island-mode', isIslandMode && 'island-app--footer-animated', musicEnabled && 'island-app--music-on'].filter(Boolean).join(' ')}>
      <Cursor>
        <Outlet />
        {isIslandMode ?
          <IslandFloatingMenu
            userName={userName}
            musicEnabled={musicEnabled}
            onAboutClick={openAboutPage}
            onMusicClick={() => {
              if (musicAvailable) {
                setMusicEnabled((current) => !current)
              }
            }}
            onLoginClick={() => setLoginOpen(true)}
            onAdminClick={openAdminPage}
          />
        : null}
        <IslandFloatingSwitch
          checked={isIslandMode}
          uncheckedLabel="小憩中"
          checkedLabel={userName ? '已登岛' : '营业中'}
          unCheckedChildren="OFF"
          checkedChildren="ON"
          onChange={handleIslandModeChange}
        />
        <IslandMusicPlayer
          tracks={musicConfig.tracks}
          open={musicEnabled && musicAvailable}
          onClose={() => setMusicEnabled(false)}
        />
        <IslandLoginModal open={loginOpen} onOpenChange={setLoginOpen} onLogin={handleLogin} />
        <IslandToastViewport />
      </Cursor>
    </section>
  )
}
