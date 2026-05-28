import { ChevronLeft, ChevronRight, MapPin, MoreHorizontal, X } from 'lucide-react'

import { IslandAvatar, IslandBadge, IslandPostContent } from '@/components/island'
import { cn } from '@/lib/utils'
import { Gallery } from '@/pages/components/Gallery'
import { SiteFooter } from '@/pages/components/SiteFooter'
import { SiteHeader } from '@/pages/components/SiteHeader'

import { islandSwitchButtonClass, lightContentClass } from './post-detail.styles'
import { formatDate, formatDisplayTime } from './post-detail.utils'
import type { UsePostDetailPageResult } from './usePostDetailPage'

type PostDetailDesktopProps = {
  detail: UsePostDetailPageResult
}

function DesktopDetailCard({ detail }: PostDetailDesktopProps) {
  const post = detail.post

  if (!post) return null

  return (
    <article
      className="relative z-10 grid overflow-hidden rounded-[8px] bg-[#fff9f0] shadow-[0_6px_0_rgba(205,186,160,0.88),0_24px_80px_rgba(94,78,56,0.22)]"
      style={detail.desktopArticleStyle}
      aria-label={post.title}
    >
      <section className="group/media relative min-h-0 min-w-0 overflow-hidden bg-[linear-gradient(180deg,#f9f0de_0%,#e9ddc6_100%)]">
        <div className="relative flex size-full items-center justify-center overflow-hidden">
          {detail.activeMedia?.type === 'video' ?
            <video
              key={detail.activeMedia.src}
              className={cn('block size-full', detail.lockCarouselFrame ? 'object-cover' : 'object-contain')}
              src={detail.activeMedia.src}
              controls
              playsInline
              onLoadedMetadata={(event) => detail.recordMediaRatio(detail.activeMedia!.src, event.currentTarget.videoWidth, event.currentTarget.videoHeight)}
            />
          : <img
              key={detail.activeMedia?.src ?? post.imageSrc}
              className={cn('block size-full select-none', detail.lockCarouselFrame ? 'object-cover' : 'object-contain')}
              src={detail.activeMedia?.src ?? post.imageSrc}
              alt={post.title}
              draggable={false}
              onLoad={(event) => detail.recordMediaRatio(detail.activeMedia?.src ?? post.imageSrc, event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)}
            />
          }

          {detail.activeMediaIndex > 0 ?
            <button
              className={cn(
                'pointer-events-none absolute left-4 top-1/2 z-20 size-5 -translate-y-1/2 opacity-0 group-hover/media:pointer-events-auto group-hover/media:opacity-80',
                islandSwitchButtonClass,
              )}
              type="button"
              aria-label="上一张"
              onClick={() => detail.switchMedia(-1)}
            >
              <ChevronLeft aria-hidden="true" size={18} strokeWidth={3} />
            </button>
          : null}

          {detail.activeMediaIndex < detail.mediaItems.length - 1 ?
            <button
              className={cn(
                'pointer-events-none absolute right-4 top-1/2 z-20 size-5 -translate-y-1/2 opacity-0 group-hover/media:pointer-events-auto group-hover/media:opacity-80',
                islandSwitchButtonClass,
              )}
              type="button"
              aria-label="下一张"
              onClick={() => detail.switchMedia(1)}
            >
              <ChevronRight aria-hidden="true" size={18} strokeWidth={3} />
            </button>
          : null}

          {detail.mediaItems.length > 1 ?
            <div className="absolute bottom-4 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2" aria-label="图片页码">
              {detail.mediaItems.map((item, index) => (
                <button
                  key={`${item.src}-${index}`}
                  className={cn('h-2 w-2 rounded-full bg-white/55 transition-all duration-200', index === detail.activeMediaIndex && 'w-4 bg-white')}
                  type="button"
                  aria-label={`切换到第 ${index + 1} 张`}
                  aria-current={index === detail.activeMediaIndex}
                  onClick={() => detail.selectMediaIndex(index)}
                />
              ))}
            </div>
          : null}
        </div>
      </section>

      <section className="flex min-h-0 min-w-0 flex-col border-l border-[#eadcc3] bg-[rgba(255,250,242,0.96)] text-[#5f4d39]">
        <header className="flex h-[72px] flex-none items-center gap-3 border-b border-[#eadcc3] px-4 sm:px-5">
          <IslandAvatar src={detail.profile.avatarUrl} alt={detail.profile.nickname} name={detail.profile.nickname} size="sm" shape="circle" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[15px] font-semibold text-[#5f4d39]">
              <span className="truncate">{detail.profile.nickname}</span>
              <span className="text-[#b8a48c]">&middot;</span>
              <span className="truncate text-[#8bbdae]">{detail.profile.handle}</span>
            </div>
          </div>

          <MoreHorizontal aria-hidden="true" size={20} strokeWidth={2.6} />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-5">
          <div className="flex items-start gap-3">
            <IslandAvatar src={detail.profile.avatarUrl} alt={detail.profile.nickname} name={detail.profile.nickname} size="sm" shape="circle" className="shrink-0" />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px]  text-[#5f4d39]">
                <span className="font-semibold">{detail.profile.nickname}</span>
              </div>

              <div className={cn('mt-0.5', lightContentClass)}>
                <IslandPostContent content={post.content} />
              </div>

              <time className="mt-3 block text-[12px] font-medium text-[#a28d74]">{formatDisplayTime(post.time)}</time>
            </div>
          </div>
        </div>

        <footer className="flex-none border-t border-[#eadcc3] px-4 py-4 sm:px-5">
          <div className="space-y-3">
            {detail.displayLocation ?
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#8d7860]">
                <MapPin aria-hidden="true" size={14} strokeWidth={2.4} />
                <span className="truncate">{detail.displayLocation}</span>
              </div>
            : null}

            {post.tags.length > 0 ?
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <IslandBadge key={tag}>#{tag}</IslandBadge>
                ))}
              </div>
            : null}
          </div>

          <div className="mt-4 grid gap-1">
            <strong className="text-[15px] font-semibold text-[#5f4d39]">{post.title}</strong>
            <time className="text-sm text-[#9f8a71]" dateTime={post.time}>
              {formatDate(post.time)}
            </time>
          </div>
        </footer>
      </section>
    </article>
  )
}

