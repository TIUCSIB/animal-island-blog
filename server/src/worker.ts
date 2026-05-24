import { cors } from '@elysiajs/cors'
import { asc, desc, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { Elysia, t } from 'elysia'
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker'
import { env } from 'cloudflare:workers'

import { aboutCollapseItems, aboutPages, adminUsers, contactLinks, musicConfigs, musicTracks, postAssets, posts, postTags, siteProfiles } from './db/schema'

type WorkerEnv = {
  DB: D1Database
  ADMIN_PASSWORD?: string
}

type GalleryPost = {
  id: string
  imageSrc: string
  images?: string[]
  title: string
  content: string
  location: string
  time: string
  tags: string[]
  pinned?: boolean
}

type SiteProfile = {
  avatarUrl: string
  badgeEnabled: boolean
  badge: string
  avatarStatus: '' | 'online' | 'away' | 'busy'
  nickname: string
  handle: string
  bio: string
  updatedAt?: string
}

type ContactIconName = 'github' | 'mail' | 'instagram' | 'website' | 'bilibili'

type ContactLink = {
  id: string
  label: string
  value: string
  href: string
  icon: ContactIconName
  enabled: boolean
  sortOrder: number
}

type AboutCollapseItem = {
  id: string
  question: string
  content: string
  defaultExpanded: boolean
  disabled: boolean
  enabled: boolean
  sortOrder: number
}

type AboutContent = {
  intro: string
  projectQuestion: string
  projectSummary: string
  contacts: ContactLink[]
  collapseItems: AboutCollapseItem[]
  updatedAt?: string
}

type AboutContentInput = {
  intro?: unknown
  projectQuestion?: unknown
  projectSummary?: unknown
  contacts?: ContactLinkInput[]
  collapseItems?: AboutCollapseItemInput[]
}

type ContactLinkInput = {
  id?: unknown
  label?: unknown
  value?: unknown
  href?: unknown
  icon?: unknown
  enabled?: unknown
  sortOrder?: unknown
}

type AboutCollapseItemInput = {
  id?: unknown
  question?: unknown
  content?: unknown
  defaultExpanded?: unknown
  disabled?: unknown
  enabled?: unknown
  sortOrder?: unknown
}

type MusicSourceType = 'song' | 'playlist'

type MusicTrack = {
  title: string
  author: string
  pic: string
  url: string
  lrc?: string
}

const CONFIG_ID = 'default'
const ADMIN_USER_ID = 'owner'
const SITE_PROFILE_ID = 'default'
const ABOUT_PAGE_ID = 'default'
const MUSIC_API_BASE_URL = 'https://music.030456.xyz/api'
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7
const PASSWORD_HASH_ITERATIONS = 100_000

const defaultSiteProfile: SiteProfile = {
  avatarUrl: 'https://www.loliapi.com/acg/pp',
  badgeEnabled: true,
  badge: '♥',
  avatarStatus: '',
  nickname: 'mewbarkjoy',
  handle: '@mewbarkjoy',
  bio: '你好，我是一个程序员',
}

const defaultAboutContent: AboutContent = {
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

const defaultMusic = {
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
  ],
}

class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function getEnv() {
  return env as unknown as WorkerEnv
}

function getDb() {
  return drizzle(getEnv().DB)
}

function getAdminPassword() {
  return getEnv().ADMIN_PASSWORD || 'island-admin'
}

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function toStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(String(item))).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/[\n,，]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || `post-${Date.now()}`
}

function getUniqueId(baseId: string, list: GalleryPost[], currentId?: string) {
  let candidate = baseId
  let index = 2

  while (list.some((post) => post.id === candidate && post.id !== currentId)) {
    candidate = `${baseId}-${index}`
    index += 1
  }

  return candidate
}

