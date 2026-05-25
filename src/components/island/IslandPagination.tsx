import { Button } from 'animal-island-ui'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

export type IslandPaginationProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  className?: string
  showTotal?: boolean
}

export function IslandPagination({ page, pageSize, total, onPageChange, className, showTotal = true }: IslandPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(Math.max(page, 1), pageCount)
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, total)
  const hasPrev = currentPage > 1
  const hasNext = currentPage < pageCount

  if (total <= pageSize) return null

  return (
    <nav className={cn('flex flex-wrap items-center justify-end gap-2 pt-1 text-xs font-black text-[#725d42]', className)} aria-label="分页">
      {showTotal ? <span className="rounded-full border-2 border-[#c4b89e]/60 bg-[#fff8ec]/70 px-3 py-1 shadow-[0_2px_0_rgba(212,201,180,0.62)]">{start}-{end} / {total}</span> : null}
      <Button
        type="default"
        size="small"
        htmlType="button"
        disabled={!hasPrev}
        aria-label="上一页"
        icon={<ChevronLeft size={14} strokeWidth={3} />}
        onClick={() => onPageChange(currentPage - 1)}
      />
      <span className="min-w-14 rounded-full bg-[#e6f9f6]/80 px-3 py-1 text-center text-[#117f77]">
        {currentPage} / {pageCount}
      </span>
      <Button
        type="default"
        size="small"
        htmlType="button"
        disabled={!hasNext}
        aria-label="下一页"
        icon={<ChevronRight size={14} strokeWidth={3} />}
        onClick={() => onPageChange(currentPage + 1)}
      />
    </nav>
  )
}
