import { useMemo } from 'react'
import type { MouseEvent } from 'react'
import { Button, Card, Table } from 'animal-island-ui'
import type { TableColumn } from 'animal-island-ui'
import { Pencil, RefreshCw, Trash2 } from 'lucide-react'

import { IslandPagination } from '@/components/island'
import type { GalleryPost } from '@/data/gallery'
import { formatPostDate } from './post-media-utils'

type AdminPostTableProps = {
  posts: GalleryPost[]
  page: number
  pageSize: number
  total: number
  loadingPosts: boolean
  onPageChange: (page: number) => void
  onRefresh: () => void
  onSelectPost: (post: GalleryPost) => void
  onDeletePost: (post: GalleryPost) => void
}

function toPost(record: Record<string, unknown>) {
  return record as unknown as GalleryPost
}

export function AdminPostTable({ posts, page, pageSize, total, loadingPosts, onPageChange, onRefresh, onSelectPost, onDeletePost }: AdminPostTableProps) {
  const rows = useMemo<Record<string, unknown>[]>(() => posts.map((post) => ({ ...post })), [posts])
  const columns = useMemo<TableColumn[]>(
    () => [
      {
        title: '封面',
        dataIndex: 'imageSrc',
        width: 84,
        render: (value, record) => {
          const post = toPost(record)
          const isVideoPost = post.mediaType === 'video' || (post.videos?.length ?? 0) > 0
          const src = isVideoPost ? (post.videos?.[0] || post.imageSrc) : (typeof value === 'string' ? value : post.imageSrc)

          return (
            <span className="island-admin-post-table__cover-wrap">
              {isVideoPost ?
                <video className="island-admin-post-table__cover" src={src} muted playsInline preload="metadata" />
              : <img className="island-admin-post-table__cover" src={src} alt={post.title} />}
              {post.pinned ?
                <span className="island-admin-post-table__pin" aria-label="置顶">
                  {String.fromCharCode(9733)}
                </span>
              : null}
            </span>
          )
        },
      },
      {
        title: '标题',
        dataIndex: 'title',
        width: 200,
        render: (_value, record) => {
          const post = toPost(record)

          return (
            <span className="island-admin-post-table__title">
              <strong>{post.title || '未命名记录'}</strong>
            </span>
          )
        },
      },
      {
        title: '地点',
        dataIndex: 'location',
        width: 120,
        render: (value) => (typeof value === 'string' && value ? value : '未填写'),
      },
      {
        title: '日期',
        dataIndex: 'time',
        width: 120,
        render: (value) => formatPostDate(typeof value === 'string' ? value : ''),
      },
      {
        title: '操作',
        align: 'right',
        render: (_value, record) => {
          const post = toPost(record)

          return (
            <span className="island-admin-post-table__actions">
              <Button
                className="island-admin-post-table__icon-button"
                type="default"
                size="small"
                htmlType="button"
                aria-label="编辑文章"
                icon={<Pencil size={14} strokeWidth={3} />}
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  event.stopPropagation()
                  onSelectPost(post)
                }}
              />
              <Button
                className="island-admin-post-table__icon-button"
                type="default"
                danger
                size="small"
                htmlType="button"
                aria-label="删除文章"
                icon={<Trash2 size={14} strokeWidth={3} />}
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  event.stopPropagation()
                  onDeletePost(post)
                }}
              />
            </span>
          )
        },
      },
    ],
    [onDeletePost, onSelectPost],
  )

  return (
    <Card className="island-admin-editor__card island-admin-post-table-card">
      <div className="island-admin-editor__header">
        <div>
          <span className="island-admin-editor__eyebrow">文章管理</span>
        </div>
        <div className="island-admin-editor__header-actions">
          <Button type="default" size="small" htmlType="button" icon={<RefreshCw size={14} strokeWidth={3} />} loading={loadingPosts} onClick={onRefresh}>
            刷新
          </Button>
        </div>
      </div>

      <Table className="island-admin-post-table" striped rowKey="id" columns={columns} dataSource={rows} loading={loadingPosts} emptyText="暂时还没有文章" scroll={{ x: 640 }} />

      <IslandPagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </Card>
  )
}
