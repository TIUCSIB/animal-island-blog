import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Modal } from 'animal-island-ui'
import { Images, LoaderCircle, RefreshCw, Trash2 } from 'lucide-react'

import { emitIslandToast } from '@/components/island'
import type { CloudinaryResourceType, CloudinaryUploadAsset, CloudinaryUploadPurpose } from '@/lib/posts-api'
import { deleteCloudinaryUploadAsset, fetchCloudinaryUploadAssets } from '@/lib/posts-api'

import { getErrorMessage } from '../posts/post-form'

type AdminMediaLibraryModalProps = {
  open: boolean
  token: string
  title: string
  description: string
  emptyText: string
  assetLabel: string
  purpose: CloudinaryUploadPurpose
  resourceType?: CloudinaryResourceType
  currentUrl?: string
  currentUrls?: string[]
  onClose: () => void
  onSelect: (asset: CloudinaryUploadAsset) => void
}

export function AdminMediaLibraryModal({
  open,
  token,
  title,
  description,
  emptyText,
  assetLabel,
  purpose,
  resourceType = 'image',
  currentUrl,
  currentUrls = [],
  onClose,
  onSelect,
}: AdminMediaLibraryModalProps) {
  const [assets, setAssets] = useState<CloudinaryUploadAsset[]>([])
  const [nextCursor, setNextCursor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<CloudinaryUploadAsset | null>(null)
  const [deleting, setDeleting] = useState(false)
  const selectedUrlSet = useMemo(() => new Set([currentUrl, ...currentUrls].filter(Boolean)), [currentUrl, currentUrls])

  const loadAssets = useCallback(
    async (cursor = '') => {
      if (!token) return

      if (!cursor) {
        setAssets([])
        setNextCursor('')
      }

      setLoading(true)
      setError('')

      try {
        const result = await fetchCloudinaryUploadAssets(token, {
          purpose,
          resourceType,
          nextCursor: cursor || undefined,
          maxResults: 30,
        })

        setAssets((current) => (cursor ? [...current, ...result.assets] : result.assets))
        setNextCursor(result.nextCursor ?? '')
      } catch (loadError) {
        setError(getErrorMessage(loadError))
      } finally {
        setLoading(false)
      }
    },
    [purpose, resourceType, token],
  )

  useEffect(() => {
    if (!open) return

    const timer = window.setTimeout(() => {
      void loadAssets()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadAssets, open])

  async function handleConfirmDelete() {
    if (!deleteTarget) return

    setDeleting(true)

    try {
      await deleteCloudinaryUploadAsset(token, {
        publicId: deleteTarget.publicId,
        purpose,
        resourceType,
      })

      setAssets((current) => current.filter((asset) => asset.publicId !== deleteTarget.publicId))
      setDeleteTarget(null)
      emitIslandToast({ type: 'success', title: `${assetLabel}已删除。` })
    } catch (deleteError) {
      emitIslandToast({
        type: 'error',
        title: '删除失败',
        description: getErrorMessage(deleteError),
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Modal open={open} title={title} width="min(720px, calc(100vw - 28px))" footer={null} maskClosable typewriter={false} className="island-admin-avatar-library-modal" onClose={onClose}>
        <div className="island-admin-avatar-library">
          <div className="island-admin-avatar-library__header">
            <span>
              <Images size={17} strokeWidth={3} />
              {description}
            </span>
            <Button type="default" size="small" htmlType="button" icon={<RefreshCw size={14} strokeWidth={3} />} loading={loading} onClick={() => void loadAssets()}>
              刷新
            </Button>
          </div>

          {error ? <p className="island-admin-avatar-library__message island-admin-avatar-library__message--error">{error}</p> : null}

          {!error && loading && assets.length === 0 ?
            <div className="island-admin-avatar-library__loading">
              <LoaderCircle size={20} strokeWidth={3} />
              正在读取{title}...
            </div>
          : null}

          {!loading && !error && assets.length === 0 ? <p className="island-admin-avatar-library__message">{emptyText}</p> : null}

          {assets.length > 0 ?
            <div className="island-admin-avatar-library__grid">
              {assets.map((asset) => {
                const active = selectedUrlSet.has(asset.secureUrl)

                return (
                  <div key={asset.publicId || asset.secureUrl} className={['island-admin-avatar-library__item', active && 'island-admin-avatar-library__item--active'].filter(Boolean).join(' ')}>
                    <button
                      className="island-admin-avatar-library__select"
                      type="button"
                      onClick={() => {
                        onSelect(asset)
                        onClose()
                      }}
                    >
                      <img src={asset.secureUrl} alt={assetLabel} />
                    </button>
                    <button className="island-admin-avatar-library__delete" type="button" aria-label={`删除${assetLabel}`} onClick={() => setDeleteTarget(asset)}>
                      <Trash2 size={13} strokeWidth={3} />
                    </button>
                  </div>
                )
              })}
            </div>
          : null}

          {nextCursor ?
            <div className="island-admin-avatar-library__more">
              <Button type="default" size="small" htmlType="button" loading={loading} onClick={() => void loadAssets(nextCursor)}>
                加载更多
              </Button>
            </div>
          : null}
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="操作确认"
        width={380}
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <Button htmlType="button" onClick={() => setDeleteTarget(null)}>
              取消
            </Button>
            <Button type="primary" danger htmlType="button" loading={deleting} onClick={() => void handleConfirmDelete()}>
              删除
            </Button>
          </>
        }
      >
        <p>确定要删除这个{assetLabel}吗？删除后将无法恢复。</p>
      </Modal>
    </>
  )
}
