import { ArrowLeft, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'

import { IslandAvatar, IslandBadge, IslandPostContent, IslandVideoPlayer } from '@/components/island'
import { cn } from '@/lib/utils'

import { mobileContentClass, mobileSwitchButtonClass } from './post-detail.styles'
import { formatDisplayTime } from './post-detail.utils'
import type { UsePostDetailPageResult } from './usePostDetailPage'

type PostDetailMobileProps = {
  detail: UsePostDetailPageResult
}

export function PostDetailMobile({ detail }: PostDetailMobileProps) {
  const post = detail.post

  if (!post) return null

  return (
    <main className="flex min-h-dvh flex-col bg-[radial-gradient(circle_at_top,#eefcf2_0%,#dff3e7_100%)] text-[#5f4d39]">
      <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-[#d6eadf] bg-[rgba(245,252,246,0.92)] px-3 backdrop-blur-xl">
        <button className="grid size-9 place-items-center text-[#715d46] " type="button" aria-label="返回" onClick={detail.closeDetail}>
          <ArrowLeft aria-hidden="true" size={22} strokeWidth={2.6} />
        </button>
        <strong className="text-[17px] font-semibold text-[#5f4d39]">时间碎片</strong>
        <div className="size-9" aria-hidden="true" />
      </header>

      <section className="flex items-center gap-1 border-b border-[#d6eadf] bg-[rgba(249,252,248,0.66)] px-3.5 py-2">
        <IslandAvatar src={detail.profile.avatarUrl} alt={detail.profile.nickname} name={detail.profile.nickname} size="sm" shape="circle" className="shrink-0 size-8" />

        <div className="min-w-0 flex-1 mt-2">
          <div className="flex items-center gap-2 text-[14px] leading-none">
            <span className="truncate font-semibold text-[#5f4d39]">{detail.profile.nickname}</span>
            <span className="text-[#8bbdae]">•</span>
            <span className="truncate font-medium text-[#7fb3a7]">{detail.profile.handle}</span>
          </div>
          <time dateTime={post.time}>{formatDisplayTime(post.time)}</time>
        </div>
      </section>

      <section
        className={cn('relative w-full shrink-0 overflow-hidden bg-[linear-gradient(180deg,#f9f0de_0%,#e9ddc6_100%)]')}
        style={detail.mobileMediaStyle}
        onPointerCancel={detail.handleMobileMediaPointerCancel}
        onPointerDown={detail.handleMobileMediaPointerDown}
        onPointerUp={detail.handleMobileMediaPointerUp}
      >
        {detail.activeMedia?.type === 'video' ?
          <IslandVideoPlayer key={detail.activeMedia.src} src={detail.activeMedia.src} lockFrame onRatioReady={(src, w, h) => detail.recordMediaRatio(src, w, h)} />
        : <img
            key={detail.activeMedia?.src ?? post.imageSrc}
            className={cn('block size-full', 'object-cover')}
            src={detail.activeMedia?.src ?? post.imageSrc}
            alt={post.title}
            draggable={false}
            onLoad={(event) => detail.recordMediaRatio(detail.activeMedia?.src ?? post.imageSrc, event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)}
          />
        }

        {detail.activeMediaIndex > 0 ?
          <button
            className={cn(mobileSwitchButtonClass, 'left-3', detail.mobileMediaControlsVisible ? 'opacity-80' : 'pointer-events-none opacity-0')}
            type="button"
            aria-label="上一张"
            onClick={() => detail.switchMedia(-1)}
          >
            <ChevronLeft aria-hidden="true" size={16} strokeWidth={2.8} />
          </button>
        : null}

        {detail.activeMediaIndex < detail.mediaItems.length - 1 ?
          <button
            className={cn(mobileSwitchButtonClass, 'right-3', detail.mobileMediaControlsVisible ? 'opacity-80' : 'pointer-events-none opacity-0')}
            type="button"
            aria-label="下一张"
            onClick={() => detail.switchMedia(1)}
          >
            <ChevronRight aria-hidden="true" size={16} strokeWidth={2.8} />
          </button>
        : null}

        {detail.mediaItems.length > 1 ?
          <div className="absolute bottom-4 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full    px-2.5 py-1 " aria-label="图片页码">
            {detail.mediaItems.map((item, index) => (
              <button
                key={`${item.src}-${index}`}
                className={cn('h-1.5 w-1.5 rounded-full bg-white/55 transition-all duration-200', index === detail.activeMediaIndex && 'h-2 w-5 rounded-full bg-white ')}
                type="button"
                aria-label={`切换到第 ${index + 1} 张`}
                aria-current={index === detail.activeMediaIndex}
                onClick={() => detail.selectMediaIndex(index)}
              />
            ))}
          </div>
        : null}
      </section>

      <section className="flex flex-1 flex-col bg-[rgba(255,250,242,0.72)] px-3.5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-3.5">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-start gap-x-2 gap-y-1 text-[14px] text-[#5f4d39]">
            <span className="font-semibold">{post.title}</span>
          </div>

          <div className={mobileContentClass}>
            <IslandPostContent content={post.content} />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-medium uppercase tracking-[0.02em] text-[#9f8a71]">
            {detail.displayLocation ?
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <MapPin aria-hidden="true" size={12} strokeWidth={2.4} />
                <span className="truncate">{detail.displayLocation}</span>
              </span>
            : null}
          </div>

          {post.tags.length > 0 ?
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-medium text-[#7fb3a7]">
              {post.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center">
                  <IslandBadge>#{tag}</IslandBadge>
                </span>
              ))}
            </div>
          : null}
        </div>
      </section>
    </main>
  )
}
