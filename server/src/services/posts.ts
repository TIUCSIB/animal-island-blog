import { asc, desc, eq } from 'drizzle-orm'

import { getDb } from '../db'
import { postAssets, posts, postTags } from '../db/schema'
import { HttpError } from '../http'
import { normalizePost } from '../normalizers'
import type { GalleryPost } from '../types'

export async function listPosts() {
  const db = getDb()
  const postRows = await db.select().from(posts).orderBy(desc(posts.pinned), desc(posts.time), desc(posts.createdAt)).all()
  const assetRows = await db.select().from(postAssets).orderBy(asc(postAssets.sortOrder)).all()
  const tagRows = await db.select().from(postTags).orderBy(asc(postTags.sortOrder)).all()

  return postRows.map((post) => {
    const images = assetRows.filter((asset) => asset.postId === post.id).map((asset) => asset.url)

    return {
      id: post.id,
      imageSrc: post.imageSrc,
      images: images.length > 0 ? images : [post.imageSrc],
      title: post.title,
      content: post.content,
      location: post.location,
      time: post.time,
      tags: tagRows.filter((tag) => tag.postId === post.id).map((tag) => tag.tag),
      pinned: post.pinned,
    } satisfies GalleryPost
  })
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
  const currentPosts = await listPosts()
  const post = normalizePost(input as Partial<GalleryPost>, currentPosts)
  const now = new Date().toISOString()
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
  const currentPosts = await listPosts()
  const currentPost = currentPosts.find((post) => post.id === id)

  if (!currentPost) throw new HttpError(404, '文章不存在')

  const post = normalizePost({ ...currentPost, ...(input as Partial<GalleryPost>) }, currentPosts, id)

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
