import { Elysia } from 'elysia'

import { assertAdmin } from '../services/auth'
import { getMusicConfig, saveMusicConfig } from '../services/music'
import { MusicBody } from '../validation'

export const musicRoutes = new Elysia()
  .get('/api/music', async () => ({ music: await getMusicConfig() }))
  .put(
    '/api/music',
    async ({ body, request }) => {
      await assertAdmin(request)

      return { music: await saveMusicConfig(body) }
    },
    {
      body: MusicBody,
    },
  )
