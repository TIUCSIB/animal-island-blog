import type { Dispatch, SetStateAction } from 'react'
import type { AboutContent } from '@/data/about-content'
import type { MusicSourceType } from '@/lib/posts-api'
import type { SiteProfile } from '@/data/site-profile'

export type AdminSection = 'write' | 'posts' | 'music' | 'site' | 'about' | 'system'

export type AdminStatus = {
  type: 'success' | 'error' | 'info'
  text: string
} | null

export type SystemCheckStatus = 'success' | 'error' | 'info'

export type SystemCheckItem = {
  id: 'api' | 'posts' | 'profile' | 'music' | 'auth'
  label: string
  value: string
  status: SystemCheckStatus
  detail?: string
}

export type PostForm = {
  id: string
  title: string
  content: string
  location: string
  time: string
  imagesText: string
  videosText: string
  tagsText: string
  pinned: boolean
}

export type MusicForm = {
  sourceType: MusicSourceType
  musicId: string
  enabled: boolean
}

export type AdminAccountForm = {
  account: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type SiteProfileForm = SiteProfile
export type AboutContentForm = AboutContent

export type SetPostForm = Dispatch<SetStateAction<PostForm>>
export type SetMusicForm = Dispatch<SetStateAction<MusicForm>>
export type SetAdminAccountForm = Dispatch<SetStateAction<AdminAccountForm>>
export type SetSiteProfileForm = Dispatch<SetStateAction<SiteProfileForm>>
export type SetAboutContentForm = Dispatch<SetStateAction<AboutContentForm>>
