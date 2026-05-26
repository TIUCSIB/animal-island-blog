import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { emitIslandToast } from '@/components/island'
import { defaultAboutContent } from '@/data/about-content'
import type { GalleryPost } from '@/data/gallery'
import { defaultSiteProfile } from '@/data/site-profile'
import {
  createGalleryPost,
  clearAdminSession,
  deleteGalleryPost,
  ensureAdminAccessToken,
  fetchAboutContent,
  fetchAdminProfile,
  fetchApiHealth,
  fetchGalleryPostsPage,
  fetchMusicConfig,
  fetchSiteProfile,
  getStoredAdminAccessToken,
  getStoredAdminRefreshToken,
  saveMusicConfig,
  updateAboutContent,
  updateAdminAccount,
  updateGalleryPost,
  updateSiteProfile,
} from '@/lib/posts-api'
import type { AdminProfile, MusicConfig } from '@/lib/posts-api'
import { queryKeys } from '@/lib/query-client'
import { normalizeIslandAccount, toAccountInputValue } from '@/lib/account'
import { useAdminDashboardStore } from '@/stores/admin-dashboard-store'

import { createEmptyForm, formToPost, getErrorMessage, postToForm } from './posts/post-form'
import type { AboutContentForm, AdminAccountForm, AdminSection, AdminStatus, MusicForm, PostForm, SiteProfileForm, SystemCheckItem } from './types'

type MusicSnapshot = Pick<MusicConfig, 'enabled' | 'platform' | 'sourceType' | 'musicId'>

const defaultMusicSnapshot: MusicSnapshot = {
  enabled: true,
  platform: 'netease',
  sourceType: 'song',
  musicId: '473403185',
}

const ADMIN_POST_PAGE_SIZE = 5
const defaultPostsPagination = {
  page: 1,
  pageSize: ADMIN_POST_PAGE_SIZE,
  total: 0,
  totalPages: 1,
}

const loadingSiteProfile: SiteProfileForm = {
  ...defaultSiteProfile,
  avatarUrl: '',
  badgeEnabled: false,
  avatarStatus: '',
}

