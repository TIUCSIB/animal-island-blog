import type { AboutContent, MusicTrack, SiteProfile } from './types'

export const CONFIG_ID = 'default'
export const ADMIN_USER_ID = 'owner'
export const SITE_PROFILE_ID = 'default'
export const ABOUT_PAGE_ID = 'default'
export const MUSIC_API_BASE_URL = 'https://music.030456.xyz/api'
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 15
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
export const PASSWORD_HASH_ITERATIONS = 100_000

export const defaultSiteProfile: SiteProfile = {
  avatarUrl: 'https://www.loliapi.com/acg/pp',
  badgeEnabled: true,
  badge: '♥',
  avatarStatus: '',
  nickname: 'mewbarkjoy',
  handle: '@mewbarkjoy',
  bio: '你好，我是一个程序员',
}

export const defaultAboutContent: AboutContent = {
  intro: '这里是图片小岛，用来收集日常、旅行、风景和一些平淡但可爱的瞬间。',
  projectQuestion: '小岛问答',
  projectSummary: '一个偏个人向的图片画廊和小博客，用来记录生活里的可爱碎片。',
  contacts: [
    {
      id: 'github',
      label: 'GitHub',
      value: '@mewbarkjoy',
      href: 'https://github.com/mewbarkjoy',
      icon: 'github',
      enabled: true,
      sortOrder: 0,
    },
    {
      id: 'email',
      label: 'Email',
      value: 'hello@mewbarkjoy.com',
      href: 'mailto:hello@mewbarkjoy.com',
      icon: 'mail',
      enabled: true,
      sortOrder: 1,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      value: '@mewbarkjoy',
      href: 'https://www.instagram.com/mewbarkjoy',
      icon: 'instagram',
      enabled: true,
      sortOrder: 2,
    },
  ],
  collapseItems: [
    {
      id: 'about-project',
      question: '这是一个怎样的网站？',
      content: '一个偏个人向的图片画廊和小博客，用来记录生活里的可爱碎片。',
      defaultExpanded: true,
      disabled: false,
      enabled: true,
      sortOrder: 0,
    },
  ],
}

export const defaultMusic = {
  enabled: true,
  platform: 'netease' as const,
  sourceType: 'song' as const,
  musicId: '473403185',
  tracks: [
    {
      title: 'ふたつの影',
      author: 'Famishin / 春風まゆき',
      pic: 'https://p1.music.126.net/UtBzZyeeHb84vRQXWoH48A==/19019352137357551.jpg',
      url: 'https://music.030456.xyz/api?server=netease&type=url&id=473403185',
      lrc: 'https://music.030456.xyz/api?server=netease&type=lrc&id=473403185',
    },
  ] satisfies MusicTrack[],
}
