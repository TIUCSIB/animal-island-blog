import { Button, Modal } from 'animal-island-ui'

import type { GalleryPost } from '@/data/gallery'

type DeletePostModalProps = {
  post: GalleryPost | null
  saving: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeletePostModal({ post, saving, onClose, onConfirm }: DeletePostModalProps) {
  return (
    <Modal
      open={Boolean(post)}
      title="操作确认"
      width={420}
      onClose={onClose}
      footer={
        <>
          <Button htmlType="button" onClick={onClose}>
            取消
          </Button>
          <Button type="primary" danger htmlType="button" loading={saving} onClick={onConfirm}>
            删除
          </Button>
        </>
      }
    >
      {post ? `「${post.title}」你确定要删除吗？` : null}
    </Modal>
  )
}
