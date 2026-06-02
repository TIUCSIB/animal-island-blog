import { createServer } from 'node:http'
import { randomBytes } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT ?? 8787)
const adminPassword = process.env.ADMIN_PASSWORD?.trim() ?? ''
const turnstileEnabled = process.env.TURNSTILE_ENABLED === 'true'
const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY ?? ''
const sessionToken = randomBytes(32).toString('hex')
const dataFile = process.env.POSTS_FILE ? resolve(process.env.POSTS_FILE) : join(__dirname, 'data', 'posts.json')
const musicFile = process.env.MUSIC_FILE ? resolve(process.env.MUSIC_FILE) : join(__dirname, 'data', 'music.json')
const defaultMusicApiBaseUrl = 'https://music.030456.xyz/api'
const musicApiBaseUrl = process.env.MUSIC_API_BASE_URL?.trim() || defaultMusicApiBaseUrl

function createMusicApiUrl(type, id) {
  const url = new URL(musicApiBaseUrl)

  url.searchParams.set('server', 'netease')
  url.searchParams.set('type', type)
  url.searchParams.set('id', id)

  return url.toString()
}

const defaultMusic = {
  enabled: true,
  platform: 'netease',
  sourceType: 'song',
  musicId: '473403185',
  tracks: [
    {
      title: 'ふたつの影',
      author: 'Famishin / 春風まゆき',
      pic: 'https://p1.music.126.net/UtBzZyeeHb84vRQXWoH48A==/19019352137357551.jpg',
      url: createMusicApiUrl('url', '473403185'),
      lrc: createMusicApiUrl('lrc', '473403185'),
    },
  ],
}

if (!adminPassword) {
  throw new Error('ADMIN_PASSWORD is required to start the local JSON API server')
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(data))
}

function createHttpError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

async function readBody(request) {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  if (chunks.length === 0) return {}

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw createHttpError(400, '请求体不是合法 JSON')
  }
}

async function ensurePostsFile() {
  await mkdir(dirname(dataFile), { recursive: true })

  try {
    await readFile(dataFile, 'utf8')
  } catch {
    await writeFile(dataFile, '[]\n', 'utf8')
  }
}

async function readPosts() {
  await ensurePostsFile()

  const raw = await readFile(dataFile, 'utf8')
  const posts = JSON.parse(raw)

  if (!Array.isArray(posts)) {
    throw createHttpError(500, '文章数据格式错误')
  }

  return posts
}

async function writePosts(posts) {
  await mkdir(dirname(dataFile), { recursive: true })

  const tempFile = `${dataFile}.${process.pid}.tmp`

  await writeFile(tempFile, `${JSON.stringify(posts, null, 2)}\n`, 'utf8')
  await rename(tempFile, dataFile)
}

async function ensureMusicFile() {
  await mkdir(dirname(musicFile), { recursive: true })

  try {
    await readFile(musicFile, 'utf8')
  } catch {
    await writeFile(musicFile, `${JSON.stringify(defaultMusic, null, 2)}\n`, 'utf8')
  }
}

async function readMusic() {
  await ensureMusicFile()

  const raw = await readFile(musicFile, 'utf8')
  const music = JSON.parse(raw)
  const tracks = Array.isArray(music.tracks) ? music.tracks : defaultMusic.tracks

  return {
    ...defaultMusic,
    ...music,
    tracks: tracks.map((track) => ({
      ...track,
      url: music.sourceType === 'song' ? createMusicApiUrl('url', cleanText(music.musicId) || defaultMusic.musicId) : track.url,
      lrc: music.sourceType === 'song' ? createMusicApiUrl('lrc', cleanText(music.musicId) || defaultMusic.musicId) : track.lrc,
    })),
  }
}

