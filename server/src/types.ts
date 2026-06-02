export type WorkerEnv = {
  DB: D1Database
  ADMIN_PASSWORD?: string
  MUSIC_API_BASE_URL?: string
  TURNSTILE_ENABLED?: string
  TURNSTILE_SECRET_KEY?: string
  CLOUDINARY_CLOUD_NAME?: string
  CLOUDINARY_API_KEY?: string
  CLOUDINARY_API_SECRET?: string
  CLOUDINARY_UPLOAD_FOLDER?: string
}

export type GalleryPost = {
  id: string
  imageSrc: string
  images?: string[]
  videos?: string[]
  mediaType?: 'image' | 'video'
  coverWidth?: number
  coverHeight?: number
  title: string
  content: string
  location: string
  time: string
  tags: string[]
  pinned?: boolean
}

export type SiteProfile = {
  avatarUrl: string
  badgeEnabled: boolean
  badge: string
  avatarStatus: '' | 'online' | 'away' | 'busy'
  nickname: string
  handle: string
  bio: string
  updatedAt?: string
}

export type ContactIconName = 'github' | 'mail' | 'instagram' | 'website' | 'bilibili'

export type ContactLink = {
  id: string
  label: string
  value: string
  href: string
  icon: ContactIconName
  enabled: boolean
  sortOrder: number
}

export type AboutCollapseItem = {
  id: string
  question: string
  content: string
  defaultExpanded: boolean
  disabled: boolean
  enabled: boolean
  sortOrder: number
}

export type AboutContent = {
  intro: string
  projectQuestion: string
  projectSummary: string
  contacts: ContactLink[]
  collapseItems: AboutCollapseItem[]
  updatedAt?: string
}

export type AboutContentInput = {
  intro?: unknown
  projectQuestion?: unknown
  projectSummary?: unknown
  contacts?: ContactLinkInput[]
  collapseItems?: AboutCollapseItemInput[]
}

export type ContactLinkInput = {
  id?: unknown
  label?: unknown
  value?: unknown
  href?: unknown
  icon?: unknown
  enabled?: unknown
  sortOrder?: unknown
}

export type AboutCollapseItemInput = {
  id?: unknown
  question?: unknown
  content?: unknown
  defaultExpanded?: unknown
  disabled?: unknown
  enabled?: unknown
  sortOrder?: unknown
}

export type MusicSourceType = 'song' | 'playlist'

export type MusicTrack = {
  title: string
  author: string
  pic: string
  url: string
  lrc?: string
}

export type AdminTokenType = 'access' | 'refresh'
