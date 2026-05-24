import type { CloudinaryUploadAsset } from '@/lib/posts-api'

import { AdminMediaLibraryModal } from './AdminMediaLibraryModal'

type AdminAvatarLibraryModalProps = {
  open: boolean
  token: string
  currentUrl?: string
  onClose: () => void
  onSelect: (asset: CloudinaryUploadAsset) => void
}

export function AdminAvatarLibraryModal({ open, token, currentUrl, onClose, onSelect }: AdminAvatarLibraryModalProps) {
  return (
    <AdminMediaLibraryModal
      open={open}
      token={token}
      title="头像库"
      description="请选择一个头像"
      emptyText="头像库还是空的，先点击头像上传一张吧。"
      assetLabel="头像"
      purpose="avatar"
      resourceType="image"
      currentUrl={currentUrl}
      onClose={onClose}
      onSelect={onSelect}
    />
  )
}
