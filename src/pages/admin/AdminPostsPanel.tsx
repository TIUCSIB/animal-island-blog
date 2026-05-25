import { useState } from 'react'
import type { FormEventHandler } from 'react'
import { Card } from 'animal-island-ui'

import type { GalleryPost } from '@/data/gallery'
import { AdminMediaLibraryModal } from './AdminMediaLibraryModal'
import { AdminPostEditor } from './AdminPostEditor'
import { AdminPostTable } from './AdminPostTable'
import { appendPostImageUrl, getPostImageUrls } from './post-media-utils'
import type { PostMediaLibraryMode } from './post-media-utils'
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
  const [mediaLibraryMode, setMediaLibraryMode] = useState<PostMediaLibraryMode | null>(null)
  const isWriteMode = mode === 'write'
  const canEdit = isWriteMode || Boolean(selectedPost)

  return (
    <>
      <section className="island-admin-workbench island-admin-workbench--single">
        {!isWriteMode ? (
          <AdminPostTable posts={posts} selectedId={selectedId} loadingPosts={loadingPosts} onRefresh={onRefresh} onSelectPost={onSelectPost} onDeletePost={onDeletePost} />
        ) : null}

        {canEdit ? (
          <AdminPostEditor
            isWriteMode={isWriteMode}
            selectedPost={selectedPost}
            form={form}
            token={token}
            saving={saving}
            setForm={setForm}
            onDeletePost={onDeletePost}
            onOpenMediaLibrary={setMediaLibraryMode}
            onSave={onSave}
          />
        ) : (
          <section className="island-admin-editor">
            <Card className="island-admin-editor__card island-admin-editor__empty">
              <div className="island-admin-editor__header">
                <div>
                  <span className="island-admin-editor__eyebrow">文章管理</span>
                  <h2>选择一篇文章</h2>
                </div>
              </div>
              <p className="island-admin-field__hint">从上方表格选择文章后，就可以编辑、更新或删除。</p>
            </Card>
          </section>
        )}
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
        currentUrls={getPostImageUrls(form.imagesText)}
        onClose={() => setMediaLibraryMode(null)}
        onSelect={(asset) =>
          setForm((current) =>
            mediaLibraryMode === 'cover'
              ? {
                  ...current,
                  imageSrc: asset.secureUrl,
                }
              : {
                  ...current,
                  imageSrc: current.imageSrc || asset.secureUrl,
                  imagesText: appendPostImageUrl(current.imagesText, asset.secureUrl),
                },
          )
        }
      />
    </>
  )
}