async function writeMusic(music) {
  await mkdir(dirname(musicFile), { recursive: true })

  const tempFile = `${musicFile}.${process.pid}.tmp`

  await writeFile(tempFile, `${JSON.stringify(music, null, 2)}\n`, 'utf8')
  await rename(tempFile, musicFile)
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

async function verifyTurnstileToken(token, request) {
  if (!turnstileEnabled) return

  const secret = cleanText(turnstileSecretKey)

  if (!secret) return

  if (!token) {
    throw createHttpError(400, '请先完成人机验证')
  }

  const formData = new FormData()
  const forwardedFor = cleanText(request.headers['x-forwarded-for']).split(',')[0]
  const remoteIp = cleanText(request.headers['cf-connecting-ip']) || cleanText(forwardedFor)

  formData.set('secret', secret)
  formData.set('response', token)

  if (remoteIp) {
    formData.set('remoteip', remoteIp)
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw createHttpError(502, '人机验证服务暂时不可用')
  }

  const result = await response.json()

  if (!result.success) {
    throw createHttpError(403, '人机验证未通过，请重试')
  }
}

function toStringList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(String(item))).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value.split(/[\n,，]/).map((item) => item.trim()).filter(Boolean)
  }

  return []
}

function slugify(value) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || `post-${Date.now()}`
}

function getUniqueId(baseId, posts, currentId) {
  let candidate = baseId
  let index = 2

  while (posts.some((post) => post.id === candidate && post.id !== currentId)) {
    candidate = `${baseId}-${index}`
    index += 1
  }

  return candidate
}

function normalizePost(input, posts, currentId) {
  const title = cleanText(input.title)
  const content = cleanText(input.content)
  const location = cleanText(input.location)
  const time = currentId ? cleanText(input.time) || new Date().toISOString() : new Date().toISOString()
  const tags = [...new Set(toStringList(input.tags))]
  const images = [...new Set([...toStringList(input.images), cleanText(input.imageSrc)].filter(Boolean))].slice(0, 9)
  const videos = [...new Set(toStringList(input.videos))].slice(0, 1)
  const mediaType = videos.length > 0 ? 'video' : 'image'
  const imageSrc = images[0] ?? videos[0] ?? ''
  const id = currentId ?? crypto.randomUUID()

  if (!title) throw createHttpError(400, '\u8bf7\u586b\u5199\u6807\u9898')
  if (images.length > 0 && videos.length > 0) throw createHttpError(400, '\u56fe\u7247\u548c\u89c6\u9891\u53ea\u80fd\u4e8c\u9009\u4e00')
  if (!imageSrc) throw createHttpError(400, '\u8bf7\u81f3\u5c11\u4e0a\u4f20 1 \u4e2a\u56fe\u7247\u6216\u89c6\u9891')

  return {
    id,
    imageSrc,
    images,
    videos,
    mediaType,
    title,
    content,
    location,
    time,
    tags,
    pinned: Boolean(input.pinned),
    coverWidth: Number(input.coverWidth) || undefined,
    coverHeight: Number(input.coverHeight) || undefined,
  }
}

function normalizeMusicTrack(track) {
  return {
    title: cleanText(track.title) || '未命名音乐',
    author: cleanText(track.author) || '未知作者',
    pic: cleanText(track.pic),
    url: cleanText(track.url),
    lrc: cleanText(track.lrc),
  }
}

async function fetchMusicTracks(sourceType, musicId) {
  const url = new URL(musicApiBaseUrl)

  url.searchParams.set('server', 'netease')
  url.searchParams.set('type', sourceType)
  url.searchParams.set('id', musicId)

  const response = await fetch(url)

  if (!response.ok) {
    throw createHttpError(502, '音乐接口请求失败')
  }

  const data = await response.json()
  const list = Array.isArray(data) ? data : [data]
  const tracks = list.map(normalizeMusicTrack).filter((track) => track.url)

  if (tracks.length === 0) {
    throw createHttpError(422, '没有解析到可播放的歌曲')
  }

  return tracks
}

async function normalizeMusic(input) {
  const sourceType = input.sourceType === 'playlist' ? 'playlist' : 'song'
  const musicId = cleanText(input.musicId)

  if (!musicId) throw createHttpError(400, '请填写歌曲 ID 或歌单 ID')

  const tracks = await fetchMusicTracks(sourceType, musicId)

  return {
    enabled: input.enabled !== false,
    platform: 'netease',
    sourceType,
    musicId,
    tracks,
    updatedAt: new Date().toISOString(),
  }
}

