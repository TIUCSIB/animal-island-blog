import { useMemo, useState } from 'react'
import type { FormEventHandler } from 'react'

import type { GalleryPost } from '@/data/gallery'
import { AdminMediaLibraryModal } from '../media/AdminMediaLibraryModal'
import { AdminPostEditor } from './AdminPostEditor'
import { AdminPostEditModal } from './AdminPostEditModal'
import { AdminPostTable } from './AdminPostTable'
import { appendPostImageUrl, appendPostVideoUrl, getPostImageUrls, getPostVideoUrls } from './post-media-utils'
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
  const currentImageUrls = useMemo(() => getPostImageUrls(form.imagesText), [form.imagesText])
  const currentVideoUrls = useMemo(() => getPostVideoUrls(form.videosText), [form.videosText])
  const isVideoLibrary = mediaLibraryMode === 'videos'

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
        title={isVideoLibrary ? '视频库' : '图片库'}
        description={isVideoLibrary ? '选择 1 个视频加入文章；视频和图片只能二选一，且视频文章不需要封面图。' : '选择图片加入文章；第一张会作为封面，且有视频时不能再添加图片。'}
        emptyText={isVideoLibrary ? '视频库还是空的，先上传文章视频吧。' : '图片库还是空的，先上传文章图片吧。'}
        assetLabel={isVideoLibrary ? '视频' : '图片'}
        purpose={isVideoLibrary ? 'post-video' : 'post-image'}
        resourceType={isVideoLibrary ? 'video' : 'image'}
        currentUrls={isVideoLibrary ? currentVideoUrls : currentImageUrls}
        onClose={() => setMediaLibraryMode(null)}
        onSelect={(asset) =>
          setForm((current) => {
            const hasImages = getPostImageUrls(current.imagesText).length > 0
            const hasVideos = getPostVideoUrls(current.videosText).length > 0

            return isVideoLibrary ?
              hasImages ? current : {
                ...current,
                videosText: appendPostVideoUrl(current.videosText, asset.secureUrl),
              }
            : hasVideos ? current : {
                ...current,
                imagesText: appendPostImageUrl(current.imagesText, asset.secureUrl),
              }
          })
        }
      />
    </>
  )
}