export function PostDetailDesktop({ detail }: PostDetailDesktopProps) {
  if (detail.isIntercepted) {
    return (
      <div className="min-h-dvh ">
        <div className="pointer-events-none min-h-dvh select-none opacity-28 blur-[2px]" aria-hidden="true">
          <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 pt-7.5">
            <SiteHeader profile={detail.profile} />
            <main className="flex-1">
              <Gallery siteProfile={detail.profile} />
            </main>
            <SiteFooter />
          </div>
        </div>

        <div className="fixed inset-0 z-[80] " />
        <button className={cn('fixed right-5 top-5 z-[110] size-8', islandSwitchButtonClass)} type="button" aria-label="关闭详情" onClick={detail.closeDetail}>
          <X aria-hidden="true" size={24} strokeWidth={2.6} />
        </button>

        {detail.previousPost ?
          <button
            className={cn('fixed left-6 top-1/2 z-[95] hidden size-6 -translate-y-1/2 min-[1100px]:grid', islandSwitchButtonClass)}
            type="button"
            aria-label="上一篇文章"
            onClick={() => detail.switchPost(detail.previousPost!)}
          >
            <ChevronLeft aria-hidden="true" size={24} strokeWidth={3} />
          </button>
        : null}

        <div className="fixed inset-0 z-[90] grid place-items-center p-4">
          <button className="absolute inset-0 cursor-default bg-transparent" type="button" aria-label="关闭详情" onClick={detail.closeDetail} />
          <DesktopDetailCard detail={detail} />
        </div>

        {detail.nextPost ?
          <button
            className={cn('fixed right-6 top-1/2 z-[95] hidden size-6 -translate-y-1/2 min-[1100px]:grid', islandSwitchButtonClass)}
            type="button"
            aria-label="下一篇文章"
            onClick={() => detail.switchPost(detail.nextPost!)}
          >
            <ChevronRight aria-hidden="true" size={24} strokeWidth={3} />
          </button>
        : null}
      </div>
    )
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_top,#eefcf2_0%,#dff3e7_100%)] p-4">
      <button className={cn('fixed right-5 top-5 z-[110] size-8', islandSwitchButtonClass)} type="button" aria-label="关闭详情" onClick={detail.closeDetail}>
        <X aria-hidden="true" size={24} strokeWidth={2.6} />
      </button>
      <DesktopDetailCard detail={detail} />
    </main>
  )
}
