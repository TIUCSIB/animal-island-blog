import { useId, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { Button } from 'animal-island-ui'
import { UploadCloud } from 'lucide-react'

import { emitIslandToast } from '@/components/island'
import type { CloudinaryResourceType, CloudinaryUploadAsset, CloudinaryUploadPurpose } from '@/lib/posts-api'
import { uploadFileToCloudinary } from '@/lib/posts-api'

import { getErrorMessage } from '../posts/post-form'

type AdminCloudinaryUploaderProps = {
  token: string
  purpose: CloudinaryUploadPurpose
  resourceType?: CloudinaryResourceType
  accept?: string
  multiple?: boolean
  label?: string
  assetLabel?: string
  className?: string
  disabled?: boolean
  maxFiles?: number
  renderTrigger?: (options: { disabled: boolean; uploading: boolean; open: () => void }) => ReactNode
  onUploaded: (asset: CloudinaryUploadAsset) => void
}

export function AdminCloudinaryUploader({
  token,
  purpose,
  resourceType = 'image',
  accept = 'image/*',
  multiple = false,
  label = '上传文件',
  assetLabel,
  className,
  disabled = false,
  maxFiles,
  renderTrigger,
  onUploaded,
}: AdminCloudinaryUploaderProps) {
  const inputId = useId()
  const [uploading, setUploading] = useState(false)
  const safeAssetLabel = assetLabel ?? (resourceType === 'video' ? '视频' : '图片')

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? [])
    const limit = typeof maxFiles === 'number' ? Math.max(0, maxFiles) : selectedFiles.length
    const files = selectedFiles.slice(0, limit)

    event.target.value = ''

    if (!files.length) {
      emitIslandToast({ type: 'info', title: `当前最多只能再添加 ${limit} 个${safeAssetLabel}` })
      return
    }

    if (selectedFiles.length > files.length) {
      emitIslandToast({ type: 'info', title: `本次最多可添加 ${files.length} 个${safeAssetLabel}` })
    }

    if (!token) {
      emitIslandToast({ type: 'info', title: '请先登录后台再上传' })
      return
    }

    setUploading(true)

    try {
      for (const file of files) {
        const asset = await uploadFileToCloudinary(token, file, {
          purpose,
          resourceType,
        })

        onUploaded(asset)
      }

      emitIslandToast({
        type: 'success',
        title: files.length > 1 ? `已上传 ${files.length} 个${safeAssetLabel}` : `${safeAssetLabel}已上传`,
      })
    } catch (error) {
      emitIslandToast({
        type: 'error',
        title: '上传失败',
        description: getErrorMessage(error),
      })
    } finally {
      setUploading(false)
    }
  }

  const triggerDisabled = disabled || uploading
  const open = () => {
    if (triggerDisabled) return

    const input = document.getElementById(inputId)

    if (input instanceof HTMLInputElement) {
      input.click()
    }
  }

  return (
    <span className={['island-admin-uploader', className].filter(Boolean).join(' ')}>
      <input id={inputId} className="island-admin-uploader__input" type="file" accept={accept} multiple={multiple} disabled={disabled || uploading} onChange={handleChange} />
      {renderTrigger ? (
        renderTrigger({ disabled: triggerDisabled, uploading, open })
      ) : (
        <Button type="default" size="small" htmlType="button" icon={<UploadCloud size={14} strokeWidth={3} />} loading={uploading} disabled={disabled} onClick={open}>
          {label}
        </Button>
      )}
    </span>
  )
}
