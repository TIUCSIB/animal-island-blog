import { asc, count, desc, eq, inArray } from 'drizzle-orm'

import { getDb } from '../db'
import { postAssets, posts, postTags } from '../db/schema'
import { HttpError } from '../http'
import { normalizePost } from '../normalizers'
import type { GalleryPost } from '../types'

type PostRow = typeof posts.$inferSelect
type PostAssetRow = typeof postAssets.$inferSelect
type PostTagRow = typeof postTags.$inferSelect

export type PostsPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

function serializePosts(postRows: PostRow[], assetRows: PostAssetRow[], tagRows: PostTagRow[]) {
  return postRows.map((post) => {
    const postAssetRows = assetRows.filter((asset) => asset.postId === post.id)
    const images = postAssetRows.filter((asset) => asset.resourceType === 'image').map((asset) => asset.url)
    const videos = postAssetRows.filter((asset) => asset.resourceType === 'video').map((asset) => asset.url)

    return {
      id: post.id,
      imageSrc: post.imageSrc,
      images: images.length > 0 ? images : [post.imageSrc],
      videos,
      mediaType: videos.length > 0 ? 'video' : 'image',
      title: post.title,
      content: post.content,
      location: post.location,
      time: post.createdAt,
      tags: tagRows.filter((tag) => tag.postId === post.id).map((tag) => tag.tag),
      pinned: post.pinned,
    } satisfies GalleryPost
  })
}

export async function listPosts() {
  const db = getDb()
  const postRows = await db.select().from(posts).orderBy(desc(posts.pinned), desc(posts.time), desc(posts.createdAt)).all()
  const assetRows = await db.select().from(postAssets).orderBy(asc(postAssets.sortOrder)).all()
  const tagRows = await db.select().from(postTags).orderBy(asc(postTags.sortOrder)).all()

  return serializePosts(postRows, assetRows, tagRows)
}

export async function getPostById(id: string) {
  const db = getDb()
  const postRow = await db.select().from(posts).where(eq(posts.id, id)).get()

  if (!postRow) return null

  const assetRows = await db.select().from(postAssets).where(eq(postAssets.postId, id)).orderBy(asc(postAssets.sortOrder)).all()
  const tagRows = await db.select().from(postTags).where(eq(postTags.postId, id)).orderBy(asc(postTags.sortOrder)).all()

  return serializePosts([postRow], assetRows, tagRows)[0] ?? null
}

export async function listPostsPage(inputPage = 1, inputPageSize = 6) {
  const db = getDb()
  const pageSize = Math.min(Math.max(Math.floor(inputPageSize) || 6, 1), 50)
  const total = (await db.select({ value: count() }).from(posts).get())?.value ?? 0
  const pinnedCount = (await db.select({ value: count() }).from(posts).where(eq(posts.pinned, true)).get())?.value ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(Math.max(Math.floor(inputPage) || 1, 1), totalPages)
  const offset = (page - 1) * pageSize
  const postRows = await db.select().from(posts).orderBy(desc(posts.pinned), desc(posts.time), desc(posts.createdAt)).limit(pageSize).offset(offset).all()
  const postIds = postRows.map((post) => post.id)
  const assetRows = postIds.length > 0 ? await db.select().from(postAssets).where(inArray(postAssets.postId, postIds)).orderBy(asc(postAssets.sortOrder)).all() : []
  const tagRows = postIds.length > 0 ? await db.select().from(postTags).where(inArray(postTags.postId, postIds)).orderBy(asc(postTags.sortOrder)).all() : []

  return {
    posts: serializePosts(postRows, assetRows, tagRows),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    } satisfies PostsPagination,
    stats: {
      pinnedCount,
    },
  }
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

  if (post.videos?.length) {
    await db.insert(postAssets).values(
      post.videos.map((url, index) => ({
        id: crypto.randomUUID(),
        postId: post.id,
        url,
        publicId: '',
        resourceType: 'video' as const,
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

export async function createPost(input: unknown) {
  const now = new Date().toISOString()
  const post = normalizePost(input as Partial<GalleryPost>, undefined, now)
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

  return post
}

export async function updatePost(id: string, input: unknown) {
  const db = getDb()
  const currentPost = await getPostById(id)

  if (!currentPost) throw new HttpError(404, '文章不存在')

  const post = normalizePost({ ...currentPost, ...(input as Partial<GalleryPost>) }, id)

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
    .where(eq(posts.id, id))
  await replacePostRelations(post)

  return post
}

export async function deletePost(id: string) {
  const db = getDb()
  const currentPost = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, id)).get()

  if (!currentPost) throw new HttpError(404, '文章不存在')

  await db.delete(posts).where(eq(posts.id, id))
}
