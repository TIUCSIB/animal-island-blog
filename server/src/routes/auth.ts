import { Elysia } from 'elysia'

import { assertAdmin, getAdminProfile, loginAdmin, refreshAdminSession, updateAdminAccount } from '../services/auth'
import { AdminAccountBody, AdminLoginBody, AdminRefreshBody } from '../validation'

export const authRoutes = new Elysia()
  .post(
    '/api/admin/login',
    async ({ body, request, set }) => {
      set.status = 200

      return loginAdmin(body, request)
    },
    {
      body: AdminLoginBody,
    },
  )
  .post(
    '/api/admin/refresh',
    async ({ body, set }) => {
      set.status = 200

      return refreshAdminSession(body.refreshToken)
    },
    {
      body: AdminRefreshBody,
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

      return { profile: await updateAdminAccount(body) }
    },
    {
      body: AdminAccountBody,
    },
  )
