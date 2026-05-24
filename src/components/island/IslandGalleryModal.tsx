import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Modal, Typewriter } from 'animal-island-ui'
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, MoreHorizontal, X } from 'lucide-react'

import './island.css'

export interface IslandGalleryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string
  images?: string[]
  imageAlt?: string
  title: string
  content: string
  location: string
  time: string
  tags?: string[]
  authorName?: string
  authorAvatar?: string
  canPrevious?: boolean
  canNext?: boolean
  onPrevious?: () => void
  onNext?: () => void
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

export function IslandGalleryModal({
  open,
  onOpenChange,
  imageSrc,
  images,
  imageAlt = '',
  title,
  content,
  location,
  time,
  tags = [],
  authorName = 'mewbarkjoy',
  authorAvatar = 'https://www.loliapi.com/acg/pp',
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}: IslandGalleryModalProps) {
  const previousPostEnabled = Boolean(onPrevious) && (canPrevious ?? true)
  const nextPostEnabled = Boolean(onNext) && (canNext ?? true)
  const imageList = images?.length ? images : [imageSrc]
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const previousImageEnabled = activeImageIndex > 0
  const nextImageEnabled = activeImageIndex < imageList.length - 1

  useEffect(() => {
    setActiveImageIndex(0)
  }, [imageSrc, images])

  function switchImage(direction: -1 | 1) {
    setActiveImageIndex((current) => {
      const next = current + direction

      if (next < 0 || next >= imageList.length) return current

      return next
    })
  }

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft' && previousImageEnabled) {
        event.preventDefault()
        switchImage(-1)
      }

      if (event.key === 'ArrowRight' && nextImageEnabled) {
        event.preventDefault()
        switchImage(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [nextImageEnabled, open, previousImageEnabled])

  return (
    <>
      <Modal
        open={open}
        width="min(760px, calc(100vw - 32px))"
        footer={null}
        maskClosable
        typewriter={false}
        className="island-gallery-animal-modal"
        onClose={() => onOpenChange(false)}
      >
        <article className="island-gallery-animal-modal__panel">
          <div className="island-gallery-animal-modal__image-wrap">
            <img className="island-gallery-animal-modal__image" src={imageList[activeImageIndex]} alt={imageAlt || title} />

            {previousImageEnabled ? (
              <button className="island-gallery-animal-modal__image-nav island-gallery-animal-modal__image-nav--prev" type="button" aria-label="上一张图片" onClick={() => switchImage(-1)}>
                <ChevronLeft aria-hidden="true" size={24} strokeWidth={3} />
              </button>
            ) : null}

            {nextImageEnabled ? (
              <button className="island-gallery-animal-modal__image-nav island-gallery-animal-modal__image-nav--next" type="button" aria-label="下一张图片" onClick={() => switchImage(1)}>
                <ChevronRight aria-hidden="true" size={24} strokeWidth={3} />
              </button>
            ) : null}

            {imageList.length > 1 ? (
              <span className="island-gallery-animal-modal__image-count">
                {activeImageIndex + 1} / {imageList.length}
              </span>
            ) : null}
          </div>

          <section className="island-gallery-animal-modal__detail">
            <header className="island-gallery-animal-modal__account">
              <img className="island-gallery-animal-modal__avatar" src={authorAvatar} alt="" />
              <div className="island-gallery-animal-modal__account-main">
                <strong>{authorName}</strong>
                <span>关注</span>
              </div>
              <MoreHorizontal className="island-gallery-animal-modal__more" aria-hidden="true" size={20} strokeWidth={3} />

              <button className="island-gallery-animal-modal__close" type="button" aria-label="关闭详情" onClick={() => onOpenChange(false)}>
                <X aria-hidden="true" size={18} strokeWidth={3} />
              </button>
            </header>

            <div className="island-gallery-animal-modal__body">
              <div className="island-gallery-animal-modal__caption">
                <img className="island-gallery-animal-modal__avatar island-gallery-animal-modal__avatar--small" src={authorAvatar} alt="" />
                <div>
                  <p className="island-gallery-animal-modal__caption-title">
                    <strong>{authorName}</strong>
                  </p>
                  <p className="island-gallery-animal-modal__content">
                    <Typewriter speed={35} trigger={`${open}-${title}-${time}-${content}`}>
                      {content}
                    </Typewriter>
                  </p>
                </div>
              </div>

              <div className="island-gallery-animal-modal__meta">
                <span className="island-gallery-animal-modal__meta-item">
                  <MapPin aria-hidden="true" size={14} strokeWidth={2.8} />
                  {location}
                </span>
                <span className="island-gallery-animal-modal__meta-item">
                  <CalendarDays aria-hidden="true" size={14} strokeWidth={2.8} />
                  <time dateTime={time}>{formatDisplayTime(time)}</time>
                </span>
              </div>

              {tags.length > 0 ? (
                <div className="island-gallery-animal-modal__plain-tags" aria-label="标签">
                  {tags.map((tag) => (
                    <span key={tag} className="island-gallery-animal-modal__plain-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <footer className="island-gallery-animal-modal__footer">
              <strong>{title}</strong>
              <time dateTime={time}>{formatDisplayTime(time)}</time>
            </footer>
          </section>
        </article>
      </Modal>

      {open && previousPostEnabled
        ? createPortal(
            <button className="island-gallery-post-nav island-gallery-post-nav--prev" type="button" aria-label="上一篇文章" onClick={onPrevious}>
              <ChevronLeft aria-hidden="true" size={28} strokeWidth={3} />
            </button>,
            document.body,
          )
        : null}

      {open && nextPostEnabled
        ? createPortal(
            <button className="island-gallery-post-nav island-gallery-post-nav--next" type="button" aria-label="下一篇文章" onClick={onNext}>
              <ChevronRight aria-hidden="true" size={28} strokeWidth={3} />
            </button>,
            document.body,
          )
        : null}
    </>
  )
}
