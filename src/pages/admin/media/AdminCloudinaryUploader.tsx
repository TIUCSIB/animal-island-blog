import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
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
  className?: string
  disabled?: boolean
  maxFiles?: number
  onUploaded: (asset: CloudinaryUploadAsset) => void
}

export function AdminCloudinaryUploader({
  token,
  purpose,
  resourceType = 'image',
  accept = 'image/*',
  multiple = false,
  label = '上传图片',
  className,
  disabled = false,
  maxFiles,
  onUploaded,
}: AdminCloudinaryUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? [])
    const limit = typeof maxFiles === 'number' ? Math.max(0, maxFiles) : selectedFiles.length
    const files = selectedFiles.slice(0, limit)

    event.target.value = ''

    if (!files.length) {
      emitIslandToast({ type: 'info', title: '最多只能添加 9 张图片。' })
      return
    }

    if (selectedFiles.length > files.length) {
      emitIslandToast({ type: 'info', title: `最多还能添加 ${files.length} 张图片。` })
    }

    if (!token) {
      emitIslandToast({ type: 'info', title: '请先登录后台再上传。' })
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
        title: files.length > 1 ? `已上传 ${files.length} 个文件。` : '图片已上传。',
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

  return (
    <span className={['island-admin-uploader', className].filter(Boolean).join(' ')}>
      <input ref={inputRef} className="island-admin-uploader__input" type="file" accept={accept} multiple={multiple} disabled={disabled || uploading} onChange={handleChange} />
      <Button type="default" size="small" htmlType="button" icon={<UploadCloud size={14} strokeWidth={3} />} loading={uploading} disabled={disabled} onClick={() => inputRef.current?.click()}>
        {label}
      </Button>
    </span>
  )
}
