import { Elysia } from 'elysia'

import { assertAdmin } from '../services/auth'
import { getAboutContent, saveAboutContent } from '../services/about'
import { AboutContentBody } from '../validation'

export const aboutRoutes = new Elysia()
  .get('/api/about', async () => ({ about: await getAboutContent() }))
  .put(
    '/api/about',
    async ({ body, request }) => {
      await assertAdmin(request)

      return { about: await saveAboutContent(body) }
    },
    {
      body: AboutContentBody,
    },
  )
