import { useEffect, useRef, useState } from 'react'
import type { FormEventHandler } from 'react'
import type { Editor, JSONContent } from '@tiptap/core'
import { Button, Card, Input, Switch } from 'animal-island-ui'
import { Clapperboard, Image, Images, MapPin, Plus, Send, Settings2, Smile, Star, Tags, Trash2, Video, X } from 'lucide-react'

import { IslandPopover } from '@/components/island'
import type { GalleryPost } from '@/data/gallery'
import { AdminCloudinaryUploader } from '../media/AdminCloudinaryUploader'
import { AdminRichTextEditor } from './AdminRichTextEditor'
import { AdminStickerPanel, type AdminSticker } from './AdminStickerPanel'
import { appendPostImageUrl, appendPostVideoUrl, getPostImageUrls, getPostVideoUrls, MAX_POST_IMAGES, MAX_POST_VIDEOS, removePostImageUrl, removePostVideoUrl } from './post-media-utils'
import type { PostMediaLibraryMode } from './post-media-utils'
import type { PostForm, SetPostForm } from '../types'

type AdminPostEditorProps = {
  isWriteMode: boolean
  selectedPost: GalleryPost | null
  form: PostForm
  token: string
  saving: boolean
  setForm: SetPostForm
  onDeletePost: (post: GalleryPost) => void
  onOpenMediaLibrary: (mode: PostMediaLibraryMode) => void
  onSave: FormEventHandler<HTMLFormElement>
  compact?: boolean
  showDeleteAction?: boolean
}

type ComposePanelMode = 'images' | 'videos' | null

function createStickerInlineContent(sticker: AdminSticker): JSONContent[] {
  return [
    {
      type: 'image',
      attrs: {
        src: sticker.src,
        alt: sticker.alt,
        title: sticker.alt,
      },
    },
    {
      type: 'text',
      text: ' ',
    },
  ]
}

function canInsertStickerInline(editor: Editor) {
  const imageType = editor.schema.nodes.image
  if (!imageType) return false

  const { $from } = editor.state.selection

  try {
    for (let depth = $from.depth; depth >= 0; depth -= 1) {
      const parent = $from.node(depth)
      const index = $from.index(depth)

      if (parent.contentMatchAt(index).matchType(imageType)) return true
    }
  } catch {
    return false
  }

  return false
}

function appendStickerMarkdown(content: string, sticker: AdminSticker) {
  const stickerMarkdown = `![${sticker.alt}](${sticker.src})`

  return content.trim() ? `${content.trimEnd()}\n\n${stickerMarkdown}` : stickerMarkdown
}

