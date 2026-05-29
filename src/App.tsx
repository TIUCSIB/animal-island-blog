import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useOutlet } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Cursor } from 'animal-island-ui'
import { emitIslandToast, IslandFloatingMenu, IslandFloatingSwitch, IslandLoginModal, IslandMusicPlayer, IslandToastViewport } from '@/components/island'
import { clearAdminSession, ensureAdminAccessToken, getStoredAdminAccessToken, getStoredAdminRefreshToken, loginAdmin, storeAdminSession } from '@/lib/posts-api'
import type { AdminProfile, MusicConfig } from '@/lib/posts-api'
import { queryKeys } from '@/lib/query-client'
import { useAdminProfileQuery, useMusicConfigQuery } from '@/lib/query-hooks'

const ISLAND_MODE_STORAGE_KEY = 'island-mode-enabled'
const ISLAND_OPEN_LOGIN_EVENT = 'island-open-login'

const defaultMusicConfig: MusicConfig = {
  enabled: true,
  platform: 'netease',
  sourceType: 'song',
  musicId: '473403185',
  tracks: [],
}

function readStoredBoolean(key: string) {
  return localStorage.getItem(key) === 'true'
}

function readStoredAdminToken() {
  return getStoredAdminAccessToken()
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const outlet = useOutlet()
  const queryClient = useQueryClient()
  const [isIslandMode, setIsIslandMode] = useState(() => readStoredBoolean(ISLAND_MODE_STORAGE_KEY))
  const [loginOpen, setLoginOpen] = useState(false)
  const [musicEnabled, setMusicEnabled] = useState(false)
  const [adminToken, setAdminToken] = useState(() => readStoredAdminToken())
  const adminProfileQuery = useAdminProfileQuery(adminToken)
  const musicConfigQuery = useMusicConfigQuery()
  const adminUserName = adminProfileQuery.data?.account ?? null
  const isAdminSignedIn = Boolean(adminToken && adminProfileQuery.isSuccess && adminProfileQuery.data)
  const musicConfig = musicConfigQuery.data ?? defaultMusicConfig
  const musicAvailable = !musicConfigQuery.isPending && musicConfig.enabled && musicConfig.tracks.length > 0
  const visibleMusicEnabled = musicEnabled && musicAvailable
  const isPostDetailPage = location.pathname.startsWith('/posts/')
  const postRouteState = location.state as { from?: string, intercepted?: boolean } | null
  const shouldKeepBackgroundOutlet = isPostDetailPage && postRouteState?.intercepted === false && Boolean(postRouteState?.from)
  const [cachedOutlet, setCachedOutlet] = useState(outlet)

  useEffect(() => {
    function syncAdminAuth() {
      setAdminToken(readStoredAdminToken())
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
    if (adminToken || !getStoredAdminRefreshToken()) return

    let cancelled = false

    async function restoreAccessToken() {
      try {
        const nextToken = await ensureAdminAccessToken('')

        if (cancelled) return

        setAdminToken(nextToken)
      } catch {
        if (cancelled) return

        queryClient.removeQueries({ queryKey: queryKeys.adminProfileRoot })
        setAdminToken('')
      }
    }

    void restoreAccessToken()

    return () => {
      cancelled = true
    }
  }, [adminToken, queryClient])

  useEffect(() => {
    if (isPostDetailPage) return

    setCachedOutlet(outlet)
  }, [isPostDetailPage, outlet])

  useEffect(() => {
    if (!adminToken || !adminProfileQuery.isError) return

    clearAdminSession()
    queryClient.removeQueries({ queryKey: queryKeys.adminProfileRoot })
    setAdminToken('')
  }, [adminProfileQuery.isError, adminToken, queryClient])

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

  async function handleLogin(userNameValue: string, password: string, turnstileToken?: string) {
    const session = await loginAdmin(userNameValue, password, turnstileToken)
    const token = session.accessToken
    const { profile } = session
    const nextProfile: AdminProfile = profile ?? {
      account: userNameValue.trim() || 'mewbarkjoy',
      initialized: false,
    }

    storeAdminSession(session)
    queryClient.setQueryData(queryKeys.adminProfile(token), nextProfile)
    setAdminToken(token)
    emitIslandToast({
      type: 'success',
      title: '登录成功',
      description: '正在进入后台',
    })
    navigate('/admin')
  }

  return (
    <section className={['island-app', isIslandMode && 'island-app--island-mode', isIslandMode && 'island-app--footer-animated', visibleMusicEnabled && 'island-app--music-on'].filter(Boolean).join(' ')}>
      <Cursor>
        {shouldKeepBackgroundOutlet && cachedOutlet ? cachedOutlet : outlet}
        {shouldKeepBackgroundOutlet ?
          <div className="fixed inset-0 z-[70] overflow-y-auto">
            {outlet}
          </div>
        : null}
        {isIslandMode && !isPostDetailPage ?
          <IslandFloatingMenu
            signedIn={isAdminSignedIn}
            userName={adminUserName}
            musicAvailable={musicAvailable}
            musicEnabled={visibleMusicEnabled}
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
        {!isPostDetailPage ?
          <>
            <IslandFloatingSwitch
              checked={isIslandMode}
              uncheckedLabel="小憩中"
              checkedLabel={isAdminSignedIn ? '已登岛' : '营业中'}
              unCheckedChildren="OFF"
              checkedChildren="ON"
              onChange={handleIslandModeChange}
            />
            <IslandMusicPlayer
              tracks={musicConfig.tracks}
              open={visibleMusicEnabled}
              onClose={() => setMusicEnabled(false)}
            />
            <IslandLoginModal open={loginOpen} onOpenChange={setLoginOpen} onLogin={handleLogin} />
          </>
        : null}
        <IslandToastViewport />
      </Cursor>
    </section>
  )
}
