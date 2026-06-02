import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'

import type { GalleryPost } from '@/data/gallery'
import { defaultSiteProfile } from '@/data/site-profile'
import { queryKeys } from '@/lib/query-client'
import { useGalleryPostQuery, useSiteProfileQuery } from '@/lib/query-hooks'

import { findCachedPost, getCachedPosts, type GalleryPostsCache, useMediaQuery, useViewportSize } from './post-detail.utils'

export type PostRouteState = {
  from?: string
  post?: GalleryPost
  posts?: GalleryPost[]
  intercepted?: boolean
}

export type MediaItem = {
  src: string
  type: 'image' | 'video'
}

export function usePostDetailPage() {
  const { postId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const routeState = location.state as PostRouteState | null
  const queryClient = useQueryClient()
  const galleryPostsCache = queryClient.getQueryData<GalleryPostsCache>(queryKeys.galleryPosts)
  const cachedPost = findCachedPost(galleryPostsCache, postId)
  const orderedPosts = routeState?.posts?.length ? routeState.posts : getCachedPosts(galleryPostsCache)
  const currentPostIndex = orderedPosts.findIndex((item) => item.id === postId)
  const previousPost = currentPostIndex > 0 ? orderedPosts[currentPostIndex - 1] : null
  const nextPost = currentPostIndex >= 0 && currentPostIndex < orderedPosts.length - 1 ? orderedPosts[currentPostIndex + 1] : null
  const postQuery = useGalleryPostQuery(postId, routeState?.post ?? cachedPost)
  const siteProfileQuery = useSiteProfileQuery()
  const profile = siteProfileQuery.data ?? defaultSiteProfile
  const post = postQuery.data
  const viewport = useViewportSize()
  const isCompact = useMediaQuery('(max-width: 699px)')
  const isIntercepted = Boolean(routeState?.intercepted) && !isCompact
  const [mediaState, setMediaState] = useState(() => ({ postId, index: 0 }))
  const [mediaRatios, setMediaRatios] = useState<Record<string, number>>(() => {
    const initialPost = routeState?.post ?? cachedPost
    if (!initialPost) return {}

    const firstSrc = initialPost.videos?.length
      ? initialPost.videos[0]
      : (initialPost.images?.length ? initialPost.images[0] : initialPost.imageSrc)
    if (!firstSrc) return {}

    if (initialPost.coverWidth && initialPost.coverHeight) {
      return { [firstSrc]: initialPost.coverWidth / initialPost.coverHeight }
    }

    if (initialPost.videos?.length) {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = firstSrc

      if (video.videoWidth > 0 && video.videoHeight > 0) {
        return { [firstSrc]: video.videoWidth / video.videoHeight }
      }

      return {}
    }

    const img = new Image()
    img.src = firstSrc
    if (img.complete && img.naturalWidth > 0) {
      return { [firstSrc]: img.naturalWidth / img.naturalHeight }
    }

    return {}
  })
  const [mobileMediaControlState, setMobileMediaControlState] = useState(() => ({ postId, visible: false }))
  const mobileMediaControlTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mobileSwipeStartRef = useRef<{ x: number; y: number } | null>(null)

  const mediaItems = useMemo<MediaItem[]>(() => {
    if (!post) return []

    if (post.videos?.length) {
      return post.videos.map((src) => ({ src, type: 'video' }))
    }

    return (post.images?.length ? post.images : [post.imageSrc]).filter(Boolean).map((src) => ({ src, type: 'image' }))
  }, [post])

  const activeMediaIndex = mediaState.postId === postId ? Math.min(mediaState.index, Math.max(mediaItems.length - 1, 0)) : 0
  const activeMedia = mediaItems[activeMediaIndex]
  const activeMediaRatio = activeMedia ? mediaRatios[activeMedia.src] : undefined
  const firstMediaRatio = mediaItems[0] ? mediaRatios[mediaItems[0].src] : undefined
  const coverFrameRatio = (post?.coverWidth && post?.coverHeight) ? post.coverWidth / post.coverHeight : undefined
  const ratioResolved = !mediaItems.length || firstMediaRatio !== undefined
  const frameRatio = firstMediaRatio ?? activeMediaRatio ?? coverFrameRatio ?? 1
  const displayLocation = post?.location?.trim()
  const lockCarouselFrame = mediaItems.length > 1
  const mobileMediaControlsVisible = isCompact && mediaItems.length > 1 && mobileMediaControlState.postId === postId && mobileMediaControlState.visible

  function closeDetail() {
    if (routeState?.from) {
      navigate(routeState.from, { replace: true })
      return
    }

    navigate('/', { replace: true })
  }

  function goHome() {
    navigate('/')
  }

  function selectMediaIndex(nextIndex: number | ((current: number) => number)) {
    setMediaState((current) => {
      const currentIndex = current.postId === postId ? current.index : 0
      const resolvedIndex = typeof nextIndex === 'function' ? nextIndex(currentIndex) : nextIndex
      const maxIndex = Math.max(mediaItems.length - 1, 0)

      return {
        postId,
        index: Math.min(Math.max(resolvedIndex, 0), maxIndex),
      }
    })
  }

  function revealMobileMediaControls() {
    if (!isCompact || mediaItems.length <= 1) return

    if (mobileMediaControlTimeoutRef.current) {
      window.clearTimeout(mobileMediaControlTimeoutRef.current)
    }

    setMobileMediaControlState({ postId, visible: true })
    mobileMediaControlTimeoutRef.current = window.setTimeout(() => {
      setMobileMediaControlState((current) => (current.postId === postId ? { postId, visible: false } : current))
      mobileMediaControlTimeoutRef.current = null
    }, 1600)
  }

  function switchMedia(direction: -1 | 1) {
    revealMobileMediaControls()
    selectMediaIndex((current) => current + direction)
  }

  function switchPost(targetPost: GalleryPost) {
    navigate(`/posts/${encodeURIComponent(targetPost.id)}`, {
      state: {
        from: routeState?.from ?? '/',
        post: targetPost,
        posts: orderedPosts,
        intercepted: true,
      } satisfies PostRouteState,
    })
  }

  function recordMediaRatio(src: string, width: number, height: number) {
    if (!src || width <= 0 || height <= 0) return

    setMediaRatios((current) => {
      if (current[src]) return current
      return { ...current, [src]: width / height }
    })
  }

  function handleMobileMediaPointerDown(event: ReactPointerEvent<HTMLElement>) {
    revealMobileMediaControls()

    if (mediaItems.length <= 1 || event.pointerType === 'mouse') {
      mobileSwipeStartRef.current = null
      return
    }

    mobileSwipeStartRef.current = { x: event.clientX, y: event.clientY }
  }

  function handleMobileMediaPointerUp(event: ReactPointerEvent<HTMLElement>) {
    const startPoint = mobileSwipeStartRef.current
    mobileSwipeStartRef.current = null

    if (!startPoint || mediaItems.length <= 1 || event.pointerType === 'mouse') return

    const deltaX = event.clientX - startPoint.x
    const deltaY = event.clientY - startPoint.y

    if (Math.abs(deltaX) < 46 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.15) return
    if (deltaX < 0 && activeMediaIndex < mediaItems.length - 1) return switchMedia(1)
    if (deltaX > 0 && activeMediaIndex > 0) switchMedia(-1)
  }

  function handleMobileMediaPointerCancel() {
    mobileSwipeStartRef.current = null
  }

  useEffect(() => {
    mediaItems.forEach((item) => {
      if (mediaRatios[item.src]) return

      if (item.type === 'image') {
        const image = new Image()
        image.src = item.src
        image.onload = () => {
          recordMediaRatio(item.src, image.naturalWidth, image.naturalHeight)
        }
        return
      }

      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = item.src
      video.onloadedmetadata = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          recordMediaRatio(item.src, video.videoWidth, video.videoHeight)
        }
      }
    })
  }, [mediaItems, mediaRatios])

  useEffect(() => {
    return () => {
      if (mobileMediaControlTimeoutRef.current) {
        window.clearTimeout(mobileMediaControlTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!post || !post.coverWidth || !post.coverHeight) return

    const firstSrc = post.videos?.length
      ? post.videos[0]
      : (post.images?.length ? post.images[0] : post.imageSrc)
    if (!firstSrc) return

    setMediaRatios((current) => {
      if (current[firstSrc]) return current
      return { ...current, [firstSrc]: post.coverWidth! / post.coverHeight! }
    })
  }, [post])

  const desktopHeight = Math.max(620, Math.min(860, viewport.height - 72))
  const desktopRightWidth = Math.min(410, Math.max(380, Math.round(viewport.width * 0.25)))
  const desktopOuterGap = isIntercepted ? 168 : 104
  const widthCap =
    frameRatio > 1.15 ? 640
    : frameRatio < 0.85 ? 600
    : 660
  const availableLeftWidth = Math.max(360, viewport.width - desktopRightWidth - desktopOuterGap)
  const computedLeftWidth = Math.max(320, Math.min(availableLeftWidth, widthCap, Math.round(desktopHeight * frameRatio)))
  const mobileMediaMaxHeight = Math.max(300, frameRatio < 0.82 ? viewport.height * 0.85 : Math.min(viewport.height * 0.62, 520))

  const desktopArticleStyle: CSSProperties | undefined =
    !isCompact ?
      {
        width: `${computedLeftWidth + desktopRightWidth}px`,
        height: `${desktopHeight}px`,
        gridTemplateColumns: `${computedLeftWidth}px ${desktopRightWidth}px`,
      }
    : undefined

  const mobileMediaHeight = Math.round(Math.min(viewport.width / (frameRatio || 1), mobileMediaMaxHeight))

  const mobileMediaStyle: CSSProperties = {
    height: `${mobileMediaHeight}px`,
    maxHeight: `${mobileMediaMaxHeight}px`,
  }

  return {
    postId,
    routeState,
    orderedPosts,
    previousPost,
    nextPost,
    post,
    profile,
    isCompact,
    isIntercepted,
    isPending: !post && postQuery.isPending,
    mediaItems,
    activeMediaIndex,
    activeMedia,
    frameRatio,
    displayLocation,
    lockCarouselFrame,
    mobileMediaControlsVisible,
    ratioResolved,
    desktopArticleStyle,
    mobileMediaStyle,
    closeDetail,
    goHome,
    selectMediaIndex,
    switchMedia,
    switchPost,
    handleMobileMediaPointerDown,
    handleMobileMediaPointerUp,
    handleMobileMediaPointerCancel,
    recordMediaRatio,
  }
}

export type UsePostDetailPageResult = ReturnType<typeof usePostDetailPage>
