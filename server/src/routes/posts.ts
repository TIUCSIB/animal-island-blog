import { Elysia } from 'elysia'

import { assertAdmin } from '../services/auth'
import { createPost, deletePost, getPostById, listPostsPage, updatePost } from '../services/posts'
import { HttpError } from '../http'
import { PostBody } from '../validation'

function parsePositiveInt(value: unknown) {
  const text = Array.isArray(value) ? value[0] : value
  const number = typeof text === 'string' ? Number.parseInt(text, 10) : Number.NaN

  return Number.isFinite(number) && number > 0 ? number : undefined
}

export const postsRoutes = new Elysia()
  .get('/api/posts', async ({ query }) => {
    const page = parsePositiveInt(query.page)
    const pageSize = parsePositiveInt(query.pageSize)

    return listPostsPage(page ?? 1, pageSize ?? 6)
  })
  .get('/api/posts/:id', async ({ params }) => {
    const post = await getPostById(params.id)

    if (!post) throw new HttpError(404, '文章不存在')

    return { post }
  })
  .post(
    '/api/posts',
    async ({ body, request, set }) => {
      await assertAdmin(request)

      const post = await createPost(body)

      set.status = 201
      return { post }
    },
    {
      body: PostBody,
    },
  )
  .put(
    '/api/posts/:id',
    async ({ params, body, request }) => {
      await assertAdmin(request)

      const post = await updatePost(params.id, body)

      return { post }
    },
    {
      body: PostBody,
    },
  )
  .delete('/api/posts/:id', async ({ params, request }) => {
    await assertAdmin(request)
    await deletePost(params.id)

    return { ok: true }
  })
