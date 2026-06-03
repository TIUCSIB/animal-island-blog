import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Modal } from 'animal-island-ui'
import { Clapperboard, Images, LoaderCircle, RefreshCw, Trash2 } from 'lucide-react'

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
  multiSelect?: boolean
  onClose: () => void
  onSelect: (asset: CloudinaryUploadAsset) => void
  onSelectMultiple?: (assets: CloudinaryUploadAsset[]) => void
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
  multiSelect = false,
  onClose,
  onSelect,
  onSelectMultiple,
}: AdminMediaLibraryModalProps) {
  const [assets, setAssets] = useState<CloudinaryUploadAsset[]>([])
  const [nextCursor, setNextCursor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<CloudinaryUploadAsset | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const selectedUrlSet = useMemo(() => new Set([currentUrl, ...currentUrls].filter(Boolean)), [currentUrl, currentUrls])
  const isVideoLibrary = resourceType === 'video'
  const headerIcon = isVideoLibrary ? <Clapperboard size={17} strokeWidth={3} /> : <Images size={17} strokeWidth={3} />

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
          maxResults: 24,
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

    setSelectedIds(new Set())

    const timer = window.setTimeout(() => {
      void loadAssets()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadAssets, open])

  function toggleSelect(asset: CloudinaryUploadAsset) {
    const key = asset.publicId || asset.secureUrl
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  function confirmMultiSelect() {
    const selected = assets.filter((a) => selectedIds.has(a.publicId || a.secureUrl))
    if (selected.length > 0 && onSelectMultiple) {
      onSelectMultiple(selected)
    }
    onClose()
  }

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
      emitIslandToast({ type: 'success', title: `${assetLabel}已删除` })
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
              {headerIcon}
              {description}
            </span>
            <Button type="default" size="small" htmlType="button" icon={<RefreshCw size={14} strokeWidth={3} />} loading={loading} onClick={() => void loadAssets()}>
              刷新
            </Button>
          </div>

          {error ? <p className="island-admin-avatar-library__message island-admin-avatar-library__message--error">{error}</p> : null}

          {!error && loading && assets.length === 0 ? (
            <div className="island-admin-avatar-library__loading">
              <LoaderCircle size={20} strokeWidth={3} />
              正在读取{title}...
            </div>
          ) : null}

          {!loading && !error && assets.length === 0 ? <p className="island-admin-avatar-library__message">{emptyText}</p> : null}

          {assets.length > 0 ? (
            <div className="island-admin-avatar-library__grid">
              {assets.map((asset) => {
                const key = asset.publicId || asset.secureUrl
                const active = selectedUrlSet.has(asset.secureUrl)
                const checked = selectedIds.has(key)

                return (
                  <div key={key} className={['island-admin-avatar-library__item', active && 'island-admin-avatar-library__item--active', multiSelect && checked && 'island-admin-avatar-library__item--selected'].filter(Boolean).join(' ')}>
                    <button
                      className="island-admin-avatar-library__select relative overflow-hidden"
                      type="button"
                      onClick={() => {
                        if (multiSelect) {
                          toggleSelect(asset)
                        } else {
                          onSelect(asset)
                          onClose()
                        }
                      }}
                    >
                      {isVideoLibrary ? (
                        <video className="h-full w-full rounded-[20px] object-cover" src={asset.secureUrl} muted playsInline preload="metadata" />
                      ) : <img src={asset.secureUrl} alt={assetLabel} />}
                      {multiSelect && checked ? (
                        <span className="absolute right-2 top-2 z-10 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-[#19c8b9] text-[10px] font-black text-white shadow-md">✓</span>
                      ) : null}
                    </button>
                    <button className="island-admin-avatar-library__delete" type="button" aria-label={`删除${assetLabel}`} onClick={() => setDeleteTarget(asset)}>
                      <Trash2 size={13} strokeWidth={3} />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : null}

          {nextCursor ? (
            <div className="island-admin-avatar-library__more">
              <span>已加载 {assets.length} 个</span>
              <Button type="default" size="small" htmlType="button" loading={loading} onClick={() => void loadAssets(nextCursor)}>
                加载更多
              </Button>
            </div>
          ) : null}

          {!nextCursor && assets.length > 0 ? <p className="island-admin-avatar-library__count">已加载全部 {assets.length} 个</p> : null}

          {multiSelect && selectedIds.size > 0 ? (
            <div className="island-admin-avatar-library__more">
              <span>已选中 {selectedIds.size} 个</span>
              <Button type="primary" size="small" htmlType="button" onClick={confirmMultiSelect}>
                确认
              </Button>
            </div>
          ) : null}
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