export function useAdminDashboard() {
  const queryClient = useQueryClient()
  const musicSnapshotRef = useRef<MusicSnapshot>(defaultMusicSnapshot)
  const [token, setToken] = useState(() => getStoredAdminAccessToken())
  const [hasRefreshToken, setHasRefreshToken] = useState(() => Boolean(getStoredAdminRefreshToken()))
  const cachedAdminProfile = token ? queryClient.getQueryData<AdminProfile>(queryKeys.adminProfile(token)) : null
  const cachedSiteProfile = queryClient.getQueryData<SiteProfileForm>(queryKeys.siteProfile)
  const activeSection = useAdminDashboardStore((state) => state.activeSection)
  const setActiveSection = useAdminDashboardStore((state) => state.setActiveSection)
  const selectedId = useAdminDashboardStore((state) => state.selectedId)
  const setSelectedId = useAdminDashboardStore((state) => state.setSelectedId)
  const [posts, setPosts] = useState<GalleryPost[]>([])
  const [postsPagination, setPostsPagination] = useState(() => defaultPostsPagination)
  const [pinnedCount, setPinnedCount] = useState(0)
  const [form, setForm] = useState<PostForm>(() => createEmptyForm())
  const [musicForm, setMusicForm] = useState<MusicForm>(() => ({
    sourceType: 'song',
    musicId: '473403185',
    enabled: true,
  }))
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(() => cachedAdminProfile ?? null)
  const [authChecking, setAuthChecking] = useState(() => Boolean(token && !cachedAdminProfile))
  const [accountForm, setAccountForm] = useState<AdminAccountForm>(() => ({
    account: cachedAdminProfile ? toAccountInputValue(cachedAdminProfile.account) : 'admin',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }))
  const [siteProfileForm, setSiteProfileForm] = useState<SiteProfileForm>(() => cachedSiteProfile ?? loadingSiteProfile)
  const [aboutContentForm, setAboutContentForm] = useState<AboutContentForm>(defaultAboutContent)
  const [status, setStatus] = useState<AdminStatus>(null)
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [checkingSystem, setCheckingSystem] = useState(false)
  const [systemChecks, setSystemChecks] = useState<SystemCheckItem[]>([])
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<GalleryPost | null>(null)

  const isLoggedIn = Boolean((token || hasRefreshToken) && adminProfile)
  const isRestoringSession = Boolean(hasRefreshToken && !adminProfile)
  const safePostsPagination = postsPagination ?? defaultPostsPagination
  const selectedPost = useMemo(() => posts.find((post) => post.id === selectedId) ?? null, [posts, selectedId])

  function showStatus(nextStatus: Exclude<AdminStatus, null>) {
    setStatus(nextStatus)
    emitIslandToast({
      type: nextStatus.type,
      title: nextStatus.text,
    })
  }

  async function loadPosts(page = safePostsPagination.page) {
    setLoadingPosts(true)

    try {
      const result = await fetchGalleryPostsPage(page, ADMIN_POST_PAGE_SIZE)
      const nextPosts = result.posts

      setPosts(nextPosts)
      setPostsPagination(result.pagination)
      setPinnedCount(result.stats?.pinnedCount ?? 0)

      if (selectedId && !nextPosts.some((post) => post.id === selectedId)) {
        setSelectedId(null)
        setForm(createEmptyForm())
      }
    } catch (error) {
      showStatus({ type: 'error', text: getErrorMessage(error) })
    } finally {
      setLoadingPosts(false)
    }
  }

  async function handleSystemCheck() {
    setCheckingSystem(true)

    const [healthResult, postsResult, profileResult, musicResult, authResult] = await Promise.allSettled([
      fetchApiHealth(),
      fetchGalleryPostsPage(1, ADMIN_POST_PAGE_SIZE),
      fetchSiteProfile(),
      fetchMusicConfig(),
      token ? fetchAdminProfile(token) : Promise.resolve(null),
    ])

    const nextChecks: SystemCheckItem[] = []

    if (healthResult.status === 'fulfilled' && healthResult.value.ok) {
      nextChecks.push({
        id: 'api',
        label: 'API 心跳',
        value: '正常',
        status: 'success',
        detail: '/api/health 已响应。',
      })
    } else {
      nextChecks.push({
        id: 'api',
        label: 'API 心跳',
        value: '异常',
        status: 'error',
        detail: healthResult.status === 'rejected' ? getErrorMessage(healthResult.reason) : '接口没有返回 ok。',
      })
    }

    if (postsResult.status === 'fulfilled') {
      setPosts(postsResult.value.posts)
      setPostsPagination(postsResult.value.pagination)
      setPinnedCount(postsResult.value.stats?.pinnedCount ?? 0)
      nextChecks.push({
        id: 'posts',
        label: '文章数据',
        value: `${postsResult.value.pagination.total} 条`,
        status: 'success',
        detail: '文章接口和数据库读取正常。',
      })
    } else {
      nextChecks.push({
        id: 'posts',
        label: '文章数据',
        value: '读取失败',
        status: 'error',
        detail: getErrorMessage(postsResult.reason),
      })
    }

    if (profileResult.status === 'fulfilled') {
      queryClient.setQueryData(queryKeys.siteProfile, profileResult.value)
      nextChecks.push({
        id: 'profile',
        label: '站点资料',
        value: profileResult.value.nickname || '已读取',
        status: 'success',
        detail: '头像、昵称、签名配置读取正常。',
      })
    } else {
      nextChecks.push({
        id: 'profile',
        label: '站点资料',
        value: '读取失败',
        status: 'error',
        detail: getErrorMessage(profileResult.reason),
      })
    }

    if (musicResult.status === 'fulfilled') {
      queryClient.setQueryData(queryKeys.musicConfig, musicResult.value)
      nextChecks.push({
        id: 'music',
        label: '音乐配置',
        value: musicResult.value.enabled ? `已开启 · ${musicResult.value.tracks.length} 首` : `已关闭 · ${musicResult.value.tracks.length} 首`,
        status: musicResult.value.tracks.length > 0 ? 'success' : 'info',
        detail: `${musicResult.value.sourceType === 'playlist' ? '歌单' : '歌曲'} ID：${musicResult.value.musicId}`,
      })
    } else {
      nextChecks.push({
        id: 'music',
        label: '音乐配置',
        value: '读取失败',
        status: 'error',
        detail: getErrorMessage(musicResult.reason),
      })
    }

    if (!token) {
      nextChecks.push({
        id: 'auth',
        label: '登录状态',
        value: '未登录',
        status: 'info',
        detail: '当前没有后台登录 token。',
      })
    } else if (authResult.status === 'fulfilled' && authResult.value) {
      setAdminProfile(authResult.value)
      queryClient.setQueryData(queryKeys.adminProfile(token), authResult.value)
      setAccountForm((current) => ({
        ...current,
          account: authResult.value ? toAccountInputValue(authResult.value.account) : current.account,
      }))
      nextChecks.push({
        id: 'auth',
        label: '登录状态',
        value: '有效',
        status: 'success',
        detail: `当前账号：${authResult.value.account}`,
      })
    } else {
      nextChecks.push({
        id: 'auth',
        label: '登录状态',
        value: '可能失效',
        status: 'error',
        detail: authResult.status === 'rejected' ? getErrorMessage(authResult.reason) : '无法读取当前账号信息。',
      })
    }

    setSystemChecks(nextChecks)
    setCheckingSystem(false)

    const errorCount = nextChecks.filter((item) => item.status === 'error').length

    showStatus({
      type: errorCount > 0 ? 'error' : 'success',
      text: errorCount > 0 ? `系统检查完成，发现 ${errorCount} 项异常。` : '系统检查完成，所有项目正常。',
    })
  }

  useEffect(() => {
    let cancelled = false

    async function loadInitialData() {
      const [postsResult, musicResult, siteProfileResult, aboutContentResult] = await Promise.allSettled([fetchGalleryPostsPage(1, ADMIN_POST_PAGE_SIZE), fetchMusicConfig(), fetchSiteProfile(), fetchAboutContent()])

      if (cancelled) return

      if (postsResult.status === 'fulfilled') {
        setPosts(postsResult.value.posts)
        setPostsPagination(postsResult.value.pagination)
        setPinnedCount(postsResult.value.stats?.pinnedCount ?? 0)
      } else {
        const text = getErrorMessage(postsResult.reason)

        setStatus({ type: 'error', text })
        emitIslandToast({ type: 'error', title: text })
      }

      if (musicResult.status === 'fulfilled') {
        const music = musicResult.value

        setMusicForm({
          sourceType: music.sourceType,
          musicId: music.musicId,
          enabled: music.enabled,
        })
        musicSnapshotRef.current = {
          enabled: music.enabled,
          platform: music.platform,
          sourceType: music.sourceType,
          musicId: music.musicId,
        }
        queryClient.setQueryData(queryKeys.musicConfig, music)
      }

      if (siteProfileResult.status === 'fulfilled') {
        setSiteProfileForm(siteProfileResult.value)
        queryClient.setQueryData(queryKeys.siteProfile, siteProfileResult.value)
      } else {
        setSiteProfileForm(loadingSiteProfile)
      }

      if (aboutContentResult.status === 'fulfilled') {
        setAboutContentForm(aboutContentResult.value)
        queryClient.setQueryData(queryKeys.aboutContent, aboutContentResult.value)
      } else {
        setAboutContentForm(defaultAboutContent)
      }
    }

    void loadInitialData()

    return () => {
      cancelled = true
    }
  }, [queryClient])

  useEffect(() => {
    function syncAdminToken() {
      const nextToken = getStoredAdminAccessToken()
      const nextHasRefreshToken = Boolean(getStoredAdminRefreshToken())
      const cachedProfile = nextToken ? queryClient.getQueryData<AdminProfile>(queryKeys.adminProfile(nextToken)) : null

      setToken(nextToken)
      setHasRefreshToken(nextHasRefreshToken)

      if (cachedProfile) {
        setAdminProfile(cachedProfile)
      }

      setAuthChecking(Boolean((nextToken && !cachedProfile) || (!nextToken && nextHasRefreshToken)))

      if (cachedProfile) {
        setAccountForm((current) => ({
          ...current,
          account: toAccountInputValue(cachedProfile.account),
        }))
      }

      if (!nextToken && !nextHasRefreshToken) {
        setAdminProfile(null)
        setAuthChecking(false)
      }
    }

    window.addEventListener('island-admin-auth-change', syncAdminToken)
    window.addEventListener('storage', syncAdminToken)

    return () => {
      window.removeEventListener('island-admin-auth-change', syncAdminToken)
      window.removeEventListener('storage', syncAdminToken)
    }
  }, [queryClient])

  useEffect(() => {
    if (!token) {
      if (!getStoredAdminRefreshToken()) {
        setAuthChecking(false)
        setAdminProfile(null)
        return
      }

      let cancelled = false

      async function restoreAccessToken() {
        setAuthChecking(true)

        try {
          const nextToken = await ensureAdminAccessToken('')

          if (cancelled) return

          setToken(nextToken)
        } catch (error) {
          if (cancelled) return

          queryClient.removeQueries({ queryKey: queryKeys.adminProfileRoot })
          setToken('')
          setAdminProfile(null)
          setAuthChecking(false)
          showStatus({ type: 'error', text: getErrorMessage(error) })
        }
      }

      void restoreAccessToken()

      return () => {
        cancelled = true
      }
    }

    const cachedProfile = queryClient.getQueryData<AdminProfile>(queryKeys.adminProfile(token))

    if (cachedProfile) {
      setAdminProfile(cachedProfile)
      setAccountForm((current) => ({
        ...current,
        account: toAccountInputValue(cachedProfile.account),
      }))
    } else {
      setAdminProfile(null)
      setAuthChecking(true)
    }

    let cancelled = false

    async function syncAdminProfile() {
      try {
        const profile = await fetchAdminProfile(token)

        if (cancelled) return

        setAdminProfile(profile)
        setAccountForm((current) => ({
          ...current,
          account: toAccountInputValue(profile.account),
        }))
        queryClient.setQueryData(queryKeys.adminProfile(token), profile)
        setAuthChecking(false)
        window.dispatchEvent(new Event('island-admin-auth-change'))
      } catch (error) {
        if (cancelled) return

        clearAdminSession()
        queryClient.removeQueries({ queryKey: queryKeys.adminProfileRoot })
        setToken('')
        setHasRefreshToken(false)
        setAdminProfile(null)
        setAuthChecking(false)
        showStatus({ type: 'error', text: getErrorMessage(error) })
      }
    }

    void syncAdminProfile()

    return () => {
      cancelled = true
    }
  }, [queryClient, token])

  function openLoginModal() {
    window.dispatchEvent(new Event('island-open-login'))
  }

  function handleLogout() {
    clearAdminSession()
    queryClient.removeQueries({ queryKey: queryKeys.adminProfileRoot })
    setToken('')
    setHasRefreshToken(false)
    setAdminProfile(null)
    setAccountForm((current) => ({
      ...current,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }))
    setSelectedId(null)
    setForm(createEmptyForm())
    showStatus({ type: 'info', text: '已退出后台。' })
  }

  function handleSectionChange(section: AdminSection) {
    setActiveSection(section)

    if (section === 'write') {
      setSelectedId(null)
      setForm(createEmptyForm())
      setStatus(null)
    }
  }

  function handleNewPost() {
    handleSectionChange('write')
    showStatus({ type: 'info', text: '正在创建一篇新文章。' })
  }

  function handleSelectPost(post: GalleryPost) {
    setSelectedId(post.id)
    setForm(postToForm(post))
    setStatus(null)
  }

  function handleClosePostEditor() {
    setSelectedId(null)
    setForm(createEmptyForm())
    setStatus(null)
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const isCreating = activeSection === 'write'

    if (!isCreating && !selectedPost) {
      showStatus({ type: 'error', text: '请先选择一篇文章。' })
      return
    }

    const payload = formToPost(form)

    if (!payload.title || !payload.imageSrc) {
      showStatus({ type: 'error', text: '标题和至少 1 张图片是必填项。' })
      return
    }

    setSaving(true)

    try {
      const savedPost = isCreating ? await createGalleryPost(token, payload) : await updateGalleryPost(token, selectedPost!.id, payload)

      if (isCreating) {
        setSelectedId(null)
        setForm(createEmptyForm())
        await loadPosts(1)
      } else {
        setSelectedId(savedPost.id)
        setForm(postToForm(savedPost))
        await loadPosts(safePostsPagination.page)
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.galleryPosts })
      showStatus({ type: 'success', text: isCreating ? '新文章已发布，可在文章管理中继续编辑。' : '文章已更新。' })
    } catch (error) {
      showStatus({ type: 'error', text: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return

    setSaving(true)

    try {
      const nextPage = posts.length <= 1 && safePostsPagination.page > 1 ? safePostsPagination.page - 1 : safePostsPagination.page

      await deleteGalleryPost(token, deleteTarget.id)

      if (selectedId === deleteTarget.id) {
        setSelectedId(null)
        setForm(createEmptyForm())
      }

      await loadPosts(nextPage)
      await queryClient.invalidateQueries({ queryKey: queryKeys.galleryPosts })
      setDeleteTarget(null)
      showStatus({ type: 'success', text: '文章已删除。' })
    } catch (error) {
      showStatus({ type: 'error', text: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveMusic() {
    setSaving(true)

    try {
      const previousSnapshot = musicSnapshotRef.current
      const music = await saveMusicConfig(token, {
        platform: 'netease',
        sourceType: musicForm.sourceType,
        musicId: musicForm.musicId,
        enabled: musicForm.enabled,
      })

      setMusicForm({
        sourceType: music.sourceType,
        musicId: music.musicId,
        enabled: music.enabled,
      })
      musicSnapshotRef.current = {
        enabled: music.enabled,
        platform: music.platform,
        sourceType: music.sourceType,
        musicId: music.musicId,
      }
      queryClient.setQueryData(queryKeys.musicConfig, music)
      const enabledChanged = previousSnapshot.enabled !== music.enabled
      const sourceChanged = previousSnapshot.sourceType !== music.sourceType || previousSnapshot.musicId !== music.musicId
      const message =
        enabledChanged ?
          music.enabled ?
            '音乐入口已开启。'
          : '音乐入口已关闭。'
        : sourceChanged && music.sourceType === 'playlist' ? `歌单已保存，共 ${music.tracks.length} 首。`
        : sourceChanged ? '歌曲已保存。'
        : music.sourceType === 'playlist' ? `歌单已保存，共 ${music.tracks.length} 首。`
        : '歌曲已保存。'

      showStatus({
        type: 'success',
        text: message,
      })
    } catch (error) {
      showStatus({ type: 'error', text: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAdminAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const account = normalizeIslandAccount(accountForm.account)
    const currentPassword = accountForm.currentPassword.trim()
    const newPassword = accountForm.newPassword.trim()
    const confirmPassword = accountForm.confirmPassword.trim()

    if (!account) {
      showStatus({ type: 'error', text: '请填写账号或邮箱。' })
      return
    }

    if (!currentPassword) {
      showStatus({ type: 'error', text: '请填写当前密码。' })
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      showStatus({ type: 'error', text: '两次输入的新密码不一致。' })
      return
    }

    setSaving(true)

    try {
      const profile = await updateAdminAccount(token, {
        account,
        currentPassword,
        newPassword: newPassword || undefined,
      })

      setAdminProfile(profile)
      setAccountForm({
        account: toAccountInputValue(profile.account),
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      queryClient.setQueryData(queryKeys.adminProfile(token), profile)
      window.dispatchEvent(new Event('island-admin-auth-change'))
      showStatus({ type: 'success', text: '账号信息已更新。' })
    } catch (error) {
      showStatus({ type: 'error', text: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveSiteProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nickname = siteProfileForm.nickname.trim()
    const handle = siteProfileForm.handle.trim()
    const avatarUrl = siteProfileForm.avatarUrl.trim()

    if (!nickname || !handle || !avatarUrl) {
      showStatus({ type: 'error', text: '请填写头像、昵称和账号。' })
      return
    }

    setSaving(true)

    try {
      const profile = await updateSiteProfile(token, {
        avatarUrl,
        badgeEnabled: siteProfileForm.badgeEnabled,
        badge: siteProfileForm.badge.trim() || '♥',
        avatarStatus: siteProfileForm.avatarStatus,
        nickname,
        handle,
        bio: siteProfileForm.bio.trim() || defaultSiteProfile.bio,
      })

      setSiteProfileForm(profile)
      queryClient.setQueryData(queryKeys.siteProfile, profile)
      showStatus({ type: 'success', text: '主页个人资料已更新。' })
    } catch (error) {
      showStatus({ type: 'error', text: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAboutContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setSaving(true)

    try {
      const about = await updateAboutContent(token, {
        intro: aboutContentForm.intro.trim() || defaultAboutContent.intro,
        projectQuestion: aboutContentForm.projectQuestion.trim() || defaultAboutContent.projectQuestion,
        projectSummary: aboutContentForm.collapseItems.find((item) => item.content.trim())?.content.trim() || defaultAboutContent.projectSummary,
        contacts: aboutContentForm.contacts.map((contact, index) => ({
          ...contact,
          label: contact.label.trim(),
          value: contact.value.trim(),
          href: contact.href.trim(),
          sortOrder: index,
        })),
        collapseItems: aboutContentForm.collapseItems.map((item, index) => ({
          ...item,
          question: item.question.trim(),
          content: item.content.trim(),
          sortOrder: index,
        })),
      })

      setAboutContentForm(about)
      queryClient.setQueryData(queryKeys.aboutContent, about)
      showStatus({ type: 'success', text: '关于页面已更新。' })
    } catch (error) {
      showStatus({ type: 'error', text: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  return {
    accountForm,
    activeSection,
    adminProfile,
    authChecking,
    aboutContentForm,
    deleteTarget,
    form,
    isLoggedIn,
    isRestoringSession,
    checkingSystem,
    loadingPosts,
    musicForm,
    pinnedCount,
    postPage: safePostsPagination.page,
    postPageSize: safePostsPagination.pageSize,
    postsTotal: safePostsPagination.total,
    postTotalPages: safePostsPagination.totalPages,
    posts,
    saving,
    selectedId,
    selectedPost,
    siteProfileForm,
    status,
    systemChecks,
    token,
    handleConfirmDelete,
    handleSectionChange,
    handleLogout,
    handleNewPost,
    handleSave,
    handleSaveAboutContent,
    handleSaveAdminAccount,
    handleSaveSiteProfile,
    handleSaveMusic,
    handleSelectPost,
    handleClosePostEditor,
    handleSystemCheck,
    loadPosts,
    openLoginModal,
    setActiveSection,
    setAccountForm,
    setAboutContentForm,
    setDeleteTarget,
    setForm,
    setMusicForm,
    setSiteProfileForm,
  }
}
