import { QueryClient } from '@tanstack/react-query'

export const queryKeys = {
  aboutContent: ['about-content'] as const,
  galleryPosts: ['gallery-posts'] as const,
  musicConfig: ['music-config'] as const,
  siteProfile: ['site-profile'] as const,
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