function assertAdmin(request) {
  const authorization = request.headers.authorization ?? ''

  if (authorization !== `Bearer ${sessionToken}`) {
    throw createHttpError(401, '请先登录后台')
  }
}

function parsePositiveInt(value) {
  const number = Number.parseInt(value, 10)

  return Number.isFinite(number) && number > 0 ? number : undefined
}

function paginatePosts(posts, pageInput, pageSizeInput) {
  const pageSize = Math.min(Math.max(Math.floor(pageSizeInput) || 5, 1), 50)
  const total = posts.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(Math.max(Math.floor(pageInput) || 1, 1), totalPages)
  const start = (page - 1) * pageSize

  return {
    posts: posts.slice(start, start + pageSize),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
    stats: {
      pinnedCount: posts.filter((post) => post.pinned).length,
    },
  }
}

function getPostId(pathname) {
  const match = pathname.match(/^\/api\/posts\/([^/]+)$/)

  return match ? decodeURIComponent(match[1]) : null
}

async function handleRequest(request, response) {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {})
    return
  }

  if (url.pathname === '/api/health') {
    sendJson(response, 200, { ok: true })
    return
  }

  if (url.pathname === '/api/admin/login' && request.method === 'POST') {
    const body = await readBody(request)

    await verifyTurnstileToken(cleanText(body.turnstileToken), request)

    if (cleanText(body.password) !== adminPassword) {
      throw createHttpError(401, '后台密码不正确')
    }

    sendJson(response, 200, { token: sessionToken })
    return
  }

  if (url.pathname === '/api/posts' && request.method === 'GET') {
    const posts = await readPosts()
    const page = parsePositiveInt(url.searchParams.get('page'))
    const pageSize = parsePositiveInt(url.searchParams.get('pageSize'))

    if (page || pageSize) {
      sendJson(response, 200, paginatePosts(posts, page, pageSize))
      return
    }

    sendJson(response, 200, { posts })
    return
  }

  if (url.pathname === '/api/music' && request.method === 'GET') {
    const music = await readMusic()

    sendJson(response, 200, { music })
    return
  }

  if (url.pathname === '/api/music' && request.method === 'PUT') {
    assertAdmin(request)

    const body = await readBody(request)
    const music = await normalizeMusic(body)

    await writeMusic(music)
    sendJson(response, 200, { music })
    return
  }

  if (url.pathname === '/api/posts' && request.method === 'POST') {
    assertAdmin(request)

    const posts = await readPosts()
    const body = await readBody(request)
    const post = normalizePost(body, posts)
    const nextPosts = [post, ...posts]

    await writePosts(nextPosts)
    sendJson(response, 201, { post, posts: nextPosts })
    return
  }

  const postId = getPostId(url.pathname)

  if (postId && request.method === 'PUT') {
    assertAdmin(request)

    const posts = await readPosts()
    const index = posts.findIndex((post) => post.id === postId)

    if (index < 0) throw createHttpError(404, '文章不存在')

    const body = await readBody(request)
    const post = normalizePost({ ...posts[index], ...body }, posts, postId)
    const nextPosts = posts.map((item) => (item.id === postId ? post : item))

    await writePosts(nextPosts)
    sendJson(response, 200, { post, posts: nextPosts })
    return
  }

  if (postId && request.method === 'DELETE') {
    assertAdmin(request)

    const posts = await readPosts()
    const nextPosts = posts.filter((post) => post.id !== postId)

    if (nextPosts.length === posts.length) throw createHttpError(404, '文章不存在')

    await writePosts(nextPosts)
    sendJson(response, 200, { ok: true, posts: nextPosts })
    return
  }

  sendJson(response, 404, { message: '接口不存在' })
}

const server = createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    const statusCode = typeof error.statusCode === 'number' ? error.statusCode : 500

    sendJson(response, statusCode, {
      message: error instanceof Error ? error.message : '服务器错误',
    })
  })
})

server.listen(port, () => {
  console.log(`Island API is running at http://localhost:${port}`)
})
