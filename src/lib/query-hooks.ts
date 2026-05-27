import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import type { GalleryPost } from '@/data/gallery'
import { fetchAboutContent, fetchAdminProfile, fetchGalleryPostById, fetchGalleryPostsPage, fetchMusicConfig, fetchSiteProfile } from '@/lib/posts-api'
import { queryKeys } from '@/lib/query-client'

const HOME_POST_PAGE_SIZE = 6

export function useSiteProfileQuery() {
  return useQuery({
    queryKey: queryKeys.siteProfile,
    queryFn: ({ signal }) => fetchSiteProfile(signal),
  })
}

export function useAboutContentQuery() {
  return useQuery({
    queryKey: queryKeys.aboutContent,
    queryFn: ({ signal }) => fetchAboutContent(signal),
  })
}

export function useAdminProfileQuery(token: string) {
  return useQuery({
    queryKey: queryKeys.adminProfile(token),
    queryFn: () => fetchAdminProfile(token),
    enabled: Boolean(token),
    retry: false,
  })
}

export function useGalleryPostsQuery() {
  return useInfiniteQuery({
    queryKey: queryKeys.galleryPosts,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => fetchGalleryPostsPage(pageParam, HOME_POST_PAGE_SIZE, signal),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination

      return page < totalPages ? page + 1 : undefined
    },
  })
}

export function useGalleryPostQuery(postId: string, initialPost?: GalleryPost) {
  return useQuery({
    queryKey: queryKeys.galleryPost(postId),
    queryFn: ({ signal }) => fetchGalleryPostById(postId, signal),
    enabled: Boolean(postId),
    initialData: initialPost,
  })
}

export function useMusicConfigQuery() {
  return useQuery({
    queryKey: queryKeys.musicConfig,
    queryFn: ({ signal }) => fetchMusicConfig(signal),
  })
}
