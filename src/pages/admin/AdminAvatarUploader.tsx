import { useRef, useState } from 'react'
import type { ReactNode, ChangeEvent } from 'react'
import { LoaderCircle, UploadCloud } from 'lucide-react'

import { emitIslandToast } from '@/components/island'
import type { CloudinaryUploadAsset } from '@/lib/posts-api'
import { uploadFileToCloudinary } from '@/lib/posts-api'

import { getErrorMessage } from './post-form'

type AdminAvatarUploaderProps = {
  token: string
  children: ReactNode
  onUploaded: (asset: CloudinaryUploadAsset) => void
}

export function AdminAvatarUploader({ token, children, onUploaded }: AdminAvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    event.target.value = ''

    if (!file) return

    if (!token) {
      emitIslandToast({ type: 'info', title: '??????????' })
      return
    }

    setUploading(true)

    try {
      const asset = await uploadFileToCloudinary(token, file, {
        purpose: 'avatar',
        resourceType: 'image',
      })

      onUploaded(asset)
      emitIslandToast({ type: 'success', title: '??????' })
    } catch (error) {
      emitIslandToast({
        type: 'error',
        title: '????',
        description: getErrorMessage(error),
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <button className="island-admin-avatar-upload" type="button" disabled={uploading} onClick={() => inputRef.current?.click()}>
      <input ref={inputRef} className="island-admin-uploader__input" type="file" accept="image/*" onChange={handleChange} />
      {children}
      <span className="island-admin-avatar-upload__overlay" aria-hidden="true">
        {uploading ? <LoaderCircle className="island-admin-avatar-upload__spin" size={18} strokeWidth={3} /> : <UploadCloud size={18} strokeWidth={3} />}
        <small>{uploading ? '???' : '????'}</small>
      </span>
    </button>
  )
}
