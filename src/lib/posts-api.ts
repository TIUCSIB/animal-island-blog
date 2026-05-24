import type { GalleryPost } from '@/data/gallery'
import { defaultAboutContent } from '@/data/about-content'
import type { AboutContent } from '@/data/about-content'
import { defaultSiteProfile } from '@/data/site-profile'
import type { SiteProfile } from '@/data/site-profile'

export type { AboutCollapseItem, AboutContent, ContactIconName, ContactLink } from '@/data/about-content'
export type { SiteProfile } from '@/data/site-profile'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
export const ADMIN_ACCESS_TOKEN_STORAGE_KEY = 'island-admin-token'
export const ADMIN_REFRESH_TOKEN_STORAGE_KEY = 'island-admin-refresh-token'
const ACCESS_TOKEN_REFRESH_LEEWAY_SECONDS = 60

type ApiRequestInit = RequestInit & {
  token?: string
  skipAuthRefresh?: boolean
}

type PostsResponse = {
  posts: GalleryPost[]
}

type LoginResponse = {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  refreshExpiresIn?: number
  profile?: AdminProfile
}

type RefreshResponse = LoginResponse

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

export type ApiHealth = {
  ok: boolean
}

export type CloudinaryUploadPurpose = 'avatar' | 'post-image' | 'post-video'
export type CloudinaryResourceType = 'image' | 'video' | 'auto'

export type CloudinaryUploadSignature = {
  cloudName: string
  apiKey: string
  timestamp: number
  signature: string
  folder: string
  resourceType: CloudinaryResourceType
  uploadUrl: string
}

export type CloudinaryUploadAsset = {
  publicId: string
  secureUrl: string
  url: string
  resourceType: string
  format?: string
  width?: number
  height?: number
  bytes?: number
  createdAt?: string
}

type CloudinaryUploadResponse = {
  public_id?: string
  secure_url?: string
  url?: string
  resource_type?: string
  format?: string
  width?: number
  height?: number
  bytes?: number
  error?: {
    message?: string
  }
}

let refreshSessionPromise: Promise<LoginResponse> | null = null

function decodeBase64UrlJson<T>(value: string) {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))

    return JSON.parse(new TextDecoder().decode(bytes)) as T
  } catch {
    return null
  }
}

function getTokenExpiresAt(token: string) {
  const [payload] = token.split('.')
  const data = payload ? decodeBase64UrlJson<{ exp?: unknown }>(payload) : null

  return typeof data?.exp === 'number' ? data.exp : null
}

function shouldRefreshAccessToken(token: string) {
  const expiresAt = getTokenExpiresAt(token)

  if (!expiresAt) return true

  return expiresAt <= Math.floor(Date.now() / 1000) + ACCESS_TOKEN_REFRESH_LEEWAY_SECONDS
}

export function getStoredAdminAccessToken() {
  return localStorage.getItem(ADMIN_ACCESS_TOKEN_STORAGE_KEY) ?? ''
}

export function getStoredAdminRefreshToken() {
  return localStorage.getItem(ADMIN_REFRESH_TOKEN_STORAGE_KEY) ?? ''
}

export function storeAdminSession(session: LoginResponse) {
  localStorage.setItem(ADMIN_ACCESS_TOKEN_STORAGE_KEY, session.accessToken)
  if (session.refreshToken) {
    localStorage.setItem(ADMIN_REFRESH_TOKEN_STORAGE_KEY, session.refreshToken)
  } else {
    localStorage.removeItem(ADMIN_REFRESH_TOKEN_STORAGE_KEY)
  }
  window.dispatchEvent(new Event('island-admin-auth-change'))
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_ACCESS_TOKEN_STORAGE_KEY)
  localStorage.removeItem(ADMIN_REFRESH_TOKEN_STORAGE_KEY)
  window.dispatchEvent(new Event('island-admin-auth-change'))
}

async function refreshAdminSession() {
  const refreshToken = getStoredAdminRefreshToken()

  if (!refreshToken) {
    clearAdminSession()
    throw new Error('登录已过期，请重新登录')
  }

  refreshSessionPromise ??= requestJson<RefreshResponse>('/api/admin/refresh', {
    method: 'POST',
    skipAuthRefresh: true,
    body: JSON.stringify({ refreshToken }),
  }).then((session) => {
    storeAdminSession(session)
    return session
  }).catch((error) => {
    clearAdminSession()
    throw error
  }).finally(() => {
    refreshSessionPromise = null
  })

  return refreshSessionPromise
}

