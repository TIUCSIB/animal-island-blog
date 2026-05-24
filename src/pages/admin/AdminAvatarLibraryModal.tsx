import { useEffect, useState } from 'react'
import { Button, Modal } from 'animal-island-ui'
import { Images, LoaderCircle, RefreshCw } from 'lucide-react'

import type { CloudinaryUploadAsset } from '@/lib/posts-api'
import { fetchCloudinaryUploadAssets } from '@/lib/posts-api'

import { getErrorMessage } from './post-form'

type AdminAvatarLibraryModalProps = {
  open: boolean
  token: string
  currentUrl?: string
  onClose: () => void
  onSelect: (asset: CloudinaryUploadAsset) => void
}

export function AdminAvatarLibraryModal({ open, token, currentUrl, onClose, onSelect }: AdminAvatarLibraryModalProps) {
  const [assets, setAssets] = useState<CloudinaryUploadAsset[]>([])
  const [nextCursor, setNextCursor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadAssets(cursor = '') {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const result = await fetchCloudinaryUploadAssets(token, {
        purpose: 'avatar',
        resourceType: 'image',
        nextCursor: cursor || undefined,
        maxResults: 30,
      })

      setAssets((current) => cursor ? [...current, ...result.assets] : result.assets)
      setNextCursor(result.nextCursor ?? '')
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) return

    setAssets([])
    setNextCursor('')
    void loadAssets()
  }, [open, token])

  return (
    <Modal open={open} title="???" width="min(720px, calc(100vw - 28px))" footer={null} maskClosable typewriter={false} className="island-admin-avatar-library-modal" onClose={onClose}>
      <div className="island-admin-avatar-library">
        <div className="island-admin-avatar-library__header">
          <span>
            <Images size={17} strokeWidth={3} />
            ???? Cloudinary ???
          </span>
          <Button type="default" size="small" htmlType="button" icon={<RefreshCw size={14} strokeWidth={3} />} loading={loading} onClick={() => void loadAssets()}>
            ??
          </Button>
        </div>

        {error ? <p className="island-admin-avatar-library__message island-admin-avatar-library__message--error">{error}</p> : null}

        {!error && loading && assets.length === 0 ?
          <div className="island-admin-avatar-library__loading">
            <LoaderCircle size={20} strokeWidth={3} />
            ???????...
          </div>
        : null}

        {!loading && !error && assets.length === 0 ? <p className="island-admin-avatar-library__message">???????????????????</p> : null}

        {assets.length > 0 ?
          <div className="island-admin-avatar-library__grid">
            {assets.map((asset) => (
              <button
                key={asset.publicId || asset.secureUrl}
                className={['island-admin-avatar-library__item', currentUrl === asset.secureUrl && 'island-admin-avatar-library__item--active'].filter(Boolean).join(' ')}
                type="button"
                onClick={() => {
                  onSelect(asset)
                  onClose()
                }}
              >
                <img src={asset.secureUrl} alt="??" />
              </button>
            ))}
          </div>
        : null}

        {nextCursor ?
          <div className="island-admin-avatar-library__more">
            <Button type="default" size="small" htmlType="button" loading={loading} onClick={() => void loadAssets(nextCursor)}>
              ????
            </Button>
          </div>
        : null}
      </div>
    </Modal>
  )
}
