import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

import { IslandGalleryGrid, IslandGalleryItem, IslandGalleryModal } from '@/components/island'
import { galleryPosts } from '@/data/gallery'
import type { SiteProfile } from '@/data/site-profile'
import { fetchGalleryPosts } from '@/lib/posts-api'

type GalleryProps = {
  siteProfile: SiteProfile
}

export function Gallery({ siteProfile }: GalleryProps) {
  const [posts, setPosts] = useState(galleryPosts)
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('post')
  const selectedIndex = selectedId ? posts.findIndex((post) => post.id === selectedId) : -1
  const selectedPost = selectedIndex >= 0 ? posts[selectedIndex] : null
  const canPrevious = selectedIndex > 0
  const canNext = selectedIndex >= 0 && selectedIndex < posts.length - 1

  useEffect(() => {
    const controller = new AbortController()

    fetchGalleryPosts(controller.signal)
      .then((nextPosts) => {
        if (nextPosts.length > 0) {
          setPosts(nextPosts)
        }
      })
      .catch(() => {
        // 后端未启动时，继续使用本地占位数据。
      })

    return () => {
      controller.abort()
    }
  }, [])

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
