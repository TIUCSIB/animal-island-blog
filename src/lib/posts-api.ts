import type { GalleryPost } from '@/data/gallery'
import { defaultAboutContent } from '@/data/about-content'
import type { AboutContent } from '@/data/about-content'
import { defaultSiteProfile } from '@/data/site-profile'
import type { SiteProfile } from '@/data/site-profile'

export type { AboutCollapseItem, AboutContent, ContactIconName, ContactLink } from '@/data/about-content'
export type { SiteProfile } from '@/data/site-profile'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

type ApiRequestInit = RequestInit & {
  token?: string
}

type PostsResponse = {
  posts: GalleryPost[]
}

type LoginResponse = {
  token: string
  profile?: AdminProfile
}

function normalizeSiteProfile(profile: Partial<SiteProfile>): SiteProfile {
  const avatarStatus = profile.avatarStatus === 'online' || profile.avatarStatus === 'away' || profile.avatarStatus === 'busy' ? profile.avatarStatus : ''

  return {
    ...defaultSiteProfile,
    ...profile,
    badgeEnabled: profile.badgeEnabled ?? defaultSiteProfile.badgeEnabled,
    avatarStatus,
  }
}

function normalizeAboutContent(about: Partial<AboutContent>): AboutContent {
  return {
    ...defaultAboutContent,
    ...about,
    contacts: Array.isArray(about.contacts) ? about.contacts : defaultAboutContent.contacts,
    collapseItems: Array.isArray(about.collapseItems) ? about.collapseItems : defaultAboutContent.collapseItems,
  }
}

export type MusicSourceType = 'song' | 'playlist'

export type MusicTrack = {
  title: string
  author: string
  pic: string
  url: string
  lrc?: string
}

export type MusicConfig = {
  enabled: boolean
  platform: 'netease'
  sourceType: MusicSourceType
  musicId: string
  tracks: MusicTrack[]
  updatedAt?: string
}

export type AdminProfile = {
  account: string
  initialized: boolean
  updatedAt?: string
}

export type AdminAccountInput = {
  account: string
  currentPassword: string
  newPassword?: string
}

async function requestJson<T>(path: string, init: ApiRequestInit = {}) {
  const headers = new Headers(init.headers)

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (init.token) {
    headers.set('Authorization', `Bearer ${init.token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    if (response.status === 404 && path.startsWith('/api/music')) {
      throw new Error('音乐配置接口不存在，请重启后端：npm run dev:api')
    }

    const message = typeof data?.message === 'string' ? data.message : '请求失败'
    throw new Error(message)
  }

  return data as T
}

export async function fetchGalleryPosts(signal?: AbortSignal) {
  const data = await requestJson<PostsResponse>('/api/posts', { signal })

  return data.posts
}

export async function fetchSiteProfile(signal?: AbortSignal) {
  const data = await requestJson<{ profile: SiteProfile }>('/api/profile', { signal })

  return normalizeSiteProfile(data.profile)
}

export async function fetchAboutContent(signal?: AbortSignal) {
  const data = await requestJson<{ about: AboutContent }>('/api/about', { signal })

  return normalizeAboutContent(data.about)
}

export async function updateSiteProfile(token: string, profile: SiteProfile) {
  const data = await requestJson<{ profile: SiteProfile }>('/api/profile', {
    method: 'PUT',
    token,
    body: JSON.stringify(profile),
  })

  return normalizeSiteProfile(data.profile)
}

export async function updateAboutContent(token: string, about: AboutContent) {
  const data = await requestJson<{ about: AboutContent }>('/api/about', {
    method: 'PUT',
    token,
    body: JSON.stringify(about),
  })

  return normalizeAboutContent(data.about)
}

export async function loginAdmin(account: string, password: string) {
  const data = await requestJson<LoginResponse>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ account, password }),
  })

  return data
}

export async function fetchAdminProfile(token: string) {
  const data = await requestJson<{ profile: AdminProfile }>('/api/admin/profile', {
    token,
  })

  return data.profile
}

export async function updateAdminAccount(token: string, input: AdminAccountInput) {
  const data = await requestJson<{ profile: AdminProfile }>('/api/admin/account', {
    method: 'PUT',
    token,
    body: JSON.stringify(input),
  })

  return data.profile
}

export async function createGalleryPost(token: string, post: GalleryPost) {
  const data = await requestJson<{ post: GalleryPost }>('/api/posts', {
    method: 'POST',
    token,
    body: JSON.stringify(post),
  })

  return data.post
}

export async function updateGalleryPost(token: string, postId: string, post: GalleryPost) {
  const data = await requestJson<{ post: GalleryPost }>(`/api/posts/${encodeURIComponent(postId)}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(post),
  })

  return data.post
}

export async function deleteGalleryPost(token: string, postId: string) {
  await requestJson<{ ok: boolean }>(`/api/posts/${encodeURIComponent(postId)}`, {
    method: 'DELETE',
    token,
  })
}

export async function fetchMusicConfig(signal?: AbortSignal) {
  const data = await requestJson<{ music: MusicConfig }>('/api/music', { signal })

  return data.music
}

export async function saveMusicConfig(token: string, input: Pick<MusicConfig, 'enabled' | 'platform' | 'sourceType' | 'musicId'>) {
  const data = await requestJson<{ music: MusicConfig }>('/api/music', {
    method: 'PUT',
    token,
    body: JSON.stringify(input),
  })

  return data.music
}
