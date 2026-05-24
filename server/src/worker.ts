import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker'

import { HttpError } from './http'
import { aboutRoutes } from './routes/about'
import { authRoutes } from './routes/auth'
import { mediaRoutes } from './routes/media'
import { musicRoutes } from './routes/music'
import { postsRoutes } from './routes/posts'
import { profileRoutes } from './routes/profile'

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
  .use(aboutRoutes)
  .use(profileRoutes)
  .use(authRoutes)
  .use(mediaRoutes)
  .use(postsRoutes)
  .use(musicRoutes)
  .compile()
