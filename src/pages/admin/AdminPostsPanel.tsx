import { useState } from 'react'
import type { FormEventHandler } from 'react'
import { Button, Card, Input, Switch } from 'animal-island-ui'
import { CalendarDays, ImagePlus, Images, MapPin, Pencil, RefreshCw, Save, Tags, Trash2 } from 'lucide-react'

import type { GalleryPost } from '@/data/gallery'
import { AdminCloudinaryUploader } from './AdminCloudinaryUploader'
import { AdminMediaLibraryModal } from './AdminMediaLibraryModal'
import type { PostForm, SetPostForm } from './types'

type AdminPostsPanelMode = 'write' | 'manage'

type AdminPostsPanelProps = {
  mode: AdminPostsPanelMode
  posts: GalleryPost[]
  selectedId: string | null
  selectedPost: GalleryPost | null
  form: PostForm
  token: string
  loadingPosts: boolean
  saving: boolean
  setForm: SetPostForm
  onRefresh: () => void
  onSelectPost: (post: GalleryPost) => void
  onDeletePost: (post: GalleryPost) => void
  onSave: FormEventHandler<HTMLFormElement>
}

export function AdminPostsPanel({
  mode,
  posts,
  selectedId,
  selectedPost,
  form,
  token,
  loadingPosts,
  saving,
  setForm,
  onRefresh,
  onSelectPost,
  onDeletePost,
  onSave,
}: AdminPostsPanelProps) {
  const [mediaLibraryMode, setMediaLibraryMode] = useState<'cover' | 'gallery' | null>(null)
  const isWriteMode = mode === 'write'
  const canEdit = isWriteMode || Boolean(selectedPost)

  function appendImageUrl(currentText: string, url: string) {
    const urls = currentText
      .split(/[\n,，]/)
      .map((item) => item.trim())
      .filter(Boolean)

    if (!urls.includes(url)) urls.push(url)

    return urls.join('\n')
  }

  function getImageUrls(text: string) {
    return text
      .split(/[\n,，]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return (
    <>
      <section className={['island-admin-workbench', isWriteMode && 'island-admin-workbench--single'].filter(Boolean).join(' ')}>
        {!isWriteMode ?
          <aside className="island-admin-sidebar">
            <div className="island-admin-sidebar__toolbar island-admin-sidebar__toolbar--single">
              <Button type="default" size="small" htmlType="button" icon={<RefreshCw size={14} strokeWidth={3} />} loading={loadingPosts} onClick={onRefresh}>
                刷新
              </Button>
            </div>

            <div className="island-admin-post-list">
              {posts.length > 0 ?
                posts.map((post) => (
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
                ))
              : <div className="island-admin-post-list__empty">暂时还没有文章</div>}
            </div>
          </aside>
        : null}

        {canEdit ?
          <form className="island-admin-editor" onSubmit={onSave}>
            <Card className="island-admin-editor__card">
              <div className="island-admin-editor__header">
                <div>
                  <span className="island-admin-editor__eyebrow">{isWriteMode ? '写文章' : '编辑文章'}</span>
                  <h2>{form.title || (isWriteMode ? '新的小岛记录' : '未命名记录')}</h2>
                </div>
                <div className="island-admin-editor__header-actions">
                  {!isWriteMode && selectedPost ?
                    <Button type="default" danger size="small" htmlType="button" icon={<Trash2 size={14} strokeWidth={3} />} onClick={() => onDeletePost(selectedPost)}>
                      删除
                    </Button>
                  : null}
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
                  <Button type="default" size="small" htmlType="button" icon={<Images size={14} strokeWidth={3} />} onClick={() => setMediaLibraryMode('cover')}>
                    图片库
                  </Button>
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
                            imagesText: appendImageUrl(current.imagesText, asset.secureUrl),
                          }))
                        }
                      />
                      <Button type="default" size="small" htmlType="button" icon={<Images size={14} strokeWidth={3} />} onClick={() => setMediaLibraryMode('gallery')}>
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
        : <section className="island-admin-editor">
            <Card className="island-admin-editor__card island-admin-editor__empty">
              <div className="island-admin-editor__header">
                <div>
                  <span className="island-admin-editor__eyebrow">文章管理</span>
                  <h2>选择一篇文章</h2>
                </div>
              </div>
              <p className="island-admin-field__hint">从左侧列表选择文章后，就可以编辑、更新或删除。</p>
            </Card>
          </section>}
      </section>

      <AdminMediaLibraryModal
        open={Boolean(mediaLibraryMode)}
        token={token}
        title="图片库"
        description={mediaLibraryMode === 'cover' ? '选择一张图片作为封面' : '选择一张图片加入多图'}
        emptyText="图片库还是空的，先上传文章图片吧。"
        assetLabel="图片"
        purpose="post-image"
        resourceType="image"
        currentUrl={form.imageSrc}
        currentUrls={getImageUrls(form.imagesText)}
        onClose={() => setMediaLibraryMode(null)}
        onSelect={(asset) =>
          setForm((current) =>
            mediaLibraryMode === 'cover' ?
              {
                ...current,
                imageSrc: asset.secureUrl,
              }
            : {
                ...current,
                imageSrc: current.imageSrc || asset.secureUrl,
                imagesText: appendImageUrl(current.imagesText, asset.secureUrl),
              },
          )
        }
      />
    </>
  )
}
