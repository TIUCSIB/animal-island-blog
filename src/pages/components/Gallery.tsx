import { useSearchParams } from 'react-router'

import { IslandEmptyState, IslandGalleryGrid, IslandGalleryItem, IslandGalleryModal } from '@/components/island'
import type { SiteProfile } from '@/data/site-profile'
import { useGalleryPostsQuery } from '@/lib/query-hooks'

type GalleryProps = {
  siteProfile: SiteProfile
}

export function Gallery({ siteProfile }: GalleryProps) {
  const postsQuery = useGalleryPostsQuery()
  const posts = postsQuery.data ?? []
  const showEmptyState = !postsQuery.isPending && posts.length === 0
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('post')
  const selectedIndex = selectedId ? posts.findIndex((post) => post.id === selectedId) : -1
  const selectedPost = selectedIndex >= 0 ? posts[selectedIndex] : null
  const canPrevious = selectedIndex > 0
  const canNext = selectedIndex >= 0 && selectedIndex < posts.length - 1

  function setPostId(postId: string | null, replace = false) {
    const nextSearchParams = new URLSearchParams(searchParams)

    if (postId) {
      nextSearchParams.set('post', postId)
    } else {
      nextSearchParams.delete('post')
    }

    setSearchParams(nextSearchParams, { replace })
  }

  function switchPost(direction: -1 | 1) {
    if (selectedIndex < 0) return

    const nextIndex = selectedIndex + direction

    if (nextIndex < 0 || nextIndex >= posts.length) return

    setPostId(posts[nextIndex].id, true)
  }

  return (
    <>
      {posts.length > 0 ?
        <IslandGalleryGrid className="mt-4" minItemWidth="180px" gap="0px">
          {posts.map((post) => (
            <IslandGalleryItem
              key={post.id}
              radius="0px"
              imageSrc={post.imageSrc}
              imageAlt={post.title}
              title={post.title}
              location={post.location}
              pinned={post.pinned}
              ratio="portrait"
              contentPlacement="overlay"
              onOpen={() => setPostId(post.id)}
            />
          ))}
        </IslandGalleryGrid>
      : null}

      {showEmptyState ?
        <IslandEmptyState
          className="mt-4"
          icon="🌱"
          title={postsQuery.isError ? '文章读取失败' : '空'}
          // description={postsQuery.isError ? '接口暂时没有返回文章数据，请稍后再试。' : '后台发布文章后，这里就会出现新的照片。'}
        />
      : null}

      {selectedPost ?
        <IslandGalleryModal
          open={Boolean(selectedPost)}
          onOpenChange={(open) => {
            if (!open) setPostId(null, true)
          }}
          imageSrc={selectedPost.imageSrc}
          images={selectedPost.images}
          imageAlt={selectedPost.title}
          title={selectedPost.title}
          content={selectedPost.content}
          location={selectedPost.location}
          time={selectedPost.time}
          tags={selectedPost.tags}
          authorName={siteProfile.nickname}
          authorAvatar={siteProfile.avatarUrl}
          canPrevious={canPrevious}
          canNext={canNext}
          onPrevious={() => switchPost(-1)}
          onNext={() => switchPost(1)}
        />
      : null}
    </>
  )
}
