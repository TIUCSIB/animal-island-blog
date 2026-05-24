import { defaultAboutContent, defaultSiteProfile } from './constants'
import { HttpError } from './http'
import type { AboutCollapseItem, AboutCollapseItemInput, AboutContent, AboutContentInput, ContactIconName, ContactLink, ContactLinkInput, GalleryPost, MusicTrack, SiteProfile } from './types'
import { cleanText, slugify, toStringList } from './utils'

function getUniqueId(baseId: string, list: GalleryPost[], currentId?: string) {
  let candidate = baseId
  let index = 2

  while (list.some((post) => post.id === candidate && post.id !== currentId)) {
    candidate = `${baseId}-${index}`
    index += 1
  }

  return candidate
}

export function normalizePost(input: Partial<GalleryPost>, list: GalleryPost[], currentId?: string): GalleryPost {
  const title = cleanText(input.title)
  const content = cleanText(input.content)
  const location = cleanText(input.location)
  const time = cleanText(input.time) || new Date().toISOString()
  const tags = [...new Set(toStringList(input.tags))]
  const formImages = toStringList(input.images)
  const imageSrc = cleanText(input.imageSrc) || formImages[0]
  const images = [...new Set([imageSrc, ...formImages].filter(Boolean))]
  const id = currentId ?? getUniqueId(slugify(cleanText(input.id) || title), list)

  if (!title) throw new HttpError(400, '请填写标题')
  if (!imageSrc) throw new HttpError(400, '请填写封面图片')

  return {
    id,
    imageSrc,
    images,
    title,
    content,
    location,
    time,
    tags,
    pinned: Boolean(input.pinned),
  }
}

export function normalizeSiteProfile(input: Partial<SiteProfile>): SiteProfile {
  const nickname = cleanText(input.nickname) || defaultSiteProfile.nickname
  const handleValue = cleanText(input.handle) || defaultSiteProfile.handle
  const handle = handleValue.startsWith('@') ? handleValue : `@${handleValue}`
  const avatarStatus = cleanText(input.avatarStatus)

  return {
    avatarUrl: cleanText(input.avatarUrl) || defaultSiteProfile.avatarUrl,
    badgeEnabled: input.badgeEnabled !== false,
    badge: cleanText(input.badge) || defaultSiteProfile.badge,
    avatarStatus: avatarStatus === 'online' || avatarStatus === 'away' || avatarStatus === 'busy' ? avatarStatus : '',
    nickname,
    handle,
    bio: cleanText(input.bio) || defaultSiteProfile.bio,
  }
}

export function normalizeContactIcon(value: unknown): ContactIconName {
  const icon = cleanText(value)

  if (icon === 'github' || icon === 'mail' || icon === 'instagram' || icon === 'bilibili' || icon === 'website') return icon

  return 'website'
}

function normalizeContactLink(input: ContactLinkInput, index: number): ContactLink {
  const label = cleanText(input.label) || 'Link'
  const href = cleanText(input.href)
  const sortOrder = Number(input.sortOrder)

  return {
    id: cleanText(input.id) || crypto.randomUUID(),
    label,
    value: cleanText(input.value) || href || label,
    href,
    icon: normalizeContactIcon(input.icon),
    enabled: input.enabled !== false,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : index,
  }
}

function normalizeAboutCollapseItem(input: AboutCollapseItemInput, index: number): AboutCollapseItem {
  const question = cleanText(input.question) || '新的问题'
  const content = cleanText(input.content)
  const sortOrder = Number(input.sortOrder)

  return {
    id: cleanText(input.id) || crypto.randomUUID(),
    question,
    content,
    defaultExpanded: input.defaultExpanded === true,
    disabled: input.disabled === true,
    enabled: input.enabled !== false,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : index,
  }
}

export function normalizeAboutContent(input: AboutContentInput): AboutContent {
  const contacts = Array.isArray(input.contacts) ? input.contacts.map(normalizeContactLink).filter((contact) => contact.href) : defaultAboutContent.contacts
  const collapseItems = Array.isArray(input.collapseItems) ? input.collapseItems.map(normalizeAboutCollapseItem).filter((item) => item.question && item.content) : defaultAboutContent.collapseItems

  return {
    intro: cleanText(input.intro) || defaultAboutContent.intro,
    projectQuestion: cleanText(input.projectQuestion) || defaultAboutContent.projectQuestion,
    projectSummary: cleanText(input.projectSummary) || collapseItems[0]?.content || defaultAboutContent.projectSummary,
    contacts,
    collapseItems,
  }
}

export function normalizeMusicTrack(track: Partial<MusicTrack>): MusicTrack {
  return {
    title: cleanText(track.title) || '未命名音乐',
    author: cleanText(track.author) || '未知作者',
    pic: cleanText(track.pic),
    url: cleanText(track.url),
    lrc: cleanText(track.lrc),
  }
}
