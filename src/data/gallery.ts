export type GalleryPost = {
  id: string
  imageSrc: string
  images?: string[]
  title: string
  content: string
  location: string
  time: string
  tags: string[]
  pinned?: boolean
}

export const galleryPosts: GalleryPost[] = []
