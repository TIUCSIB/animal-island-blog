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
      title="删除这篇记录？"
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
      {post ? `「${post.title}」删除后会从首页消失。` : null}
    </Modal>
  )
}