function normalizePost(input: Partial<GalleryPost>, list: GalleryPost[], currentId?: string): GalleryPost {
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

function normalizeSiteProfile(input: Partial<SiteProfile>): SiteProfile {
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

function normalizeContactIcon(value: unknown): ContactIconName {
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

function normalizeAboutContent(input: AboutContentInput): AboutContent {
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

function normalizeMusicTrack(track: Partial<MusicTrack>): MusicTrack {
  return {
    title: cleanText(track.title) || '未命名音乐',
    author: cleanText(track.author) || '未知作者',
    pic: cleanText(track.pic),
    url: cleanText(track.url),
    lrc: cleanText(track.lrc),
  }
}

function encodeBase64Url(input: string | ArrayBuffer | Uint8Array) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input)
  let binary = ''

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))

  return new TextDecoder().decode(bytes)
}

function decodeBase64UrlBytes(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)

  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

async function signTokenPayload(payload: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))

  return encodeBase64Url(signature)
}

async function hashPassword(password: string, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PASSWORD_HASH_ITERATIONS,
      hash: 'SHA-256',
    },
    key,
    256,
  )

  return {
    hash: encodeBase64Url(bits),
    salt: encodeBase64Url(salt),
  }
}

async function verifyPassword(password: string, passwordHash: string, passwordSalt: string) {
  const { hash } = await hashPassword(password, decodeBase64UrlBytes(passwordSalt))

  return hash === passwordHash
}

async function getAdminUser() {
  return getDb().select().from(adminUsers).where(eq(adminUsers.id, ADMIN_USER_ID)).get()
}

async function getAdminProfile() {
  const user = await getAdminUser()

  return {
    account: user?.account ?? 'mewbarkjoy',
    initialized: Boolean(user),
    updatedAt: user?.updatedAt,
  }
}

async function getSiteProfile() {
  const profile = await getDb().select().from(siteProfiles).where(eq(siteProfiles.id, SITE_PROFILE_ID)).get()

  if (!profile) return defaultSiteProfile

  return {
    avatarUrl: profile.avatarUrl,
    badgeEnabled: profile.badgeEnabled,
    badge: profile.badge,
    avatarStatus: profile.avatarStatus,
    nickname: profile.nickname,
    handle: profile.handle,
    bio: profile.bio,
    updatedAt: profile.updatedAt,
  } satisfies SiteProfile
}

async function getAboutContent() {
  const db = getDb()
  const about = await db.select().from(aboutPages).where(eq(aboutPages.id, ABOUT_PAGE_ID)).get()

  if (!about) return defaultAboutContent

  const contacts = await db.select().from(contactLinks).orderBy(asc(contactLinks.sortOrder)).all()
  const collapseRows = await db.select().from(aboutCollapseItems).orderBy(asc(aboutCollapseItems.sortOrder)).all()
  const collapseItems = collapseRows.map((item) => ({
    id: item.id,
    question: item.question,
    content: item.content,
    defaultExpanded: item.defaultExpanded,
    disabled: item.disabled,
    enabled: item.enabled,
    sortOrder: item.sortOrder,
  }))

  return {
    intro: about.intro,
    projectQuestion: about.projectQuestion,
    projectSummary: about.projectSummary,
    contacts: contacts.map((contact) => ({
      id: contact.id,
      label: contact.label,
      value: contact.value,
      href: contact.href,
      icon: normalizeContactIcon(contact.icon),
      enabled: contact.enabled,
      sortOrder: contact.sortOrder,
    })),
    collapseItems: collapseItems.length > 0 ? collapseItems : [
      {
        id: 'about-project',
        question: '这是一个怎样的网站？',
        content: about.projectSummary || defaultAboutContent.projectSummary,
        defaultExpanded: true,
        disabled: false,
        enabled: true,
        sortOrder: 0,
      },
    ],
    updatedAt: about.updatedAt,
  } satisfies AboutContent
}

async function createAdminToken() {
  const now = Math.floor(Date.now() / 1000)
  const payload = encodeBase64Url(JSON.stringify({ iat: now, exp: now + TOKEN_MAX_AGE_SECONDS }))
  const signature = await signTokenPayload(payload, getAdminPassword())

  return `${payload}.${signature}`
}