export async function ensureAdminAccessToken(token = getStoredAdminAccessToken()) {
  const storedToken = getStoredAdminAccessToken()
  const newestToken = storedToken && storedToken !== token ? storedToken : token

  if (newestToken && !shouldRefreshAccessToken(newestToken)) return newestToken

  if (!getStoredAdminRefreshToken()) return token

  const session = await refreshAdminSession()

  return session.accessToken
}

async function requestJson<T>(path: string, init: ApiRequestInit = {}) {
  const { skipAuthRefresh, token, ...requestInit } = init
  const shouldUseAuth = Object.prototype.hasOwnProperty.call(init, 'token')
  const headers = new Headers(init.headers)
  const accessToken = shouldUseAuth && !skipAuthRefresh ? await ensureAdminAccessToken(token) : token

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestInit,
    headers,
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    if (response.status === 401 && accessToken && !skipAuthRefresh) {
      try {
        const session = await refreshAdminSession()

        return requestJson<T>(path, {
          ...init,
          token: session.accessToken,
          skipAuthRefresh: true,
        })
      } catch {
        throw new Error('登录已过期，请重新登录')
      }
    }

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

export async function fetchApiHealth(signal?: AbortSignal) {
  return requestJson<ApiHealth>('/api/health', { signal })
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

export async function loginAdmin(account: string, password: string, turnstileToken?: string) {
  const data = await requestJson<LoginResponse>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ account, password, turnstileToken }),
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

export async function createCloudinaryUploadSignature(
  token: string,
  input: {
    purpose: CloudinaryUploadPurpose
    resourceType?: CloudinaryResourceType
  },
) {
  const data = await requestJson<{ upload: CloudinaryUploadSignature }>('/api/admin/uploads/signature', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  })

  return data.upload
}

export async function uploadFileToCloudinary(
  token: string,
  file: File,
  input: {
    purpose: CloudinaryUploadPurpose
    resourceType?: CloudinaryResourceType
  },
) {
  const upload = await createCloudinaryUploadSignature(token, input)
  const formData = new FormData()

  formData.set('file', file)
  formData.set('api_key', upload.apiKey)
  formData.set('timestamp', String(upload.timestamp))
  formData.set('signature', upload.signature)
  formData.set('folder', upload.folder)

  const response = await fetch(upload.uploadUrl, {
    method: 'POST',
    body: formData,
  })
  const data = await response.json() as CloudinaryUploadResponse

  if (!response.ok) {
    throw new Error(data.error?.message || '图片上传失败')
  }

  if (!data.secure_url) {
    throw new Error('Cloudinary 没有返回图片地址')
  }

  return {
    publicId: data.public_id ?? '',
    secureUrl: data.secure_url,
    url: data.url ?? data.secure_url,
    resourceType: data.resource_type ?? upload.resourceType,
    format: data.format,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
  } satisfies CloudinaryUploadAsset
}

export async function fetchCloudinaryUploadAssets(
  token: string,
  input: {
    purpose: CloudinaryUploadPurpose
    resourceType?: CloudinaryResourceType
    nextCursor?: string
    maxResults?: number
  },
) {
  const params = new URLSearchParams()

  params.set('purpose', input.purpose)

  if (input.resourceType) params.set('resourceType', input.resourceType)
  if (input.nextCursor) params.set('nextCursor', input.nextCursor)
  if (input.maxResults) params.set('maxResults', String(input.maxResults))

  return requestJson<{ assets: CloudinaryUploadAsset[]; nextCursor?: string }>(`/api/admin/uploads/assets?${params.toString()}`, {
    token,
  })
}

export async function deleteCloudinaryUploadAsset(
  token: string,
  input: {
    publicId: string
    purpose: CloudinaryUploadPurpose
    resourceType?: CloudinaryResourceType
  },
) {
  return requestJson<{ ok: boolean; publicId: string; result: string }>('/api/admin/uploads/assets', {
    method: 'DELETE',
    token,
    body: JSON.stringify(input),
  })
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
