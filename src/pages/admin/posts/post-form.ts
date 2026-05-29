import type { GalleryPost } from '@/data/gallery'
import type { PostForm } from '../types'
import { MAX_POST_IMAGES, MAX_POST_VIDEOS, getPostMediaUrls } from './post-media-utils'

export function createEmptyForm(): PostForm {
  return {
    id: '',
    title: '',
    content: '',
    location: '',
    time: '',
    imagesText: '',
    videosText: '',
    tagsText: '',
    pinned: false,
  }
}

function joinList(values?: string[]) {
  return values?.join('\n') ?? ''
}

function splitList(value: string) {
  return getPostMediaUrls(value)
}

export function postToForm(post: GalleryPost): PostForm {
  const hasVideos = (post.videos?.length ?? 0) > 0
  const imageValues =
    post.images?.length ? post.images
    : hasVideos ? []
    : [post.imageSrc].filter(Boolean)

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    location: post.location,
    time: post.time,
    imagesText: joinList(imageValues),
    videosText: joinList(post.videos),
    tagsText: post.tags.join('，'),
    pinned: Boolean(post.pinned),
  }
}

export function formToPost(form: PostForm): GalleryPost {
  const images = splitList(form.imagesText).slice(0, MAX_POST_IMAGES)
  const videos = splitList(form.videosText).slice(0, MAX_POST_VIDEOS)
  const imageSrc = images[0] || videos[0] || ''

  return {
    id: form.id.trim(),
    title: form.title.trim(),
    content: form.content.trim(),
    location: form.location.trim(),
    time: form.time.trim(),
    imageSrc,
    images,
    videos,
    mediaType: videos.length > 0 ? 'video' : 'image',
    tags: splitList(form.tagsText),
    pinned: form.pinned,
  }
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '操作失败'
}
