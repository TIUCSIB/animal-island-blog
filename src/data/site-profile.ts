export type SiteAvatarStatus = '' | 'online' | 'away' | 'busy'

export type SiteProfile = {
  avatarUrl: string
  badgeEnabled: boolean
  badge: string
  avatarStatus: SiteAvatarStatus
  nickname: string
  handle: string
  bio: string
  updatedAt?: string
}

export const defaultSiteProfile: SiteProfile = {
  avatarUrl: 'https://www.loliapi.com/acg/pp',
  badgeEnabled: true,
  badge: '♥',
  avatarStatus: '',
  nickname: 'mewbarkjoy',
  handle: '@mewbarkjoy',
  bio: '你好，我是一个程序员',
}
