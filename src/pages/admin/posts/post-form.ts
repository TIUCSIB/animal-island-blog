import type { GalleryPost } from '@/data/gallery'
import type { PostForm } from '../types'

export function createEmptyForm(): PostForm {
  return {
    id: '',
    title: '',
    content: '',
    location: '',
    time: '',
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
    time: post.time,
    imagesText: joinList(post.images?.length ? post.images : [post.imageSrc]),
    tagsText: post.tags.join('，'),
    pinned: Boolean(post.pinned),
  }
}

export function formToPost(form: PostForm): GalleryPost {
  const images = splitList(form.imagesText).slice(0, 9)
  const imageSrc = images[0] || ''

  return {
    id: form.id.trim(),
    title: form.title.trim(),
    content: form.content.trim(),
    location: form.location.trim(),
    time: form.time.trim(),
    imageSrc,
    images,
    tags: splitList(form.tagsText),
    pinned: form.pinned,
  }
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '操作失败'
}
