import { useRef, useState } from 'react'
import type { FormEventHandler } from 'react'
import type { Editor } from '@tiptap/core'
import { Button, Card, Input, Switch } from 'animal-island-ui'
import { Image, Images, MapPin, Plus, Send, Settings2, Smile, Star, Tags, Trash2, Video, X } from 'lucide-react'

import { IslandPopover } from '@/components/island'
import type { GalleryPost } from '@/data/gallery'
import { AdminCloudinaryUploader } from '../media/AdminCloudinaryUploader'
import { AdminRichTextEditor } from './AdminRichTextEditor'
import { AdminStickerPanel, type AdminSticker } from './AdminStickerPanel'
import { appendPostImageUrl, getPostImageUrls, MAX_POST_IMAGES, removePostImageUrl } from './post-media-utils'
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

export function AdminPostEditor({ isWriteMode, selectedPost, form, token, saving, setForm, onDeletePost, onOpenMediaLibrary, onSave, compact = false, showDeleteAction = true }: AdminPostEditorProps) {
  const [openPanel, setOpenPanel] = useState<'image' | 'emoji' | 'settings' | null>(() => (!isWriteMode ? 'image' : null))
  const richEditorRef = useRef<Editor | null>(null)
  const imageUrls = getPostImageUrls(form.imagesText).slice(0, MAX_POST_IMAGES)
  const remainingImages = Math.max(0, MAX_POST_IMAGES - imageUrls.length)

  function addImage(url: string) {
    setForm((current) => ({
      ...current,
      imagesText: appendPostImageUrl(current.imagesText, url),
    }))
  }

  function removeImage(url: string) {
    setForm((current) => ({
      ...current,
      imagesText: removePostImageUrl(current.imagesText, url),
    }))
  }

  function addSticker(sticker: AdminSticker) {
    if (richEditorRef.current) {
      richEditorRef.current.chain().focus().setImage({ src: sticker.src, alt: sticker.alt, title: sticker.alt }).run()
      return
    }

    const stickerMarkdown = `![${sticker.alt}](${sticker.src})`

    setForm((current) => ({
      ...current,
      content: current.content.trim() ? `${current.content.trimEnd()}\n\n${stickerMarkdown}` : stickerMarkdown,
    }))
  }

  const iconButtonClass = 'island-admin-compose-icon'
  const activeIconButtonClass = 'island-admin-compose-icon--active'

  return (
    <form className={['island-admin-editor', isWriteMode && 'island-admin-editor--write', compact && 'island-admin-editor--compact'].filter(Boolean).join(' ')} onSubmit={onSave}>
      <Card className="island-admin-editor__card overflow-visible">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="island-admin-editor__eyebrow">{isWriteMode ? '写文章' : '编辑文章'}</span>
            <h2>
              {compact ?
                isWriteMode ?
                  '新的小岛记录'
                : '编辑小岛记录'
              : form.title || (isWriteMode ? '新的小岛记录' : '未命名记录')}
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

          <div className="island-admin-compose-bottom flex flex-wrap items-center justify-between gap-3 mt-1">
            <div className="flex flex-wrap items-center gap-2 text-[#9f927d]">
              <button
                className={[iconButtonClass, openPanel === 'image' && activeIconButtonClass].filter(Boolean).join(' ')}
                type="button"
                aria-label="上传图片"
                disabled={remainingImages === 0}
                onClick={() => setOpenPanel((current) => (current === 'image' ? null : 'image'))}
              >
                <Image size={17} strokeWidth={2.8} />
              </button>
              <button
                className={iconButtonClass}
                type="button"
                aria-label="图片库"
                disabled={remainingImages === 0}
                onClick={() => {
                  setOpenPanel('image')
                  onOpenMediaLibrary('gallery')
                }}
              >
                <Images size={17} strokeWidth={2.8} />
              </button>
              <button className={iconButtonClass} type="button" aria-label="视频" disabled>
                <Video size={17} strokeWidth={2.8} />
              </button>
              <span className="mx-1 h-5 w-px bg-[#c4b89e]/28" />

              <button
                className={[iconButtonClass, openPanel === 'emoji' && activeIconButtonClass].filter(Boolean).join(' ')}
                type="button"
                aria-label="表情"
                onClick={() => setOpenPanel((current) => (current === 'emoji' ? null : 'emoji'))}
              >
                <Smile size={17} strokeWidth={2.8} />
              </button>
              <IslandPopover
                open={openPanel === 'settings'}
                onOpenChange={(open) => setOpenPanel(open ? 'settings' : null)}
                contentClassName="w-[17.5rem]"
                trigger={
                  <button
                    className={[iconButtonClass, openPanel === 'settings' && activeIconButtonClass].filter(Boolean).join(' ')}
                    type="button"
                    aria-label="文章设置"
                    onClick={() => setOpenPanel((current) => (current === 'settings' ? null : 'settings'))}
                  >
                    <Settings2 size={17} strokeWidth={2.8} />
                  </button>
                }
              >
                <strong className="flex items-center gap-1.5 text-sm font-black text-[#4d3f2c]">🤗 设置</strong>
                <label className="grid grid-cols-[42px_minmax(0,1fr)] items-center gap-2 text-xs font-black">
                  <span>地点</span>
                  <Input
                    size="small"
                    value={form.location}
                    placeholder="家附近 / Taipei"
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
                <label className="flex items-center  gap-3 rounded-2xl  text-xs font-black">
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

        {openPanel === 'image' ?
          <section className="island-admin-compose-panel grid gap-3 border-t border-[#c4b89e]/18 py-2">
            <strong className="text-[10px] font-black text-[#9f927d]"># 最多 9 张图哟，第一张会作为封面</strong>
            <div className="island-admin-compose-image-grid grid grid-cols-[repeat(auto-fill,minmax(86px,1fr))] gap-3">
              {imageUrls.map((url, index) => (
                <div
                  key={url}
                  className="island-admin-compose-image-tile relative aspect-square overflow-hidden rounded-[22px] border-2 border-[#fff8ec] bg-[#f8f8f0] shadow-[0_3px_0_rgba(196,184,158,0.58)]"
                >
                  <img className="size-full object-cover" src={url} alt={index === 0 ? '封面图片' : `文章图片 ${index + 1}`} />
                  <span className="island-admin-compose-image-overlay" aria-hidden="true" />
                  {index === 0 ?
                    <span className="island-admin-compose-cover-badge absolute" aria-label="封面图片">
                      <Star size={10} strokeWidth={3} fill="currentColor" />
                    </span>
                  : null}
                  <button
                    className="island-admin-compose-image-remove absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-white/86 text-[#c94444] shadow-[0_2px_0_rgba(196,184,158,0.42)]"
                    type="button"
                    aria-label="移除图片"
                    onClick={() => removeImage(url)}
                  >
                    <X size={13} strokeWidth={3} />
                  </button>
                </div>
              ))}

              {remainingImages > 0 ?
                <AdminCloudinaryUploader
                  token={token}
                  purpose="post-image"
                  multiple
                  maxFiles={remainingImages}
                  onUploaded={(asset) => addImage(asset.secureUrl)}
                  renderTrigger={({ disabled, uploading, open }) => (
                    <button
                      className="island-admin-compose-upload-tile grid aspect-square w-full place-items-center rounded-[22px] border-2 border-dashed border-[#c4b89e]/70 bg-[#fffdf7]/52 text-[#9f927d] transition hover:border-[#82d5bb] hover:bg-[#e6f9f6]/60 hover:text-[#117f77] disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      disabled={disabled}
                      onClick={open}
                    >
                      {uploading ?
                        <span className="text-xs font-black">上传中</span>
                      : <Plus size={30} strokeWidth={2.8} />}
                    </button>
                  )}
                />
              : null}
            </div>
          </section>
        : null}

        {openPanel === 'emoji' ?
          <AdminStickerPanel onSelect={addSticker} />
        : null}
      </Card>
    </form>
  )
}