export function AdminPostEditor({ isWriteMode, selectedPost, form, token, saving, setForm, onDeletePost, onOpenMediaLibrary, onSave, compact = false, showDeleteAction = true }: AdminPostEditorProps) {
  const [openPanel, setOpenPanel] = useState<ComposePanelMode>(() => {
    if (isWriteMode) return null
    return getPostVideoUrls(form.videosText).length > 0 ? 'videos' : 'images'
  })
  const [openPopover, setOpenPopover] = useState<'emoji' | 'settings' | null>(null)
  const richEditorRef = useRef<Editor | null>(null)
  const rawImageUrls = getPostImageUrls(form.imagesText).slice(0, MAX_POST_IMAGES)
  const videoUrls = getPostVideoUrls(form.videosText).slice(0, MAX_POST_VIDEOS)
  const imageUrls = videoUrls.length > 0 ? [] : rawImageUrls
  const hasImages = imageUrls.length > 0
  const hasVideos = videoUrls.length > 0
  const remainingImages = Math.max(0, MAX_POST_IMAGES - imageUrls.length)
  const remainingVideos = Math.max(0, MAX_POST_VIDEOS - videoUrls.length)
  const canAddImages = !hasVideos && remainingImages > 0
  const canAddVideos = !hasImages && remainingVideos > 0
  const canOpenImagePanel = !hasVideos
  const canOpenVideoPanel = !hasImages

  const resolvedOpenPanel =
    hasVideos ? 'videos'
    : hasImages ? 'images'
    : openPanel

  function addImage(url: string, width?: number, height?: number) {
    setForm((current) => {
      if (getPostVideoUrls(current.videosText).length > 0) return current

      const currentImages = getPostImageUrls(current.imagesText)
      const isFirstImage = currentImages.length === 0

      return {
        ...current,
        imagesText: appendPostImageUrl(current.imagesText, url),
        ...(isFirstImage && width && height ? { coverWidth: width, coverHeight: height } : {}),
      }
    })
  }

  function removeImage(url: string) {
    setForm((current) => ({
      ...current,
      imagesText: removePostImageUrl(current.imagesText, url),
    }))
  }

  function addVideo(url: string, width?: number, height?: number) {
    setForm((current) => {
      if (getPostImageUrls(current.imagesText).length > 0) return current

      const currentVideos = getPostVideoUrls(current.videosText)
      const isFirstVideo = currentVideos.length === 0

      return {
        ...current,
        videosText: appendPostVideoUrl(current.videosText, url),
        ...(isFirstVideo && width && height ? { coverWidth: width, coverHeight: height } : {}),
      }
    })
  }

  function removeVideo(url: string) {
    setForm((current) => ({
      ...current,
      videosText: removePostVideoUrl(current.videosText, url),
    }))
  }

  function addSticker(sticker: AdminSticker) {
    if (richEditorRef.current) {
      const editor = richEditorRef.current
      const inlineContent = createStickerInlineContent(sticker)
      const stickerContent: JSONContent | JSONContent[] =
        canInsertStickerInline(editor) ? inlineContent : (
          {
            type: 'paragraph',
            content: inlineContent,
          }
        )

      try {
        if (editor.chain().focus().insertContent(stickerContent).run()) return
      } catch (error) {
        console.warn('[AdminPostEditor] insert sticker failed, fallback to markdown append.', error)
      }
    }

    setForm((current) => ({
      ...current,
      content: appendStickerMarkdown(current.content, sticker),
    }))
  }

  function togglePanel(panel: Exclude<ComposePanelMode, null>) {
    if (panel === 'images' && !canOpenImagePanel) return
    if (panel === 'videos' && !canOpenVideoPanel) return

    setOpenPopover(null)
    setOpenPanel((current) => (current === panel ? null : panel))
  }

  function openMediaLibrary(mode: PostMediaLibraryMode) {
    if (mode === 'gallery' && !canAddImages) return
    if (mode === 'videos' && !canAddVideos) return

    setOpenPopover(null)
    setOpenPanel(mode === 'videos' ? 'videos' : 'images')
    onOpenMediaLibrary(mode)
  }

  // Auto-detect cover dimensions when editing an existing post without them
  useEffect(() => {
    if (form.coverWidth && form.coverHeight) return

    const firstMedia = hasVideos ? videoUrls[0] : imageUrls[0]
    if (!firstMedia) return

    if (hasVideos) {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = firstMedia
      video.onloadedmetadata = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          setForm((current) => {
            if (current.coverWidth && current.coverHeight) return current
            return { ...current, coverWidth: video.videoWidth, coverHeight: video.videoHeight }
          })
        }
      }
      return
    }

    const img = document.createElement('img')
    img.src = firstMedia
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setForm((current) => {
          if (current.coverWidth && current.coverHeight) return current
          return { ...current, coverWidth: img.naturalWidth, coverHeight: img.naturalHeight }
        })
      }
    }
  }, [form.coverWidth, form.coverHeight, hasVideos, videoUrls, imageUrls, setForm])

  const iconButtonClass = 'island-admin-compose-icon'
  const activeIconButtonClass = 'island-admin-compose-icon--active'

  return (
    <form
      className={['island-admin-editor', isWriteMode && 'island-admin-editor--write', compact && 'island-admin-editor--compact', openPopover === 'emoji' && 'island-admin-editor--emoji-open']
        .filter(Boolean)
        .join(' ')}
      onSubmit={onSave}
    >
      <Card className="island-admin-editor__card overflow-visible">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="island-admin-editor__eyebrow">{isWriteMode ? '\u5199\u6587\u7ae0' : '\u7f16\u8f91\u6587\u7ae0'}</span>
            <h2>
              {compact ?
                isWriteMode ?
                  '\u65b0\u7684\u5c0f\u5c9b\u8bb0\u5f55'
                : '\u7f16\u8f91\u5c0f\u5c9b\u8bb0\u5f55'
              : form.title || (isWriteMode ? '\u65b0\u7684\u5c0f\u5c9b\u8bb0\u5f55' : '\u672a\u547d\u540d\u8bb0\u5f55')}
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {showDeleteAction && !isWriteMode && selectedPost ?
              <Button type="default" danger size="small" htmlType="button" icon={<Trash2 size={14} strokeWidth={3} />} onClick={() => onDeletePost(selectedPost)}>
                删除
              </Button>
            : null}
          </div>
        </div>

        <section className="island-admin-compose-box relative rounded-[28px] border-2 border-[#c4b89e]/55 bg-[#fffdf7]/72 p-3 shadow-[0_4px_0_rgba(212,201,180,0.62)]">
          <div className="island-admin-compose-title">
            <Input value={form.title} placeholder="写一个标题吧" onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          </div>

          <AdminRichTextEditor
            value={form.content}
            maxLength={200}
            externalEditorRef={richEditorRef}
            onChange={(content) =>
              setForm((current) => ({
                ...current,
                content,
              }))
            }
          />

          <div className="island-admin-compose-bottom mt-1 flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2 text-[#9f927d]">
              <button
                className={[iconButtonClass, resolvedOpenPanel === 'images' && activeIconButtonClass].filter(Boolean).join(' ')}
                type="button"
                aria-label="Manage images"
                disabled={!canOpenImagePanel}
                onClick={() => togglePanel('images')}
              >
                <Image size={17} strokeWidth={2.8} />
              </button>
              <button className={iconButtonClass} type="button" aria-label="Open image library" disabled={!canAddImages} onClick={() => openMediaLibrary('gallery')}>
                <Images size={17} strokeWidth={2.8} />
              </button>
              <button
                className={[iconButtonClass, resolvedOpenPanel === 'videos' && activeIconButtonClass].filter(Boolean).join(' ')}
                type="button"
                aria-label="Manage video"
                disabled={!canOpenVideoPanel}
                onClick={() => togglePanel('videos')}
              >
                <Video size={17} strokeWidth={2.8} />
              </button>
              <span className="mx-1 h-5 w-px bg-[#c4b89e]/28" />

              <IslandPopover
                open={openPopover === 'emoji'}
                onOpenChange={(open) => setOpenPopover(open ? 'emoji' : null)}
                contentClassName="island-admin-sticker-popover"
                placement="bottom"
                trigger={
                  <button
                    className={[iconButtonClass, openPopover === 'emoji' && activeIconButtonClass].filter(Boolean).join(' ')}
                    type="button"
                    aria-label="表情"
                    onClick={() => setOpenPopover((current) => (current === 'emoji' ? null : 'emoji'))}
                  >
                    <Smile size={17} strokeWidth={2.8} />
                  </button>
                }
              >
                <AdminStickerPanel pageSize={compact ? 25 : 45} onSelect={addSticker} />
              </IslandPopover>
              <IslandPopover
                open={openPopover === 'settings'}
                onOpenChange={(open) => setOpenPopover(open ? 'settings' : null)}
                contentClassName="w-[17.5rem]"
                trigger={
                  <button
                    className={[iconButtonClass, openPopover === 'settings' && activeIconButtonClass].filter(Boolean).join(' ')}
                    type="button"
                    aria-label="文章设置"
                    onClick={() => setOpenPopover((current) => (current === 'settings' ? null : 'settings'))}
                  >
                    <Settings2 size={17} strokeWidth={2.8} />
                  </button>
                }
              >
                <strong className="flex items-center gap-1.5 text-sm font-black text-[#4d3f2c]">⚙️ 设置</strong>
                <label className="grid grid-cols-[42px_minmax(0,1fr)] items-center gap-2 text-xs font-black">
                  <span>地点</span>
                  <Input
                    size="small"
                    value={form.location}
                    placeholder="附近 / Taipei"
                    prefix={<MapPin size={14} strokeWidth={3} />}
                    onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                  />
                </label>
                <label className="grid grid-cols-[42px_minmax(0,1fr)] items-center gap-2 text-xs font-black">
                  <span>标签</span>
                  <Input
                    size="small"
                    value={form.tagsText}
                    placeholder="日常，散步，小狗"
                    prefix={<Tags size={14} strokeWidth={3} />}
                    onChange={(event) => setForm((current) => ({ ...current, tagsText: event.target.value }))}
                  />
                </label>
                <label className="flex items-center gap-3 rounded-2xl text-xs font-black">
                  <span>置顶文章</span>
                  <Switch size="small" checked={form.pinned} checkedChildren="ON" unCheckedChildren="OFF" onChange={(checked) => setForm((current) => ({ ...current, pinned: checked }))} />
                </label>
              </IslandPopover>
            </div>
            <div className="flex items-center gap-3 self-center">
              <Button type="primary" size="small" htmlType="submit" icon={<Send size={16} strokeWidth={3} />} loading={saving} />
            </div>
          </div>
        </section>

        {resolvedOpenPanel === 'images' ?
          <section className="island-admin-compose-panel grid gap-3 border-t border-[#c4b89e]/18 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong className="text-[10px] font-black text-[#9f927d]"># 最多 9 张图片；第一张会作为封面</strong>
              <Button type="default" size="small" htmlType="button" icon={<Images size={14} strokeWidth={3} />} disabled={!canAddImages} onClick={() => openMediaLibrary('gallery')}>
                图片库{' '}
              </Button>
            </div>
            <div className="island-admin-compose-image-grid grid grid-cols-[repeat(3,68px)] justify-start gap-2">
              {imageUrls.map((url, index) => (
                <div key={url} className="group relative aspect-square overflow-hidden rounded-[14px] border-[1.5px] border-[#fff8ec] bg-[#f8f8f0]">
                  <img className="size-full object-cover" src={url} alt={index === 0 ? '封面图片' : `文章图片 ${index + 1}`} />
                  <span
                    className="absolute inset-0 z-1 bg-linear-180 from-[#564226]/6 to-[#564226]/18 bg-[#19c8b9]/10 opacity-0 transition-opacity duration-150 group-hover:opacity-100 pointer-events-none"
                    aria-hidden="true"
                  />
                  {index === 0 ?
                    <span
                      className="absolute left-0 top-0 z-2 grid size-[22px] place-items-center rounded-br-[12px] border-0 bg-linear-135 from-[#f7cd67] to-[#ffe39b] p-0 text-[#7a5420] shadow-[0_1px_0_rgba(169,117,24,0.22)]"
                      aria-label="封面图片"
                    >
                      <Star size={10} strokeWidth={3} fill="currentColor" />
                    </span>
                  : null}
                  <button
                    className="absolute right-[4px] top-[4px] z-2 grid size-[18px] scale-78 place-items-center rounded-full bg-[#fffdf7]/94 text-[#c94444] opacity-0 shadow-none transition-all duration-150 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100"
                    type="button"
                    aria-label="移除图片"
                    onClick={() => removeImage(url)}
                  >
                    <X size={11} strokeWidth={3} />
                  </button>
                </div>
              ))}

              {canAddImages ?
                <AdminCloudinaryUploader
                  token={token}
                  purpose="post-image"
                  assetLabel="图片"
                  multiple
                  maxFiles={remainingImages}
                  onUploaded={(asset) => addImage(asset.secureUrl, asset.width, asset.height)}
                  renderTrigger={({ disabled, uploading, open }) => (
                    <button
                      className="island-admin-compose-upload-tile grid aspect-square w-full place-items-center rounded-[14px] border-[1.5px] border-dashed border-[#c4b89e]/70 bg-[#fffdf7]/52 text-[#9f927d] transition hover:border-[#82d5bb] hover:bg-[#e6f9f6]/60 hover:text-[#117f77] disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      disabled={disabled}
                      onClick={open}
                    >
                      {uploading ?
                        <span className="text-xs font-black">上传中...</span>
                      : <Plus size={22} strokeWidth={2.8} />}
                    </button>
                  )}
                />
              : null}
            </div>
          </section>
        : null}

        {resolvedOpenPanel === 'videos' ?
          <section className="island-admin-compose-panel grid gap-3 border-t border-[#c4b89e]/18 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong className="text-[10px] font-black text-[#9f927d]"># 最多 1 个视频</strong>
              <Button type="default" size="small" htmlType="button" icon={<Clapperboard size={14} strokeWidth={3} />} disabled={!canAddVideos} onClick={() => openMediaLibrary('videos')}>
                视频库{' '}
              </Button>
            </div>
            <div className="island-admin-compose-image-grid grid grid-cols-[repeat(3,68px)] justify-start gap-2">
              {videoUrls.map((url) => (
                <div key={url} className="group relative aspect-square overflow-hidden rounded-[14px] border-[1.5px] border-[#fff8ec] bg-[#f8f8f0]">
                  <video className="size-full object-cover" src={url} muted playsInline preload="metadata" />
                  <span
                    className="absolute inset-0 z-1 bg-linear-180 from-[#564226]/6 to-[#564226]/18 bg-[#19c8b9]/10 opacity-0 transition-opacity duration-150 group-hover:opacity-100 pointer-events-none"
                    aria-hidden="true"
                  />
                  <button
                    className="absolute right-[4px] top-[4px] z-2 grid size-[18px] scale-78 place-items-center rounded-full bg-[#fffdf7]/94 text-[#c94444] opacity-0 shadow-none transition-all duration-150 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100"
                    type="button"
                    aria-label="移除视频"
                    onClick={() => removeVideo(url)}
                  >
                    <X size={11} strokeWidth={3} />
                  </button>
                </div>
              ))}

              {canAddVideos ?
                <AdminCloudinaryUploader
                  token={token}
                  purpose="post-video"
                  resourceType="video"
                  accept="video/*"
                  assetLabel="视频"
                  maxFiles={remainingVideos}
                  onUploaded={(asset) => addVideo(asset.secureUrl, asset.width, asset.height)}
                  renderTrigger={({ disabled, uploading, open }) => (
                    <button
                      className="island-admin-compose-upload-tile grid aspect-square w-full place-items-center rounded-[14px] border-[1.5px] border-dashed border-[#c4b89e]/70 bg-[#fffdf7]/52 text-[#9f927d] transition hover:border-[#82d5bb] hover:bg-[#e6f9f6]/60 hover:text-[#117f77] disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      disabled={disabled}
                      onClick={open}
                    >
                      {uploading ?
                        <span className="text-xs font-black">上传中...</span>
                      : <Plus size={22} strokeWidth={2.8} />}
                    </button>
                  )}
                />
              : null}
            </div>
          </section>
        : null}
      </Card>
    </form>
  )
}
