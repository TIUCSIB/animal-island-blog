import { useQuery } from '@tanstack/react-query'

import { fetchAboutContent, fetchGalleryPosts, fetchMusicConfig, fetchSiteProfile } from '@/lib/posts-api'
import { queryKeys } from '@/lib/query-client'

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

export function useGalleryPostsQuery() {
  return useQuery({
    queryKey: queryKeys.galleryPosts,
    queryFn: ({ signal }) => fetchGalleryPosts(signal),
  })
}

export function useMusicConfigQuery() {
  return useQuery({
    queryKey: queryKeys.musicConfig,
    queryFn: ({ signal }) => fetchMusicConfig(signal),
  })
}
