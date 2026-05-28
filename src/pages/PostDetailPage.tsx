import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Loading } from 'animal-island-ui'
import { ArrowLeft, BadgeCheck, ChevronLeft, ChevronRight, MapPin, MoreHorizontal, X } from 'lucide-react'

import { IslandPostContent } from '@/components/island'
import type { GalleryPost } from '@/data/gallery'
import { defaultSiteProfile } from '@/data/site-profile'
import { queryKeys } from '@/lib/query-client'
import { useGalleryPostQuery, useSiteProfileQuery } from '@/lib/query-hooks'
import { cn } from '@/lib/utils'
import { Gallery } from '@/pages/components/Gallery'
import { SiteFooter } from '@/pages/components/SiteFooter'
import { SiteHeader } from '@/pages/components/SiteHeader'
import '@/components/island/island.css'

type PostRouteState = {
  from?: string
  post?: GalleryPost
  posts?: GalleryPost[]
  intercepted?: boolean
}

type GalleryPostsCache = {
  pages?: Array<{
    posts?: GalleryPost[]
  }>
}

type MediaShape = 'portrait' | 'square' | 'landscape'

const interceptedLayoutClasses: Record<MediaShape, string> = {
  portrait: 'w-[min(860px,calc(100vw-160px))] grid-cols-[minmax(300px,1fr)_420px]',
  square: 'w-[min(980px,calc(100vw-160px))] grid-cols-[minmax(420px,1fr)_420px]',
  landscape: 'w-[min(1120px,calc(100vw-140px))] grid-cols-[minmax(560px,1fr)_420px]',
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function formatDisplayTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value
  if (date.getTime() > Date.now()) return formatDate(value)

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 5) return '刚刚'
  if (seconds < 60) return `${seconds}秒前`
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return formatDate(value)
}

function getCachedPosts(cache: GalleryPostsCache | undefined) {
  return cache?.pages?.flatMap((page) => page.posts ?? []) ?? []
}

