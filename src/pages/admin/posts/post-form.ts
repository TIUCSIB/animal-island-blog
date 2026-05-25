import type { GalleryPost } from '@/data/gallery'
import type { PostForm } from '../types'

export function createEmptyForm(): PostForm {
  return {
    id: '',
    title: '',
    content: '',
    location: '',
    time: new Date().toISOString().slice(0, 10),
    imageSrc: '',
    imagesText: '',
    tagsText: '',
    pinned: false,
  }
}

function joinList(values?: string[]) {
  return values?.join('\n') ?? ''
}

function splitList(value: string) {
  return value
    .split(/[\n,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function postToForm(post: GalleryPost): PostForm {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    location: post.location,
    time: post.time.slice(0, 10),
    imageSrc: post.imageSrc,
    imagesText: joinList(post.images),
    tagsText: post.tags.join('，'),
    pinned: Boolean(post.pinned),
  }
}

export function formToPost(form: PostForm): GalleryPost {
  const images = splitList(form.imagesText)
  const imageSrc = form.imageSrc.trim() || images[0] || ''

  return {
    id: form.id.trim(),
    title: form.title.trim(),
    content: form.content.trim(),
    location: form.location.trim(),
    time: form.time.trim(),
    imageSrc,
    images: Array.from(new Set([imageSrc, ...images].filter(Boolean))),
    tags: splitList(form.tagsText),
    pinned: form.pinned,
  }
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '操作失败'
}