async function verifyAdminToken(token: string) {
  const [payload, signature] = token.split('.')

  if (!payload || !signature) return false

  const expectedSignature = await signTokenPayload(payload, getAdminPassword())

  if (signature !== expectedSignature) return false

  try {
    const data = JSON.parse(decodeBase64Url(payload)) as { exp?: number }

    return typeof data.exp === 'number' && data.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

async function assertAdmin(request: Request) {
  const authorization = request.headers.get('authorization') ?? ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''

  if (!(await verifyAdminToken(token))) {
    throw new HttpError(401, '请先登录后台')
  }
}

async function listPosts() {
  const db = getDb()
  const postRows = await db.select().from(posts).orderBy(desc(posts.pinned), desc(posts.time), desc(posts.createdAt)).all()
  const assetRows = await db.select().from(postAssets).orderBy(asc(postAssets.sortOrder)).all()
  const tagRows = await db.select().from(postTags).orderBy(asc(postTags.sortOrder)).all()

  return postRows.map((post) => {
    const images = assetRows.filter((asset) => asset.postId === post.id).map((asset) => asset.url)

    return {
      id: post.id,
      imageSrc: post.imageSrc,
      images: images.length > 0 ? images : [post.imageSrc],
      title: post.title,
      content: post.content,
      location: post.location,
      time: post.time,
      tags: tagRows.filter((tag) => tag.postId === post.id).map((tag) => tag.tag),
      pinned: post.pinned,
    } satisfies GalleryPost
  })
}

async function replacePostRelations(post: GalleryPost) {
  const db = getDb()
  const now = new Date().toISOString()

  await db.delete(postAssets).where(eq(postAssets.postId, post.id))
  await db.delete(postTags).where(eq(postTags.postId, post.id))

  if (post.images?.length) {
    await db.insert(postAssets).values(
      post.images.map((url, index) => ({
        id: crypto.randomUUID(),
        postId: post.id,
        url,
        publicId: '',
        resourceType: 'image' as const,
        sortOrder: index,
        createdAt: now,
      })),
    )
  }

  if (post.tags.length) {
    await db.insert(postTags).values(
      post.tags.map((tag, index) => ({
        id: crypto.randomUUID(),
        postId: post.id,
        tag,
        sortOrder: index,
      })),
    )
  }
}

async function fetchMusicTracks(sourceType: MusicSourceType, musicId: string) {
  const url = new URL(MUSIC_API_BASE_URL)

  url.searchParams.set('server', 'netease')
  url.searchParams.set('type', sourceType)
  url.searchParams.set('id', musicId)

  const response = await fetch(url)

  if (!response.ok) {
    throw new HttpError(502, '音乐接口请求失败')
  }

  const data = await response.json()
  const list = Array.isArray(data) ? data : [data]
  const tracks = list.map(normalizeMusicTrack).filter((track) => track.url)

  if (tracks.length === 0) {
    throw new HttpError(422, '没有解析到可播放的歌曲')
  }

  return tracks
}

async function getMusicConfig() {
  const db = getDb()
  const config = await db.select().from(musicConfigs).where(eq(musicConfigs.id, CONFIG_ID)).get()

  if (!config) return defaultMusic

  const tracks = await db.select().from(musicTracks).where(eq(musicTracks.configId, CONFIG_ID)).orderBy(asc(musicTracks.sortOrder)).all()

  return {
    enabled: config.enabled,
    platform: config.platform,
    sourceType: config.sourceType,
    musicId: config.musicId,
    tracks: tracks.map((track) => ({
      title: track.title,
      author: track.author,
      pic: track.pic,
      url: track.url,
      lrc: track.lrc,
    })),
    updatedAt: config.updatedAt,
  }
}

const PostBody = t.Object({
  id: t.Optional(t.String()),
  imageSrc: t.Optional(t.String()),
  images: t.Optional(t.Array(t.String())),
  title: t.String(),
  content: t.Optional(t.String()),
  location: t.Optional(t.String()),
  time: t.Optional(t.String()),
  tags: t.Optional(t.Array(t.String())),
  pinned: t.Optional(t.Boolean()),
})

const SiteProfileBody = t.Object({
  avatarUrl: t.Optional(t.String()),
  badgeEnabled: t.Optional(t.Boolean()),
  badge: t.Optional(t.String()),
  avatarStatus: t.Optional(t.Union([t.Literal(''), t.Literal('online'), t.Literal('away'), t.Literal('busy')])),
  nickname: t.Optional(t.String()),
  handle: t.Optional(t.String()),
  bio: t.Optional(t.String()),
})

const ContactLinkBody = t.Object({
  id: t.Optional(t.String()),
  label: t.String(),
  value: t.Optional(t.String()),
  href: t.String(),
  icon: t.Optional(t.String()),
  enabled: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
})

const AboutCollapseItemBody = t.Object({
  id: t.Optional(t.String()),
  question: t.String(),
  content: t.String(),
  defaultExpanded: t.Optional(t.Boolean()),
  disabled: t.Optional(t.Boolean()),
  enabled: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
})

const AboutContentBody = t.Object({
  intro: t.Optional(t.String()),
  projectQuestion: t.Optional(t.String()),
  projectSummary: t.Optional(t.String()),
  contacts: t.Optional(t.Array(ContactLinkBody)),
  collapseItems: t.Optional(t.Array(AboutCollapseItemBody)),
})

export default new Elysia({
  adapter: CloudflareAdapter,
})
  .use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))
  .onError(({ error, code, set }) => {
    if (error instanceof HttpError) {
      set.status = error.status
      return { message: error.message }
    }

    if (code === 'VALIDATION') {
      set.status = 400
      return { message: '请求参数格式不正确' }
    }

    set.status = 500
    return { message: error instanceof Error ? error.message : '服务器错误' }
  })
  .get('/', () => 'Island API is running')
  .get('/api/health', () => ({ ok: true }))
  .get('/api/about', async () => ({ about: await getAboutContent() }))
  .put(
    '/api/about',
    async ({ body, request }) => {
      await assertAdmin(request)

      const about = normalizeAboutContent(body)
      const db = getDb()
      const now = new Date().toISOString()
      const existing = await db.select({ id: aboutPages.id }).from(aboutPages).where(eq(aboutPages.id, ABOUT_PAGE_ID)).get()

      if (existing) {
        await db
          .update(aboutPages)
          .set({
            intro: about.intro,
            projectQuestion: about.projectQuestion,
            projectSummary: about.projectSummary,
            updatedAt: now,
          })
          .where(eq(aboutPages.id, ABOUT_PAGE_ID))
      } else {
        await db.insert(aboutPages).values({
          id: ABOUT_PAGE_ID,
          intro: about.intro,
          projectQuestion: about.projectQuestion,
          projectSummary: about.projectSummary,
          updatedAt: now,
        })
      }

      await db.delete(contactLinks)
      await db.delete(aboutCollapseItems)

      if (about.contacts.length > 0) {
        await db.insert(contactLinks).values(
          about.contacts.map((contact, index) => ({
            id: contact.id,
            label: contact.label,
            value: contact.value,
            href: contact.href,
            icon: contact.icon,
            enabled: contact.enabled,
            sortOrder: index,
            createdAt: now,
            updatedAt: now,
          })),
        )
      }

      if (about.collapseItems.length > 0) {
        await db.insert(aboutCollapseItems).values(
          about.collapseItems.map((item, index) => ({
            id: item.id,
            question: item.question,
            content: item.content,
            defaultExpanded: item.defaultExpanded,
            disabled: item.disabled,
            enabled: item.enabled,
            sortOrder: index,
            createdAt: now,
            updatedAt: now,
          })),
        )
      }

      return { about: await getAboutContent() }
    },
    {
      body: AboutContentBody,
    },
  )
  .get('/api/profile', async () => ({ profile: await getSiteProfile() }))
  .put(
    '/api/profile',
    async ({ body, request }) => {
      await assertAdmin(request)

      const profile = normalizeSiteProfile(body)
      const db = getDb()
      const now = new Date().toISOString()
      const existing = await db.select({ id: siteProfiles.id }).from(siteProfiles).where(eq(siteProfiles.id, SITE_PROFILE_ID)).get()

      if (existing) {
        await db
          .update(siteProfiles)
          .set({
            avatarUrl: profile.avatarUrl,
            badgeEnabled: profile.badgeEnabled,
            badge: profile.badge,
            avatarStatus: profile.avatarStatus,
            nickname: profile.nickname,
            handle: profile.handle,
            bio: profile.bio,
            updatedAt: now,
          })
          .where(eq(siteProfiles.id, SITE_PROFILE_ID))
      } else {
        await db.insert(siteProfiles).values({
          id: SITE_PROFILE_ID,
          avatarUrl: profile.avatarUrl,
          badgeEnabled: profile.badgeEnabled,
          badge: profile.badge,
          avatarStatus: profile.avatarStatus,
          nickname: profile.nickname,
          handle: profile.handle,
          bio: profile.bio,
          updatedAt: now,
        })
      }

      return { profile: await getSiteProfile() }
    },
    {
      body: SiteProfileBody,
    },
  )
  .post(
    '/api/admin/login',
    async ({ body, set }) => {
      const account = cleanText(body.account)
      const password = cleanText(body.password)
      const user = await getAdminUser()

      if (user) {
        const accountMatched = account.toLowerCase() === user.account.toLowerCase()
        const passwordMatched = await verifyPassword(password, user.passwordHash, user.passwordSalt)

        if (!accountMatched || !passwordMatched) {
          throw new HttpError(401, '账号或密码不正确')
        }
      } else if (password !== getAdminPassword()) {
        throw new HttpError(401, '后台密码不正确')
      }

      set.status = 200
      return {
        token: await createAdminToken(),
        profile: user ? { account: user.account, initialized: true, updatedAt: user.updatedAt } : { account: account || 'mewbarkjoy', initialized: false },
      }
    },
    {
      body: t.Object({
        account: t.Optional(t.String()),
        password: t.String(),
      }),
    },
  )
  .get('/api/admin/profile', async ({ request }) => {
    await assertAdmin(request)

    return { profile: await getAdminProfile() }
  })
  .put(
    '/api/admin/account',
    async ({ body, request }) => {
      await assertAdmin(request)

      const account = cleanText(body.account)
      const currentPassword = cleanText(body.currentPassword)
      const newPassword = cleanText(body.newPassword)
      const db = getDb()
      const user = await getAdminUser()

      if (!account) throw new HttpError(400, '请填写账号或邮箱')
      if (!currentPassword) throw new HttpError(400, '请填写当前密码')

      const currentPasswordMatched = user ? await verifyPassword(currentPassword, user.passwordHash, user.passwordSalt) : currentPassword === getAdminPassword()

      if (!currentPasswordMatched) {
        throw new HttpError(401, '当前密码不正确')
      }

      if (newPassword && newPassword.length < 6) {
        throw new HttpError(400, '新密码至少需要 6 位')
      }

      const now = new Date().toISOString()
      const nextPassword = newPassword || currentPassword
      const password = newPassword || !user ? await hashPassword(nextPassword) : { hash: user.passwordHash, salt: user.passwordSalt }

      if (user) {
        await db
          .update(adminUsers)
          .set({
            account,
            passwordHash: password.hash,
            passwordSalt: password.salt,
            updatedAt: now,
          })
          .where(eq(adminUsers.id, ADMIN_USER_ID))
      } else {
        await db.insert(adminUsers).values({
          id: ADMIN_USER_ID,
          account,
          passwordHash: password.hash,
          passwordSalt: password.salt,
          createdAt: now,
          updatedAt: now,
        })
      }

      return { profile: await getAdminProfile() }
    },
    {
      body: t.Object({
        account: t.String(),
        currentPassword: t.String(),
        newPassword: t.Optional(t.String()),
      }),
    },
  )
  .get('/api/posts', async () => ({ posts: await listPosts() }))
  .post(
    '/api/posts',
    async ({ body, request, set }) => {
      await assertAdmin(request)

      const currentPosts = await listPosts()
      const post = normalizePost(body, currentPosts)
      const now = new Date().toISOString()
      const db = getDb()

      await db.insert(posts).values({
        id: post.id,
        title: post.title,
        content: post.content,
        location: post.location,
        time: post.time,
        imageSrc: post.imageSrc,
        pinned: Boolean(post.pinned),
        createdAt: now,
        updatedAt: now,
      })
      await replacePostRelations(post)

      set.status = 201
      return { post, posts: await listPosts() }
    },
    {
      body: PostBody,
    },
  )
  .put(
    '/api/posts/:id',
    async ({ params, body, request }) => {
      await assertAdmin(request)

      const db = getDb()
      const currentPosts = await listPosts()
      const currentPost = currentPosts.find((post) => post.id === params.id)

      if (!currentPost) throw new HttpError(404, '文章不存在')

      const post = normalizePost({ ...currentPost, ...body }, currentPosts, params.id)

      await db
        .update(posts)
        .set({
          title: post.title,
          content: post.content,
          location: post.location,
          time: post.time,
          imageSrc: post.imageSrc,
          pinned: Boolean(post.pinned),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(posts.id, params.id))
      await replacePostRelations(post)

      return { post, posts: await listPosts() }
    },
    {
      body: PostBody,
    },
  )
  .delete('/api/posts/:id', async ({ params, request }) => {
    await assertAdmin(request)

    const db = getDb()
    const currentPost = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, params.id)).get()

    if (!currentPost) throw new HttpError(404, '文章不存在')

    await db.delete(posts).where(eq(posts.id, params.id))

    return { ok: true, posts: await listPosts() }
  })
  .get('/api/music', async () => ({ music: await getMusicConfig() }))
  .put(
    '/api/music',
    async ({ body, request }) => {
      await assertAdmin(request)

      const sourceType = body.sourceType === 'playlist' ? 'playlist' : 'song'
      const musicId = cleanText(body.musicId)

      if (!musicId) throw new HttpError(400, '请填写歌曲 ID 或歌单 ID')

      const tracks = await fetchMusicTracks(sourceType, musicId)
      const db = getDb()
      const now = new Date().toISOString()
      const existing = await db.select({ id: musicConfigs.id }).from(musicConfigs).where(eq(musicConfigs.id, CONFIG_ID)).get()

      if (existing) {
        await db
          .update(musicConfigs)
          .set({
            enabled: body.enabled !== false,
            platform: 'netease',
            sourceType,
            musicId,
            updatedAt: now,
          })
          .where(eq(musicConfigs.id, CONFIG_ID))
      } else {
        await db.insert(musicConfigs).values({
          id: CONFIG_ID,
          enabled: body.enabled !== false,
          platform: 'netease',
          sourceType,
          musicId,
          updatedAt: now,
        })
      }

      await db.delete(musicTracks).where(eq(musicTracks.configId, CONFIG_ID))
      await db.insert(musicTracks).values(
        tracks.map((track, index) => ({
          id: crypto.randomUUID(),
          configId: CONFIG_ID,
          title: track.title,
          author: track.author,
          pic: track.pic,
          url: track.url,
          lrc: track.lrc ?? '',
          sortOrder: index,
        })),
      )

      return { music: await getMusicConfig() }
    },
    {
      body: t.Object({
        enabled: t.Boolean(),
        platform: t.Literal('netease'),
        sourceType: t.Union([t.Literal('song'), t.Literal('playlist')]),
        musicId: t.String(),
      }),
    },
  )
  .compile()
