import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import { emitIslandToast } from '@/components/island'
import { defaultAboutContent } from '@/data/about-content'
import type { GalleryPost } from '@/data/gallery'
import { defaultSiteProfile } from '@/data/site-profile'
import { createGalleryPost, deleteGalleryPost, fetchAboutContent, fetchAdminProfile, fetchGalleryPosts, fetchMusicConfig, fetchSiteProfile, saveMusicConfig, updateAboutContent, updateAdminAccount, updateGalleryPost, updateSiteProfile } from '@/lib/posts-api'
import type { AdminProfile, MusicTrack } from '@/lib/posts-api'

import { createEmptyForm, formToPost, getErrorMessage, postToForm } from './post-form'
import type { AboutContentForm, AdminAccountForm, AdminSection, AdminStatus, MusicForm, PostForm, SiteProfileForm } from './types'

export function useAdminDashboard() {
  const [token, setToken] = useState(() => localStorage.getItem('island-admin-token') ?? '')
  const [activeSection, setActiveSection] = useState<AdminSection>('posts')
  const [posts, setPosts] = useState<GalleryPost[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<PostForm>(() => createEmptyForm())
  const [musicForm, setMusicForm] = useState<MusicForm>(() => ({
    sourceType: 'song',
    musicId: '473403185',
    enabled: true,
  }))
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([])
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [accountForm, setAccountForm] = useState<AdminAccountForm>(() => ({
    account: localStorage.getItem('island-user-name') ?? 'mewbarkjoy',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }))
  const [siteProfileForm, setSiteProfileForm] = useState<SiteProfileForm>(defaultSiteProfile)
  const [aboutContentForm, setAboutContentForm] = useState<AboutContentForm>(defaultAboutContent)
  const [status, setStatus] = useState<AdminStatus>(null)
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<GalleryPost | null>(null)

  const isLoggedIn = Boolean(token)
  const selectedPost = useMemo(() => posts.find((post) => post.id === selectedId) ?? null, [posts, selectedId])
  const pinnedCount = useMemo(() => posts.filter((post) => post.pinned).length, [posts])

  function showStatus(nextStatus: Exclude<AdminStatus, null>) {
    setStatus(nextStatus)
    emitIslandToast({
      type: nextStatus.type,
      title: nextStatus.text,
    })
  }

  async function loadPosts() {
    setLoadingPosts(true)

    try {
      const nextPosts = await fetchGalleryPosts()

      setPosts(nextPosts)

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

  async function loadMusic() {
    try {
      const music = await fetchMusicConfig()

      setMusicForm({
        sourceType: music.sourceType,
        musicId: music.musicId,
        enabled: music.enabled,
      })
      setMusicTracks(music.tracks)
    } catch {
      // 后端未启动或音乐配置不存在时，保留默认配置。
    }
  }

  async function loadSiteProfile() {
    try {
      setSiteProfileForm(await fetchSiteProfile())
    } catch {
      setSiteProfileForm(defaultSiteProfile)
    }
  }

  async function loadAboutContent() {
    try {
      setAboutContentForm(await fetchAboutContent())
    } catch {
      setAboutContentForm(defaultAboutContent)
    }
  }

  async function loadAdminProfile(nextToken = token) {
    if (!nextToken) {
      setAdminProfile(null)
      return
    }

    try {
      const profile = await fetchAdminProfile(nextToken)

      setAdminProfile(profile)
      setAccountForm((current) => ({
        ...current,
        account: profile.account,
      }))
      localStorage.setItem('island-user-name', profile.account)
      window.dispatchEvent(new Event('island-admin-auth-change'))
    } catch {
      // token 失效时由具体接口返回错误提示，这里只保持当前页面可用。
    }
  }

  useEffect(() => {
    void loadPosts()
    void loadMusic()
    void loadSiteProfile()
    void loadAboutContent()
  }, [])

  useEffect(() => {
    function syncAdminToken() {
      setToken(localStorage.getItem('island-admin-token') ?? '')
    }

    window.addEventListener('island-admin-auth-change', syncAdminToken)
    window.addEventListener('storage', syncAdminToken)

    return () => {
      window.removeEventListener('island-admin-auth-change', syncAdminToken)
      window.removeEventListener('storage', syncAdminToken)
    }
  }, [])

  useEffect(() => {
    void loadAdminProfile(token)
  }, [token])

  function openLoginModal() {
    window.dispatchEvent(new Event('island-open-login'))
  }

  function handleLogout() {
    localStorage.removeItem('island-admin-token')
    localStorage.removeItem('island-user-name')
    window.dispatchEvent(new Event('island-admin-auth-change'))
    setToken('')
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

  function handleNewPost() {
    setActiveSection('posts')
    setSelectedId(null)
    setForm(createEmptyForm())
    showStatus({ type: 'info', text: '正在创建一篇新文章。' })
  }

  function handleSelectPost(post: GalleryPost) {
    setSelectedId(post.id)
    setForm(postToForm(post))
    setStatus(null)
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload = formToPost(form)

    if (!payload.title || !payload.imageSrc) {
      showStatus({ type: 'error', text: '标题和封面图片是必填项。' })
      return
    }

    setSaving(true)

    try {
      const savedPost = selectedPost ? await updateGalleryPost(token, selectedPost.id, payload) : await createGalleryPost(token, payload)

      setPosts((current) => {
        if (selectedPost) {
          return current.map((post) => (post.id === selectedPost.id ? savedPost : post))
        }

        return [savedPost, ...current]
      })
      setSelectedId(savedPost.id)
      setForm(postToForm(savedPost))
      showStatus({ type: 'success', text: selectedPost ? '文章已更新。' : '新文章已发布。' })
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
      await deleteGalleryPost(token, deleteTarget.id)
      setPosts((current) => current.filter((post) => post.id !== deleteTarget.id))

      if (selectedId === deleteTarget.id) {
        setSelectedId(null)
        setForm(createEmptyForm())
      }

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
      setMusicTracks(music.tracks)
      showStatus({
        type: 'success',
        text: music.sourceType === 'playlist' ? `歌单已保存，共 ${music.tracks.length} 首。` : '歌曲已保存。',
      })
    } catch (error) {
      showStatus({ type: 'error', text: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAdminAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const account = accountForm.account.trim()
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
        account: profile.account,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      localStorage.setItem('island-user-name', profile.account)
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
    aboutContentForm,
    deleteTarget,
    form,
    isLoggedIn,
    loadingPosts,
    musicForm,
    musicTracks,
    pinnedCount,
    posts,
    saving,
    selectedId,
    selectedPost,
    siteProfileForm,
    status,
    handleConfirmDelete,
    handleLogout,
    handleNewPost,
    handleSave,
    handleSaveAboutContent,
    handleSaveAdminAccount,
    handleSaveSiteProfile,
    handleSaveMusic,
    handleSelectPost,
    loadPosts,
    openLoginModal,
    setActiveSection,
    setAccountForm,
    setAboutContentForm,
    setDeleteTarget,
    setForm,
    setMusicForm,
    setMusicTracks,
    setSiteProfileForm,
  }
}
