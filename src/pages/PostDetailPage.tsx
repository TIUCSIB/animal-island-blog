import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Loading } from 'animal-island-ui'
import { ArrowLeft, BadgeCheck, Bookmark, ChevronLeft, ChevronRight, Heart, MapPin, MessageCircle, MoreHorizontal, Send, Star, X } from 'lucide-react'

import { IslandPostContent } from '@/components/island'
import type { GalleryPost } from '@/data/gallery'
import { defaultSiteProfile } from '@/data/site-profile'
import { queryKeys } from '@/lib/query-client'
import { useGalleryPostQuery, useSiteProfileQuery } from '@/lib/query-hooks'
import { Gallery } from '@/pages/components/Gallery'
import { SiteFooter } from '@/pages/components/SiteFooter'
import { SiteHeader } from '@/pages/components/SiteHeader'
import '@/components/island/island.css'

type PostRouteState = {
  from?: string
  post?: GalleryPost
  intercepted?: boolean
}

type GalleryPostsCache = {
  pages?: Array<{
    posts?: GalleryPost[]
  }>
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

  if (seconds < 5) return '??'
  if (seconds < 60) return `${seconds}??`
  if (minutes < 60) return `${minutes}???`
  if (hours < 24) return `${hours}???`
  if (days < 7) return `${days}??`

  return formatDate(value)
}

