import { useEffect } from 'react'
import type { FormEventHandler, MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

import type { GalleryPost } from '@/data/gallery'
import { AdminPostEditor } from './AdminPostEditor'
import type { PostMediaLibraryMode } from './post-media-utils'
import type { PostForm, SetPostForm } from '../types'

type AdminPostEditModalProps = {
  post: GalleryPost | null
  form: PostForm
  token: string
  saving: boolean
  setForm: SetPostForm
  onClose: () => void
  onDeletePost: (post: GalleryPost) => void
  onOpenMediaLibrary: (mode: PostMediaLibraryMode) => void
  onSave: FormEventHandler<HTMLFormElement>
}

export function AdminPostEditModal({ post, form, token, saving, setForm, onClose, onDeletePost, onOpenMediaLibrary, onSave }: AdminPostEditModalProps) {
  useEffect(() => {
    if (!post) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [post])

  useEffect(() => {
    if (!post || saving) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [post, saving, onClose])

  if (!post) return null

  function handleMaskMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (saving || event.target !== event.currentTarget) return
    onClose()
  }

  return createPortal(
    <div className="animal-cursor island-admin-post-edit-modal" role="presentation" onMouseDown={handleMaskMouseDown}>
      <section className="island-admin-post-edit-modal__panel" role="dialog" aria-modal="true" aria-label="编辑文章">
        <div className="island-admin-post-edit-modal__topbar">
          <button className="island-admin-post-edit-modal__close" type="button" aria-label="关闭编辑弹窗" disabled={saving} onClick={onClose}>
            <X size={16} strokeWidth={3} />
          </button>
        </div>
        <div className="island-admin-post-edit-modal__body">
          <AdminPostEditor
            key={post.id}
            isWriteMode={false}
            selectedPost={post}
            form={form}
            token={token}
            saving={saving}
            setForm={setForm}
            onDeletePost={onDeletePost}
            onOpenMediaLibrary={onOpenMediaLibrary}
            onSave={onSave}
            compact
            showDeleteAction={true}
          />
        </div>
      </section>
    </div>,
    document.body,
  )
}
