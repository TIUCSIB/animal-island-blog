import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Button } from 'animal-island-ui'
import { UploadCloud } from 'lucide-react'

import { emitIslandToast } from '@/components/island'
import type { CloudinaryResourceType, CloudinaryUploadAsset, CloudinaryUploadPurpose } from '@/lib/posts-api'
import { uploadFileToCloudinary } from '@/lib/posts-api'

import { getErrorMessage } from './post-form'

type AdminCloudinaryUploaderProps = {
  token: string
  purpose: CloudinaryUploadPurpose
  resourceType?: CloudinaryResourceType
  accept?: string
  multiple?: boolean
  label?: string
  className?: string
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
  onUploaded,
}: AdminCloudinaryUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])

    event.target.value = ''

    if (!files.length) return

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
      <input ref={inputRef} className="island-admin-uploader__input" type="file" accept={accept} multiple={multiple} onChange={handleChange} />
      <Button type="default" size="small" htmlType="button" icon={<UploadCloud size={14} strokeWidth={3} />} loading={uploading} onClick={() => inputRef.current?.click()}>
        {label}
      </Button>
    </span>
  )
}