function findCachedPost(cache: GalleryPostsCache | undefined, postId: string) {
  return cache?.pages?.flatMap((page) => page.posts ?? []).find((post) => post.id === postId)
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

export default function PostDetailPage() {
  const { postId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const routeState = location.state as PostRouteState | null
  const queryClient = useQueryClient()
  const cachedPost = findCachedPost(queryClient.getQueryData<GalleryPostsCache>(queryKeys.galleryPosts), postId)
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
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)
  const activeMedia = mediaItems[activeMediaIndex]
  const displayLocation = post?.location.trim()
  const isCompact = useMediaQuery('(max-width: 699px)')
  const isIntercepted = Boolean(routeState?.intercepted) && !isCompact

  useEffect(() => {
    setActiveMediaIndex(0)
  }, [postId])

  function closeDetail() {
    if (routeState?.from) {
      navigate(routeState.from, { replace: true })
      return
    }

    navigate('/', { replace: true })
  }

  function switchMedia(direction: -1 | 1) {
    setActiveMediaIndex((current) => Math.min(Math.max(current + direction, 0), Math.max(mediaItems.length - 1, 0)))
  }

  if (!post && postQuery.isPending) {
    return (
      <main className="island-post-route island-post-route--center" role="status" aria-label="???????">
        <Loading active />
      </main>
    )
  }

  if (!post) {
    return (
      <main className="island-post-route island-post-route--center">
        <div className="island-post-detail-empty">
          <strong>???????</strong>
          <span>??????????????????</span>
          <Button type="primary" size="small" onClick={() => navigate('/')}>????</Button>
        </div>
      </main>
    )
  }

  const detailArticle = (
    <article className="island-post-detail" aria-label={post.title}>
      <section className="island-post-detail__media-pane">
        <div className="island-post-detail__mobile-bar">
          <button type="button" aria-label="??" onClick={closeDetail}>
            <ArrowLeft aria-hidden="true" size={24} strokeWidth={2.8} />
          </button>
          <strong>{profile.nickname}</strong>
          <button type="button" aria-label="??">
            <MoreHorizontal aria-hidden="true" size={24} strokeWidth={2.8} />
          </button>
        </div>

        {activeMedia?.type === 'video' ? (
          <video className="island-post-detail__media" src={activeMedia.src} controls playsInline />
        ) : (
          <img className="island-post-detail__media" src={activeMedia?.src ?? post.imageSrc} alt={post.title} />
        )}

        {activeMediaIndex > 0 ? (
          <button className="island-post-detail__media-nav island-post-detail__media-nav--prev" type="button" aria-label="???" onClick={() => switchMedia(-1)}>
            <ChevronLeft aria-hidden="true" size={24} strokeWidth={3} />
          </button>
        ) : null}

        {activeMediaIndex < mediaItems.length - 1 ? (
          <button className="island-post-detail__media-nav island-post-detail__media-nav--next" type="button" aria-label="???" onClick={() => switchMedia(1)}>
            <ChevronRight aria-hidden="true" size={24} strokeWidth={3} />
          </button>
        ) : null}

        {mediaItems.length > 1 ? (
          <div className="island-post-detail__dots" aria-label="????">
            {mediaItems.map((item, index) => (
              <button
                key={`${item.src}-${index}`}
                className={index === activeMediaIndex ? 'is-active' : ''}
                type="button"
                aria-label={`???? ${index + 1} ?`}
                aria-current={index === activeMediaIndex}
                onClick={() => setActiveMediaIndex(index)}
              />
            ))}
          </div>
        ) : null}
      </section>

      <section className="island-post-detail__side">
        <header className="island-post-detail__author">
          <img src={profile.avatarUrl} alt="" />
          <div>
            <strong>{profile.nickname}</strong>
            <span>{profile.handle}</span>
          </div>
          <Button className="island-post-detail__follow" type="primary" size="small">??</Button>
          <button className="island-post-detail__close" type="button" aria-label="????" onClick={closeDetail}>
            <X aria-hidden="true" size={20} strokeWidth={3} />
          </button>
        </header>

        <div className="island-post-detail__scroll">
          <div className="island-post-detail__content-block">
            <h1>{post.title}</h1>
            <div className="island-post-detail__content">
              <strong className="island-post-detail__name">
                {profile.nickname}
                <BadgeCheck aria-hidden="true" size={16} strokeWidth={3} />
              </strong>
              <IslandPostContent content={post.content} />
            </div>

            <div className="island-post-detail__meta">
              <time dateTime={post.time}>{formatDisplayTime(post.time)}</time>
              {displayLocation ? (
                <span>
                  <MapPin aria-hidden="true" size={14} strokeWidth={2.6} />
                  {displayLocation}
                </span>
              ) : null}
            </div>

            {post.tags.length > 0 ? (
              <div className="island-post-detail__tags" aria-label="??">
                {post.tags.map((tag) => <span key={tag}>#{tag}</span>)}
              </div>
            ) : null}
          </div>

          <div className="island-post-detail__comments">
            <span>? 0 ???</span>
            <p>???????????????????</p>
          </div>
        </div>

        <footer className="island-post-detail__actions">
          <button className="island-post-detail__comment-input" type="button">
            <img src={profile.avatarUrl} alt="" />
            <span>????...</span>
          </button>
          <button type="button" aria-label="??">
            <Heart aria-hidden="true" size={28} strokeWidth={2.4} />
            <span>0</span>
          </button>
          <button type="button" aria-label="??">
            <Star aria-hidden="true" size={28} strokeWidth={2.4} />
            <span>0</span>
          </button>
          <button type="button" aria-label="??">
            <MessageCircle aria-hidden="true" size={28} strokeWidth={2.4} />
            <span>0</span>
          </button>
          <button className="island-post-detail__share" type="button" aria-label="??">
            <Send aria-hidden="true" size={24} strokeWidth={2.4} />
          </button>
          <button className="island-post-detail__save" type="button" aria-label="??">
            <Bookmark aria-hidden="true" size={24} strokeWidth={2.4} />
          </button>
        </footer>
      </section>
    </article>
  )

  if (isIntercepted) {
    return (
      <div className="island-post-intercept">
        <div className="island-post-intercept__background" aria-hidden="true">
          <div className="island-post-intercept__shell">
            <SiteHeader profile={profile} />
            <main className="flex-1">
              <Gallery siteProfile={profile} />
            </main>
            <SiteFooter />
          </div>
        </div>
        <div className="island-post-intercept__overlay" role="dialog" aria-modal="true" aria-label={post.title}>
          <button className="island-post-intercept__backdrop" type="button" aria-label="????" onClick={closeDetail} />
          {detailArticle}
        </div>
      </div>
    )
  }

  return (
    <main className="island-post-route">
      {detailArticle}
    </main>
  )
}
