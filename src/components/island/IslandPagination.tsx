import { useEffect, useMemo, useState } from 'react'
import { Button, Input } from 'animal-island-ui'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

export type IslandPaginationProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  className?: string
  showTotal?: boolean
  siblingCount?: number
}

type PageItem = number | 'ellipsis'

function clampPage(page: number, pageCount: number) {
  return Math.min(Math.max(page, 1), pageCount)
}

function getPageItems(currentPage: number, pageCount: number, siblingCount: number): PageItem[] {
  const visibleCount = siblingCount * 2 + 5

  if (pageCount <= visibleCount) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const left = Math.max(currentPage - siblingCount, 2)
  const right = Math.min(currentPage + siblingCount, pageCount - 1)
  const items: PageItem[] = [1]

  if (left > 2) items.push('ellipsis')

  for (let page = left; page <= right; page += 1) {
    items.push(page)
  }

  if (right < pageCount - 1) items.push('ellipsis')

  items.push(pageCount)
  return items
}

export function IslandPagination({ page, pageSize, total, onPageChange, className, showTotal = true, siblingCount = 1 }: IslandPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = clampPage(page, pageCount)
  const [jumpValue, setJumpValue] = useState(String(currentPage))
  const hasPrev = currentPage > 1
  const hasNext = currentPage < pageCount
  const items = useMemo(() => getPageItems(currentPage, pageCount, siblingCount), [currentPage, pageCount, siblingCount])

  useEffect(() => {
    setJumpValue(String(currentPage))
  }, [currentPage])

  if (total <= pageSize) return null

  function commitJump() {
    const nextPage = Number.parseInt(jumpValue, 10)

    if (!Number.isFinite(nextPage)) {
      setJumpValue(String(currentPage))
      return
    }

    onPageChange(clampPage(nextPage, pageCount))
  }

  return (
    <nav className={cn('flex flex-wrap items-center justify-end gap-2 pt-1 pb-2 text-xs font-black text-[#725d42]', className)} aria-label="分页">
      {showTotal ?
        <span className="whitespace-nowrap rounded-full border-2 border-[#c4b89e]/60 bg-[#fff8ec]/70 px-3 py-1 shadow-[0_2px_0_rgba(212,201,180,0.62)]">共 {total} 条</span>
      : null}

      <Button type="default" size="small" htmlType="button" disabled={!hasPrev} aria-label="上一页" icon={<ChevronLeft size={14} strokeWidth={3} />} onClick={() => onPageChange(currentPage - 1)} />

      <div className="flex flex-wrap items-center gap-1">
        {items.map((item, index) =>
          item === 'ellipsis' ?
            <span key={`ellipsis-${index}`} className="px-1 text-[#9f927d]">
              ...
            </span>
          : <Button
              key={item}
              className={item === currentPage ? '!border-[#82d5bb] !bg-[#e6f9f6] !text-[#117f77] !shadow-[0_2px_0_rgba(90,158,30,0.28)]' : undefined}
              type="default"
              size="small"
              htmlType="button"
              aria-current={item === currentPage ? 'page' : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>,
        )}
      </div>

      <Button type="default" size="small" htmlType="button" disabled={!hasNext} aria-label="下一页" icon={<ChevronRight size={14} strokeWidth={3} />} onClick={() => onPageChange(currentPage + 1)} />

      <div className="flex items-center gap-1">
        <span className="whitespace-nowrap text-[#8a7b66]">跳至</span>
        <Input
          className="w-16 text-center"
          size="small"
          type="number"
          min={1}
          max={pageCount}
          value={jumpValue}
          onChange={(event) => setJumpValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commitJump()
          }}
        />
        <Button type="default" size="small" htmlType="button" onClick={commitJump}>
          GO
        </Button>
      </div>
    </nav>
  )
}
