import { useState } from 'react'
import type { FormEventHandler } from 'react'

import type { GalleryPost } from '@/data/gallery'
import { AdminMediaLibraryModal } from '../media/AdminMediaLibraryModal'
import { AdminPostEditor } from './AdminPostEditor'
import { AdminPostEditModal } from './AdminPostEditModal'
import { AdminPostTable } from './AdminPostTable'
import { appendPostImageUrl, getPostImageUrls } from './post-media-utils'
import type { PostMediaLibraryMode } from './post-media-utils'
import type { PostForm, SetPostForm } from '../types'

type AdminPostsPanelMode = 'write' | 'manage'

type AdminPostsPanelProps = {
  mode: AdminPostsPanelMode
  posts: GalleryPost[]
  page: number
  pageSize: number
  total: number
  selectedPost: GalleryPost | null
  form: PostForm
  token: string
  loadingPosts: boolean
  saving: boolean
  setForm: SetPostForm
  onRefresh: () => void
  onPageChange: (page: number) => void
  onSelectPost: (post: GalleryPost) => void
  onCloseEditor: () => void
  onDeletePost: (post: GalleryPost) => void
  onSave: FormEventHandler<HTMLFormElement>
}

export function AdminPostsPanel({
  mode,
  posts,
  page,
  pageSize,
  total,
  selectedPost,
  form,
  token,
  loadingPosts,
  saving,
  setForm,
  onRefresh,
  onPageChange,
  onSelectPost,
  onCloseEditor,
  onDeletePost,
  onSave,
}: AdminPostsPanelProps) {
  const [mediaLibraryMode, setMediaLibraryMode] = useState<PostMediaLibraryMode | null>(null)
  const isWriteMode = mode === 'write'

  function handleCloseEditor() {
    setMediaLibraryMode(null)
    onCloseEditor()
  }

  return (
    <>
      <section className="island-admin-workbench island-admin-workbench--single">
        {!isWriteMode ? (
          <AdminPostTable posts={posts} page={page} pageSize={pageSize} total={total} loadingPosts={loadingPosts} onPageChange={onPageChange} onRefresh={onRefresh} onSelectPost={onSelectPost} onDeletePost={onDeletePost} />
        ) : null}

        {isWriteMode ? (
          <AdminPostEditor
            isWriteMode
            selectedPost={null}
            form={form}
            token={token}
            saving={saving}
            setForm={setForm}
            onDeletePost={onDeletePost}
            onOpenMediaLibrary={setMediaLibraryMode}
            onSave={onSave}
          />
        ) : null}
      </section>

      {!isWriteMode ? (
        <AdminPostEditModal
          post={selectedPost}
          form={form}
          token={token}
          saving={saving}
          setForm={setForm}
          onClose={handleCloseEditor}
          onDeletePost={onDeletePost}
          onOpenMediaLibrary={setMediaLibraryMode}
          onSave={onSave}
        />
      ) : null}

      <AdminMediaLibraryModal
        open={Boolean(mediaLibraryMode)}
        token={token}
        title="图片库"
        description="选择图片加入文章，第一张会作为封面"
        emptyText="图片库还是空的，先上传文章图片吧。"
        assetLabel="图片"
        purpose="post-image"
        resourceType="image"
        currentUrls={getPostImageUrls(form.imagesText)}
        onClose={() => setMediaLibraryMode(null)}
        onSelect={(asset) =>
          setForm((current) => ({
            ...current,
            imagesText: appendPostImageUrl(current.imagesText, asset.secureUrl),
          }))
        }
      />
    </>
  )
}
