import { createServer } from 'node:http'
import { randomBytes } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT ?? 8787)
const adminPassword = process.env.ADMIN_PASSWORD ?? 'island-admin'
const sessionToken = randomBytes(32).toString('hex')
const dataFile = process.env.POSTS_FILE ? resolve(process.env.POSTS_FILE) : join(__dirname, 'data', 'posts.json')
const musicFile = process.env.MUSIC_FILE ? resolve(process.env.MUSIC_FILE) : join(__dirname, 'data', 'music.json')
const musicApiBaseUrl = 'https://music.030456.xyz/api'
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
      url: 'https://music.030456.xyz/api?server=netease&type=url&id=473403185',
      lrc: 'https://music.030456.xyz/api?server=netease&type=lrc&id=473403185',
    },
  ],
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

  return {
    ...defaultMusic,
    ...music,
    tracks: Array.isArray(music.tracks) ? music.tracks : defaultMusic.tracks,
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
  const time = cleanText(input.time) || new Date().toISOString()
  const tags = [...new Set(toStringList(input.tags))]
  const formImages = toStringList(input.images)
  const imageSrc = cleanText(input.imageSrc) || formImages[0]
  const images = [...new Set([imageSrc, ...formImages].filter(Boolean))]
  const id = currentId ?? getUniqueId(slugify(cleanText(input.id) || title), posts)

  if (!title) throw createHttpError(400, '请填写标题')
  if (!imageSrc) throw createHttpError(400, '请填写封面图片')

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

    if (cleanText(body.password) !== adminPassword) {
      throw createHttpError(401, '后台密码不正确')
    }

    sendJson(response, 200, { token: sessionToken })
    return
  }

  if (url.pathname === '/api/posts' && request.method === 'GET') {
    const posts = await readPosts()

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
  console.log(`Admin password: ${adminPassword}`)
})
