import type { FormEventHandler } from 'react'
import { Button, Card, Input, Switch } from 'animal-island-ui'
import { CalendarDays, ImagePlus, MapPin, Pencil, Plus, RefreshCw, Save, Tags, Trash2 } from 'lucide-react'

import type { GalleryPost } from '@/data/gallery'
import { AdminCloudinaryUploader } from './AdminCloudinaryUploader'
import type { PostForm, SetPostForm } from './types'

type AdminPostsPanelProps = {
  posts: GalleryPost[]
  selectedId: string | null
  selectedPost: GalleryPost | null
  form: PostForm
  token: string
  loadingPosts: boolean
  saving: boolean
  setForm: SetPostForm
  onNewPost: () => void
  onRefresh: () => void
  onSelectPost: (post: GalleryPost) => void
  onDeletePost: (post: GalleryPost) => void
  onSave: FormEventHandler<HTMLFormElement>
}

export function AdminPostsPanel({
  posts,
  selectedId,
  selectedPost,
  form,
  token,
  loadingPosts,
  saving,
  setForm,
  onNewPost,
  onRefresh,
  onSelectPost,
  onDeletePost,
  onSave,
}: AdminPostsPanelProps) {
  function appendImageUrl(currentText: string, url: string) {
    const urls = currentText
      .split(/[\n,，]/)
      .map((item) => item.trim())
      .filter(Boolean)

    if (!urls.includes(url)) urls.push(url)

    return urls.join('\n')
  }

  return (
    <section className="island-admin-workbench">
      <aside className="island-admin-sidebar">
        <div className="island-admin-sidebar__toolbar">
          <Button type="primary" size="small" htmlType="button" icon={<Plus size={14} strokeWidth={3} />} onClick={onNewPost}>
            新建
          </Button>
          <Button type="default" size="small" htmlType="button" icon={<RefreshCw size={14} strokeWidth={3} />} loading={loadingPosts} onClick={onRefresh}>
            刷新
          </Button>
        </div>

        <div className="island-admin-post-list">
          {posts.map((post) => (
            <button
              key={post.id}
              className={['island-admin-post-list__item', selectedId === post.id && 'island-admin-post-list__item--active'].filter(Boolean).join(' ')}
              type="button"
              onClick={() => onSelectPost(post)}
            >
              <img src={post.imageSrc} alt="" />
              <span>
                <strong>{post.title}</strong>
                <small>{post.location || '未填写地点'}</small>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <form className="island-admin-editor" onSubmit={onSave}>
        <Card className="island-admin-editor__card">
          <div className="island-admin-editor__header">
            <div>
              <span className="island-admin-editor__eyebrow">{selectedPost ? '编辑文章' : '新建文章'}</span>
              <h2>{form.title || '未命名记录'}</h2>
            </div>
            <div className="island-admin-editor__header-actions">
              {selectedPost ?
                <Button type="default" danger size="small" htmlType="button" icon={<Trash2 size={14} strokeWidth={3} />} onClick={() => onDeletePost(selectedPost)}>
                  删除
                </Button>
              : null}
              <Button type="primary" size="small" htmlType="submit" icon={<Save size={14} strokeWidth={3} />} loading={saving}>
                保存
              </Button>
            </div>
          </div>

          <div className="island-admin-editor__grid">
            <label className="island-admin-field">
              <span>文章 ID</span>
              <Input
                value={form.id}
                placeholder="新建时可留空，后端自动生成"
                disabled={Boolean(selectedPost)}
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
              <Input
                type="date"
                value={form.time}
                prefix={<CalendarDays size={15} strokeWidth={3} />}
                onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
              />
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
              <AdminCloudinaryUploader
                token={token}
                purpose="post-image"
                label="上传封面"
                onUploaded={(asset) =>
                  setForm((current) => ({
                    ...current,
                    imageSrc: asset.secureUrl,
                  }))
                }
              />
            </div>
          </div>

          <div className="island-admin-editor__media-row">
            <div className="island-admin-preview">
              {form.imageSrc ?
                <img src={form.imageSrc} alt="封面预览" />
              : <span>封面预览</span>}
            </div>
            <div className="island-admin-field island-admin-field--stretch">
              <div className="island-admin-field__label-row">
                <span>多图地址</span>
                <AdminCloudinaryUploader
                  token={token}
                  purpose="post-image"
                  label="上传多图"
                  multiple
                  onUploaded={(asset) =>
                    setForm((current) => ({
                      ...current,
                      imageSrc: current.imageSrc || asset.secureUrl,
                      imagesText: appendImageUrl(current.imagesText, asset.secureUrl),
                    }))
                  }
                />
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
            <textarea
              className="island-admin-textarea"
              value={form.content}
              placeholder="写下这张照片背后的故事..."
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
            />
          </label>

          <div className="island-admin-editor__bottom">
            <label className="island-admin-field island-admin-field--stretch">
              <span>标签</span>
              <Input
                value={form.tagsText}
                placeholder="日常，散步，小狗"
                prefix={<Tags size={15} strokeWidth={3} />}
                onChange={(event) => setForm((current) => ({ ...current, tagsText: event.target.value }))}
              />
            </label>
            <label className="island-admin-switch">
              <span>置顶</span>
              <Switch size="small" checked={form.pinned} checkedChildren="ON" unCheckedChildren="OFF" onChange={(checked) => setForm((current) => ({ ...current, pinned: checked }))} />
            </label>
          </div>
        </Card>
      </form>
    </section>
  )
}