function findCachedPost(cache: GalleryPostsCache | undefined, postId: string) {
  return getCachedPosts(cache).find((post) => post.id === postId)
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQueryList = window.matchMedia(query)
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQueryList.addEventListener('change', handleChange)

    return () => {
      mediaQueryList.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}

function getMediaShape(ratio?: number): MediaShape {
  if (!ratio) return 'square'
  if (ratio < 0.85) return 'portrait'
  if (ratio > 1.25) return 'landscape'

  return 'square'
}

export default function PostDetailPage() {
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
  const mediaItems = useMemo(() => {
    if (!post) return []

    if (post.mediaType === 'video' && post.videos?.length) {
      return post.videos.map((src) => ({ src, type: 'video' as const }))
    }

    return (post.images?.length ? post.images : [post.imageSrc]).filter(Boolean).map((src) => ({ src, type: 'image' as const }))
  }, [post])
  const [mediaState, setMediaState] = useState(() => ({ postId, index: 0 }))
  const [mediaRatios, setMediaRatios] = useState<Record<string, number>>({})
  const activeMediaIndex = mediaState.postId === postId ? Math.min(mediaState.index, Math.max(mediaItems.length - 1, 0)) : 0
  const activeMedia = mediaItems[activeMediaIndex]
  const firstMediaRatio = mediaItems[0] ? mediaRatios[mediaItems[0].src] : undefined
  const layoutShape = getMediaShape(firstMediaRatio)
  const displayLocation = post?.location.trim()
  const isCompact = useMediaQuery('(max-width: 699px)')
  const isIntercepted = Boolean(routeState?.intercepted) && !isCompact

  function closeDetail() {
    if (routeState?.from) {
      navigate(routeState.from, { replace: true })
      return
    }

    navigate('/', { replace: true })
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

  function switchMedia(direction: -1 | 1) {
    selectMediaIndex((current) => current + direction)
  }

  function recordMediaRatio(src: string, width: number, height: number) {
    if (!src || width <= 0 || height <= 0) return

    setMediaRatios((current) => {
      if (current[src]) return current

      return {
        ...current,
        [src]: width / height,
      }
    })
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

  if (!post && postQuery.isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[url('/images/home-bg.webp')] bg-repeat" role="status" aria-label="文章详情加载中">
        <Loading active />
      </main>
    )
  }

  if (!post) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[url('/images/home-bg.webp')] bg-repeat p-5">
        <div className="grid w-[min(360px,calc(100vw-40px))] justify-items-center gap-3 rounded-[26px] bg-[#fffaf0]/90 p-7 text-center text-[#725d42]">
          <strong className="text-xl font-black">这篇文章不见啦</strong>
          <span>可能已经被删除，或者小岛暂时迷路了。</span>
          <Button type="primary" size="small" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>
      </main>
    )
  }

  const detailArticle = (
    <article
      className={cn(
        'relative z-10 overflow-hidden',
        isCompact && 'flex min-h-dvh h-auto w-screen flex-col bg-white text-[#333]',
        !isCompact &&
          !isIntercepted &&
          'grid h-[min(620px,calc(100dvh-24px))] w-[min(980px,calc(100vw-24px))] grid-cols-[minmax(0,1fr)_360px] rounded-[20px] bg-white text-[#333] shadow-[0_28px_80px_rgba(7,12,16,0.28)]',
        isIntercepted &&
          cn('grid h-[min(620px,calc(100dvh-72px))] overflow-hidden rounded border border-white/10 bg-[#0b0f14] shadow-[0_26px_80px_rgba(0,0,0,0.48)]', interceptedLayoutClasses[layoutShape]),
      )}
      aria-label={post.title}
    >
      <section className={cn('group relative grid min-h-0 min-w-0 place-items-center  bg-[#020405]', isCompact && 'aspect-square w-full flex-none')}>
        <div className="absolute inset-x-0 top-0 z-30 hidden min-h-14 items-center justify-between bg-gradient-to-b from-black/45 to-transparent px-3 py-2 text-white max-[699px]:flex">
          <button className="grid size-9 place-items-center rounded-full bg-black/20" type="button" aria-label="返回" onClick={closeDetail}>
            <ArrowLeft aria-hidden="true" size={24} strokeWidth={2.8} />
          </button>
          <strong className="max-w-[62vw] overflow-hidden text-ellipsis whitespace-nowrap">{profile.nickname}</strong>
          <button className="grid size-9 place-items-center rounded-full bg-black/20" type="button" aria-label="更多">
            <MoreHorizontal aria-hidden="true" size={24} strokeWidth={2.8} />
          </button>
        </div>

        {activeMedia?.type === 'video' ?
          <video
            key={activeMedia.src}
            className="block size-full object-contain"
            src={activeMedia.src}
            controls
            playsInline
            onLoadedMetadata={(event) => recordMediaRatio(activeMedia.src, event.currentTarget.videoWidth, event.currentTarget.videoHeight)}
          />
        : <img
            key={activeMedia?.src ?? post.imageSrc}
            className="block size-full object-contain"
            src={activeMedia?.src ?? post.imageSrc}
            alt={post.title}
            onLoad={(event) => recordMediaRatio(activeMedia?.src ?? post.imageSrc, event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)}
          />
        }

        {activeMediaIndex > 0 ?
          <button
            className="pointer-events-none absolute left-3 top-1/2 z-20 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#222] opacity-0 transition hover:bg-white group-hover:pointer-events-auto group-hover:opacity-100 focus:pointer-events-auto focus:opacity-100 max-[699px]:pointer-events-auto max-[699px]:opacity-100"
            type="button"
            aria-label="上一张"
            onClick={() => switchMedia(-1)}
          >
            <ChevronLeft aria-hidden="true" size={22} strokeWidth={3} />
          </button>
        : null}

        {activeMediaIndex < mediaItems.length - 1 ?
          <button
            className="pointer-events-none absolute right-3 top-1/2 z-20 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#222] opacity-0 transition hover:bg-white group-hover:pointer-events-auto group-hover:opacity-100 focus:pointer-events-auto focus:opacity-100 max-[699px]:pointer-events-auto max-[699px]:opacity-100"
            type="button"
            aria-label="下一张"
            onClick={() => switchMedia(1)}
          >
            <ChevronRight aria-hidden="true" size={22} strokeWidth={3} />
          </button>
        : null}

        {mediaItems.length > 1 ?
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5" aria-label="图片页码">
            {mediaItems.map((item, index) => (
              <button
                key={`${item.src}-${index}`}
                className={cn('size-2 rounded-full bg-white/40', index === activeMediaIndex && 'bg-white')}
                type="button"
                aria-label={`切换到第 ${index + 1} 张`}
                aria-current={index === activeMediaIndex}
                onClick={() => selectMediaIndex(index)}
              />
            ))}
          </div>
        : null}
      </section>

      <section
        className={cn(
          'flex min-h-0 min-w-0 flex-col',
          isIntercepted ? 'border-l border-[#2d3037] bg-[#1f2229] text-[#f5f6f7]' : 'bg-white text-[#333]',
          isCompact && 'flex-1 border-l-0 bg-white text-[#333]',
        )}
      >
        <header className={cn('flex flex-none items-center gap-2.5 px-4 py-3', isIntercepted && 'border-b border-[#2d3037]', isCompact && 'min-h-16 border-b-0 px-4 py-3')}>
          <img className="size-8 flex-none rounded-full object-cover" src={profile.avatarUrl} alt="" />
          <div className="grid min-w-0 flex-1 gap-0.5">
            <strong className={cn('overflow-hidden text-ellipsis whitespace-nowrap text-sm font-extrabold', isIntercepted ? 'text-[#f5f6f7]' : 'text-[#555]')}>{profile.nickname}</strong>
            <span className={cn('overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold', isIntercepted ? 'text-[#a8adb7]' : 'text-[#999]')}>{profile.handle}</span>
          </div>
          <Button
            className={cn(
              '!h-auto !min-w-0 !rounded-full !border-0 !bg-transparent !p-0 !text-sm !font-black !text-[#7aa2ff] !shadow-none',
              isCompact && '!min-w-[72px] !bg-[#ff3158] !px-3 !py-1.5 !text-white',
            )}
            type="primary"
            size="small"
          >
            关注
          </Button>
          <button className={cn('grid size-8 flex-none place-items-center rounded-full bg-transparent', isIntercepted ? 'text-[#f5f6f7]' : 'text-[#666]')} type="button" aria-label="更多操作">
            <MoreHorizontal aria-hidden="true" size={20} strokeWidth={3} />
          </button>
          <button
            className={cn(
              'grid size-8 flex-none place-items-center rounded-full',
              isIntercepted ? 'fixed right-4 top-4 z-[90] size-11 bg-transparent text-white' : 'bg-[#f6f6f6] text-[#666]',
              isCompact && 'hidden',
            )}
            type="button"
            aria-label="关闭详情"
            onClick={closeDetail}
          >
            <X aria-hidden="true" size={isIntercepted ? 30 : 18} strokeWidth={3} />
          </button>
        </header>

        <div className={cn('min-h-0 flex-1 overflow-y-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', isCompact && 'overflow-visible px-4')}>
          <div className="py-3">
            <h1 className={cn('mb-2.5 text-sm font-black leading-snug', isIntercepted ? 'text-[#f5f6f7]' : 'text-[#333]', isCompact && 'text-xl')}>{post.title}</h1>
            <div className={cn('text-[13px] leading-relaxed', isIntercepted ? 'text-[#f5f6f7]' : 'text-[#333]', isCompact && 'text-base')}>
              <strong className="mr-2 inline-flex items-center gap-1 font-black">
                {profile.nickname}
                <BadgeCheck className="fill-[#1d9bf0] text-[#1d9bf0]" aria-hidden="true" size={15} strokeWidth={3} />
              </strong>
              <IslandPostContent content={post.content} />
            </div>

            <div className={cn('mt-3 flex flex-wrap items-center gap-2.5 text-xs', isIntercepted ? 'text-[#a8adb7]' : 'text-[#8b8b8b]', isCompact && 'text-sm')}>
              <time dateTime={post.time}>{formatDisplayTime(post.time)}</time>
              {displayLocation ?
                <span className="inline-flex items-center gap-1">
                  <MapPin aria-hidden="true" size={13} strokeWidth={2.6} />
                  {displayLocation}
                </span>
              : null}
            </div>

            {post.tags.length > 0 ?
              <div className="mt-3 flex flex-wrap gap-2" aria-label="标签">
                {post.tags.map((tag) => (
                  <span className="text-[13px] font-extrabold text-[#89aaff]" key={tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            : null}
          </div>

        </div>
      </section>
    </article>
  )

  if (isIntercepted) {
    return (
      <div className="min-h-dvh">
        <div className="pointer-events-none min-h-dvh select-none opacity-45" aria-hidden="true">
          <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 pt-7.5">
            <SiteHeader profile={profile} />
            <main className="flex-1">
              <Gallery siteProfile={profile} />
            </main>
            <SiteFooter />
          </div>
        </div>
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-[18px]" role="dialog" aria-modal="true" aria-label={post.title}>
          <button className="absolute inset-0 z-0 cursor-default bg-transparent" type="button" aria-label="关闭详情" onClick={closeDetail} />
          {previousPost ?
            <button
              className="fixed left-[18px] top-1/2 z-[90] grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-[#15171c] shadow-[0_10px_28px_rgba(0,0,0,0.3)] transition hover:bg-white/95"
              type="button"
              aria-label="上一篇文章"
              onClick={() => switchPost(previousPost)}
            >
              <ChevronLeft aria-hidden="true" size={24} strokeWidth={3} />
            </button>
          : null}
          {detailArticle}
          {nextPost ?
            <button
              className="fixed right-[18px] top-1/2 z-[90] grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-[#15171c] shadow-[0_10px_28px_rgba(0,0,0,0.3)] transition hover:bg-white/95"
              type="button"
              aria-label="下一篇文章"
              onClick={() => switchPost(nextPost)}
            >
              <ChevronRight aria-hidden="true" size={24} strokeWidth={3} />
            </button>
          : null}
        </div>
      </div>
    )
  }

  return <main className="grid min-h-dvh place-items-center bg-black/30 p-3 max-[699px]:block max-[699px]:bg-white max-[699px]:p-0">{detailArticle}</main>
}
