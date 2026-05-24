import { Elysia } from 'elysia'

import { assertAdmin } from '../services/auth'
import { getSiteProfile, saveSiteProfile } from '../services/profile'
import { SiteProfileBody } from '../validation'

export const profileRoutes = new Elysia()
  .get('/api/profile', async () => ({ profile: await getSiteProfile() }))
  .put(
    '/api/profile',
    async ({ body, request }) => {
      await assertAdmin(request)

      return { profile: await saveSiteProfile(body) }
    },
    {
      body: SiteProfileBody,
    },
  )
