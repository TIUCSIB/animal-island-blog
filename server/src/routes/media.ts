import { Elysia } from 'elysia'

import { assertAdmin } from '../services/auth'
import { createCloudinaryUploadSignature, deleteCloudinaryUploadAsset, listCloudinaryUploadAssets } from '../services/media'
import { CloudinaryDeleteAssetBody, CloudinaryUploadAssetsQuery, CloudinaryUploadSignatureBody } from '../validation'

export const mediaRoutes = new Elysia()
  .post(
    '/api/admin/uploads/signature',
    async ({ body, request }) => {
      await assertAdmin(request)

      return { upload: await createCloudinaryUploadSignature(body) }
    },
    {
      body: CloudinaryUploadSignatureBody,
    },
  )
  .get(
    '/api/admin/uploads/assets',
    async ({ query, request }) => {
      await assertAdmin(request)

      return listCloudinaryUploadAssets(query)
    },
    {
      query: CloudinaryUploadAssetsQuery,
    },
  )
  .delete(
    '/api/admin/uploads/assets',
    async ({ body, request }) => {
      await assertAdmin(request)

      return deleteCloudinaryUploadAsset(body)
    },
    {
      body: CloudinaryDeleteAssetBody,
    },
  )
