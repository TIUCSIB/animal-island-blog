import type { FormEventHandler } from 'react'
import { Button, Card, Input, Switch } from 'animal-island-ui'
import { CalendarDays, ImagePlus, Images, MapPin, Pencil, Save, Tags, Trash2 } from 'lucide-react'

import type { GalleryPost } from '@/data/gallery'
import { AdminCloudinaryUploader } from '../media/AdminCloudinaryUploader'
import { appendPostImageUrl } from './post-media-utils'
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

export function AdminPostEditor({ isWriteMode, selectedPost, form, token, saving, setForm, onDeletePost, onOpenMediaLibrary, onSave }: AdminPostEditorProps) {
  return (
    <form className="island-admin-editor" onSubmit={onSave}>
      <Card className="island-admin-editor__card">
        <div className="island-admin-editor__header">
          <div>
            <span className="island-admin-editor__eyebrow">{isWriteMode ? '写文章' : '编辑文章'}</span>
            <h2>{form.title || (isWriteMode ? '新的小岛记录' : '未命名记录')}</h2>
          </div>
          <div className="island-admin-editor__header-actions">
            {!isWriteMode && selectedPost ? (
              <Button type="default" danger size="small" htmlType="button" icon={<Trash2 size={14} strokeWidth={3} />} onClick={() => onDeletePost(selectedPost)}>
                删除
              </Button>
            ) : null}
            <Button type="primary" size="small" htmlType="submit" icon={<Save size={14} strokeWidth={3} />} loading={saving}>
              {isWriteMode ? '发布' : '更新'}
            </Button>
          </div>
        </div>

        <div className="island-admin-editor__grid">
          <label className="island-admin-field">
            <span>文章 ID</span>
            <Input
              value={form.id}
              placeholder="新建时可留空，后端自动生成"
              disabled={!isWriteMode}
              prefix={<Pencil size={15} strokeWidth={3} />}
              onChange={(event) => setForm((current) => ({ ...current, id: event.target.value }))}
            />
          </label>

          <label className="island-admin-field">
            <span>标题</span>
            <Input value={form.title} placeholder="比如：小岛日常" onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          </label>

          <label className="island-admin-field">
            <span>地点</span>
            <Input
              value={form.location}
              placeholder="Taipei / 北京 / 家附近"
              prefix={<MapPin size={15} strokeWidth={3} />}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
            />
          </label>

          <label className="island-admin-field">
            <span>日期</span>
            <Input type="date" value={form.time} prefix={<CalendarDays size={15} strokeWidth={3} />} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))} />
          </label>
        </div>

        <div className="island-admin-field">
          <span>封面图片</span>
          <Input
            value={form.imageSrc}
            placeholder="https://... 或 /images/posts/xxx.jpg"
            prefix={<ImagePlus size={15} strokeWidth={3} />}
            onChange={(event) => setForm((current) => ({ ...current, imageSrc: event.target.value }))}
          />
          <div className="island-admin-upload-actions">
            <AdminCloudinaryUploader token={token} purpose="post-image" label="上传封面" onUploaded={(asset) => setForm((current) => ({ ...current, imageSrc: asset.secureUrl }))} />
            <Button type="default" size="small" htmlType="button" icon={<Images size={14} strokeWidth={3} />} onClick={() => onOpenMediaLibrary('cover')}>
              图片库
            </Button>
          </div>
        </div>

        <div className="island-admin-editor__media-row">
          <div className="island-admin-preview">
            {form.imageSrc ? <img src={form.imageSrc} alt="封面预览" /> : <span>封面预览</span>}
          </div>
          <div className="island-admin-field island-admin-field--stretch">
            <div className="island-admin-field__label-row">
              <span>多图地址</span>
              <span className="island-admin-upload-actions">
                <AdminCloudinaryUploader
                  token={token}
                  purpose="post-image"
                  label="上传多图"
                  multiple
                  onUploaded={(asset) =>
                    setForm((current) => ({
                      ...current,
                      imageSrc: current.imageSrc || asset.secureUrl,
                      imagesText: appendPostImageUrl(current.imagesText, asset.secureUrl),
                    }))
                  }
                />
                <Button type="default" size="small" htmlType="button" icon={<Images size={14} strokeWidth={3} />} onClick={() => onOpenMediaLibrary('gallery')}>
                  图片库
                </Button>
              </span>
            </div>
            <textarea
              className="island-admin-textarea island-admin-textarea--small"
              value={form.imagesText}
              placeholder="一行一张图片地址；不填时会只使用封面图"
              onChange={(event) => setForm((current) => ({ ...current, imagesText: event.target.value }))}
            />
          </div>
        </div>

        <label className="island-admin-field">
          <span>内容</span>
          <textarea className="island-admin-textarea" value={form.content} placeholder="写下这张照片背后的故事..." onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} />
        </label>

        <div className="island-admin-editor__bottom">
          <label className="island-admin-field island-admin-field--stretch">
            <span>标签</span>
            <Input value={form.tagsText} placeholder="日常，散步，小狗" prefix={<Tags size={15} strokeWidth={3} />} onChange={(event) => setForm((current) => ({ ...current, tagsText: event.target.value }))} />
          </label>
          <label className="island-admin-switch">
            <span>置顶</span>
            <Switch size="small" checked={form.pinned} checkedChildren="ON" unCheckedChildren="OFF" onChange={(checked) => setForm((current) => ({ ...current, pinned: checked }))} />
          </label>
        </div>
      </Card>
    </form>
  )
}
