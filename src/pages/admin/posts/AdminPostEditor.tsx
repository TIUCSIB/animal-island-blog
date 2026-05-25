import type { FormEventHandler } from 'react'
import { Button, Card, Input, Switch } from 'animal-island-ui'
import { Bold, Code2, Heading1, Heading2, Heading3, Images, Italic, List, ListOrdered, MapPin, Plus, Save, Send, Smile, Strikethrough, Tags, Trash2, X } from 'lucide-react'

import type { GalleryPost } from '@/data/gallery'
import { AdminCloudinaryUploader } from '../media/AdminCloudinaryUploader'
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
}

const toolbarItems = [
  { label: 'H1', icon: <Heading1 size={16} strokeWidth={2.8} /> },
  { label: 'H2', icon: <Heading2 size={16} strokeWidth={2.8} /> },
  { label: 'H3', icon: <Heading3 size={16} strokeWidth={2.8} /> },
  { label: 'B', icon: <Bold size={16} strokeWidth={2.8} /> },
  { label: 'I', icon: <Italic size={16} strokeWidth={2.8} /> },
  { label: 'S', icon: <Strikethrough size={16} strokeWidth={2.8} /> },
  { label: 'UL', icon: <List size={16} strokeWidth={2.8} /> },
  { label: 'OL', icon: <ListOrdered size={16} strokeWidth={2.8} /> },
  { label: 'Code', icon: <Code2 size={16} strokeWidth={2.8} /> },
]

export function AdminPostEditor({ isWriteMode, selectedPost, form, token, saving, setForm, onDeletePost, onOpenMediaLibrary, onSave }: AdminPostEditorProps) {
  const imageUrls = getPostImageUrls(form.imagesText).slice(0, MAX_POST_IMAGES)
  const remainingImages = Math.max(0, MAX_POST_IMAGES - imageUrls.length)
  const contentLength = form.content.length

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

  return (
    <form className="island-admin-editor" onSubmit={onSave}>
      <Card className="island-admin-editor__card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="island-admin-editor__eyebrow">{isWriteMode ? '写文章' : '编辑文章'}</span>
            <h2>{form.title || (isWriteMode ? '新的小岛记录' : '未命名记录')}</h2>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!isWriteMode && selectedPost ? (
              <Button type="default" danger size="small" htmlType="button" icon={<Trash2 size={14} strokeWidth={3} />} onClick={() => onDeletePost(selectedPost)}>
                删除
              </Button>
            ) : null}
            <Button type="primary" size="small" htmlType="submit" icon={isWriteMode ? <Send size={14} strokeWidth={3} /> : <Save size={14} strokeWidth={3} />} loading={saving}>
              {isWriteMode ? '发布' : '更新'}
            </Button>
          </div>
        </div>

        <section className="rounded-[28px] border-2 border-[#c4b89e]/55 bg-[#fffdf7]/72 p-3 shadow-[0_4px_0_rgba(212,201,180,0.62)]">
          <Input className="max-w-sm" value={form.title} placeholder="写一个标题吧" onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />

          <div className="mt-3 flex flex-wrap items-center gap-2 border-b-2 border-[#c4b89e]/20 pb-3">
            {toolbarItems.map((item) => (
              <button key={item.label} className="grid size-9 place-items-center rounded-2xl text-[#725d42] transition hover:bg-[#d7f8e7] hover:text-[#117f77]" type="button" aria-label={item.label}>
                {item.icon}
              </button>
            ))}
          </div>

          <textarea
            className="mt-3 min-h-32 w-full resize-none rounded-3xl border-2 border-[#c4b89e]/32 bg-[#f8f8f0]/72 px-4 py-3 text-sm font-bold leading-7 text-[#725d42] outline-none transition placeholder:text-[#b8b1a6] focus:border-[#82d5bb]"
            maxLength={3000}
            value={form.content}
            placeholder="这一刻，你想说点什么..."
            onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
          />

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-[#9f927d]">
              <AdminCloudinaryUploader token={token} purpose="post-image" label="上传图片" multiple maxFiles={remainingImages} disabled={remainingImages === 0} onUploaded={(asset) => addImage(asset.secureUrl)} />
              <Button type="default" size="small" htmlType="button" icon={<Images size={14} strokeWidth={3} />} disabled={remainingImages === 0} onClick={() => onOpenMediaLibrary('gallery')}>
                图片库
              </Button>
              <Smile size={16} strokeWidth={2.6} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-[#aaa197]">{contentLength} / 3000</span>
              <label className="island-admin-switch island-admin-switch--fit">
                <span>置顶</span>
                <Switch size="small" checked={form.pinned} checkedChildren="ON" unCheckedChildren="OFF" onChange={(checked) => setForm((current) => ({ ...current, pinned: checked }))} />
              </label>
            </div>
          </div>
        </section>

        <section className="grid gap-3">
          <strong className="text-sm font-black text-[#9f927d]"># 最多 9 张图哟，第一张会作为封面</strong>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(86px,1fr))] gap-3">
            {imageUrls.map((url, index) => (
              <div key={url} className="relative aspect-square overflow-hidden rounded-[22px] border-2 border-[#fff8ec] bg-[#f8f8f0] shadow-[0_3px_0_rgba(196,184,158,0.58)]">
                <img className="size-full object-cover" src={url} alt={index === 0 ? '封面图片' : `文章图片 ${index + 1}`} />
                {index === 0 ? <span className="absolute left-2 top-2 rounded-full bg-[#f7cd67] px-2 py-0.5 text-[10px] font-black text-white shadow-[0_2px_0_rgba(169,117,24,0.32)]">封面</span> : null}
                <button className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-white/86 text-[#c94444] shadow-[0_2px_0_rgba(196,184,158,0.42)]" type="button" aria-label="移除图片" onClick={() => removeImage(url)}>
                  <X size={13} strokeWidth={3} />
                </button>
              </div>
            ))}

            {remainingImages > 0 ? (
              <button className="grid aspect-square place-items-center rounded-[22px] border-2 border-dashed border-[#c4b89e]/70 bg-[#fffdf7]/52 text-[#9f927d] transition hover:border-[#82d5bb] hover:bg-[#e6f9f6]/60 hover:text-[#117f77]" type="button" onClick={() => onOpenMediaLibrary('gallery')}>
                <Plus size={30} strokeWidth={2.8} />
              </button>
            ) : null}
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="island-admin-field">
            <span>地点</span>
            <Input value={form.location} placeholder="点击获取当前位置 / 手动输入" prefix={<MapPin size={15} strokeWidth={3} />} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
          </label>
          <label className="island-admin-field">
            <span>标签</span>
            <Input value={form.tagsText} placeholder="日常，散步，小狗" prefix={<Tags size={15} strokeWidth={3} />} onChange={(event) => setForm((current) => ({ ...current, tagsText: event.target.value }))} />
          </label>
        </div>
      </Card>
    </form>
  )
}
