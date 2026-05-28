import { useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { IslandEmptyState, IslandGalleryGrid, IslandGalleryItem } from '@/components/island'
import type { SiteProfile } from '@/data/site-profile'
import { useGalleryPostsQuery } from '@/lib/query-hooks'

type GalleryProps = {
  siteProfile: SiteProfile
}

function shouldOpenAsPage() {
  if (typeof window === 'undefined') return false

  return window.matchMedia('(max-width: 699px)').matches
}

export function Gallery({ siteProfile }: GalleryProps) {
  void siteProfile

  const navigate = useNavigate()
  const location = useLocation()
  const postsQuery = useGalleryPostsQuery()
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const hasNextPage = Boolean(postsQuery.hasNextPage)
  const isFetchingNextPage = postsQuery.isFetchingNextPage
  const fetchNextPage = postsQuery.fetchNextPage
  const posts = useMemo(() => postsQuery.data?.pages.flatMap((page) => page.posts) ?? [], [postsQuery.data])
  const showEmptyState = !postsQuery.isPending && posts.length === 0

  useEffect(() => {
    const target = loadMoreRef.current

    if (!target || !hasNextPage) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || isFetchingNextPage) return

        void fetchNextPage()
      },
      {
        rootMargin: '0px',
        threshold: 0.1,
      },
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return (
    <>
      {posts.length > 0 ?
        <IslandGalleryGrid className="island-home-gallery-grid mt-4" minItemWidth="180px" gap="0px">
          {posts.map((post) => {
            const mediaType = post.mediaType === 'video' ? 'video' : 'image'
            const imageCount = post.images?.filter(Boolean).length ?? (post.imageSrc ? 1 : 0)

            return (
              <IslandGalleryItem
                key={post.id}
                radius="0px"
                imageSrc={post.imageSrc}
                imageAlt={post.title}
                title={post.title}
                location={post.location}
                pinned={post.pinned}
                multiple={mediaType !== 'video' && imageCount > 1}
                mediaType={mediaType}
                ratio="portrait"
                contentPlacement="overlay"
                onOpen={() => {
                  const nextState = {
                    from: `${location.pathname}${location.search}`,
                    post,
                    posts,
                    intercepted: !shouldOpenAsPage(),
                  }

                  void navigate(`/posts/${encodeURIComponent(post.id)}`, {
                    state: nextState,
                  })
                }}
              />
            )
          })}
        </IslandGalleryGrid>
      : null}

      {showEmptyState ?
        <IslandEmptyState
          className="mt-4"
          icon="🌱"
          title={postsQuery.isError ? '文章读取失败' : '空空的小岛'}
        />
      : null}

      {posts.length > 0 && (hasNextPage || isFetchingNextPage) ?
        <div ref={loadMoreRef} className="mt-5 flex justify-center pb-2 text-xs font-black text-[#7db0a8]">
          {isFetchingNextPage ? '小岛继续加载中...' : '继续往下滑，会出现新的记录'}
        </div>
      : null}
    </>
  )
}
